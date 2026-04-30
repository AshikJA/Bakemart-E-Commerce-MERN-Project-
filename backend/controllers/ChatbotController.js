const Order = require('../models/OrderModel');
const Product = require('../models/ProductModel');

const GROQ_API_KEY = process.env.GROQ_API_KEY || 'gsk_mock_api_key_here';

// Extract order ID from message
function extractOrderId(message) {
  const patterns = [
    /#([a-f0-9]{8,24})/i,
    /order[^\w]*([a-f0-9]{8,24})/i,
    /([a-f0-9]{8})/i,
  ];
  for (const pattern of patterns) {
    const match = message.match(pattern);
    if (match) return match[1];
  }
  return null;
}

// Detect order-related keywords
function isOrderIntent(message) {
  const keywords = ['order', 'status', 'track', 'where is', 'my order', 'delivery', 'shipped', 'delivered', 'check order', 'order id', 'order number'];
  const lower = message.toLowerCase();
  return keywords.some(k => lower.includes(k));
}

// Detect product-related keywords
function isProductIntent(message) {
  const keywords = ['chocolate', 'cake', 'gift', 'hamper', 'price', 'available', 'in stock', 'product', 'buy', 'purchase'];
  const lower = message.toLowerCase();
  return keywords.some(k => lower.includes(k));
}

// Format order status for display
function formatOrderStatus(order) {
  const statusEmoji = {
    pending: '⏳',
    processing: '🔄',
    shipped: '🚚',
    delivered: '✅',
    cancelled: '❌',
    returned: '↩️',
  };
  
  const emoji = statusEmoji[order.orderStatus] || '📦';
  const shortId = order._id.toString().slice(-8).toUpperCase();
  
  let items = '';
  if (order.items && order.items.length > 0) {
    items = order.items.map(i => `• ${i.name} x${i.quantity} - ₹${i.price}`).join('\n');
  } else if (order.orderItems) {
    items = order.orderItems.map(i => `• ${i.name} x${i.qty || i.quantity} - ₹${i.price}`).join('\n');
  }

  return `${emoji} **Order #${shortId}**

**Status:** ${order.orderStatus?.charAt(0).toUpperCase() + order.orderStatus?.slice(1) || 'Unknown'}
**Payment:** ${order.isPaid ? '✅ Paid' : '❌ Not Paid'}
**Total:** ₹${order.totalPrice || order.totalAmount || 0}
${order.orderStatus === 'shipped' ? '🚚 Your order is on the way!' : ''}
${order.orderStatus === 'delivered' ? '✅ Delivered! Enjoy your treats!' : ''}
${order.orderStatus === 'pending' ? '⏳ Your order is being processed.' : ''}`;
}

// Format product info for display
function formatProduct(product) {
  return `🍫 **${product.name}**

**Price:** ₹${product.price}
**Category:** ${product.category || 'General'}
**Stock:** ${product.stock > 0 ? `✅ Available (${product.stock} left)` : '❌ Out of Stock'}
${product.description ? `**Description:** ${product.description}` : ''}`;
}

const SYSTEM_PROMPT = `You are BakeMart customer support assistant.

IMPORTANT RULES:
1. Only use information explicitly provided in [brackets] or [parentheses] in the user's message
2. NEVER make up order details, products, or delivery times
3. If info is not provided, say "I don't have that information"
4. Use Indian Rupees (₹) for prices
5. Keep responses under 80 words

Shop info:
- Online store for chocolates, gift hampers, cakes
- Free delivery on orders above ₹500, else ₹100
- 7 days return policy
- Payment: UPI, Cards, Netbanking, COD
- Email: Bakemartsullia123@gmail.com

When user asks about order status, use ONLY the data provided in [Order Info] section.`;

class ChatbotController {
  static async chatbotReply(req, res) {
    try {
      const { message, userId } = req.body;

      if (!message || !message.trim()) {
        return res.status(400).json({ error: 'Message is required' });
      }

      let contextMessage = message;
      let dbResults = null;

      // Check if it's an order query
      const orderId = extractOrderId(message);
      let orderNotFound = false;
      
      if (orderId) {
        try {
          let order = null;
          
          // Search ALL orders and find by short ID (last 8 chars)
          const allOrders = await Order.find({}).lean();
          order = allOrders.find(o => o._id.toString().slice(-8).toUpperCase() === orderId.toUpperCase());
          
          console.log('Searching for order ID:', orderId);
          console.log('Found orders count:', allOrders.length);
          
          // If still not found, try finding my last order
          if (!order && (isOrderIntent(message) || message.toLowerCase().includes('my order'))) {
            const query = userId ? { user: userId } : {};
            order = await Order.findOne(query).sort({ createdAt: -1 }).lean();
          }

          if (order) {
            const orderInfo = formatOrderStatus(order);
            console.log('Found order:', order._id, 'Status:', order.orderStatus);
            
            // Return order data directly without calling AI
            return res.json({ 
              reply: orderInfo + "\n\nAnything else I can help with? 🍫", 
              type: 'order' 
            });
          } else if (orderId) {
            // Order ID found but order not in DB - return error
            return res.json({ 
              reply: "I couldn't find an order with that ID. Please check your order number and try again.\n\nAnything else I can help with? 🍫", 
              type: 'error' 
            });
          } else {
            orderNotFound = true;
            console.log('Order not found:', orderId);
          }
        } catch (err) {
          console.error('Order lookup error:', err);
          orderNotFound = true;
        }
      }

      // Check if it's a product query
      if (!dbResults && isProductIntent(message)) {
        try {
          // Extract potential product name from message
          const productKeywords = message.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/);
          const searchTerms = productKeywords.filter(w => w.length > 3).slice(0, 3);
          
          if (searchTerms.length > 0) {
            const products = await Product.find({
              $or: [
                { name: { $regex: searchTerms.join('|'), $options: 'i' } },
                { category: { $regex: searchTerms.join('|'), $options: 'i' } }
              ]
            }).limit(3).lean();

            if (products.length > 0) {
              const productList = products.map(p => formatProduct(p)).join('\n\n---\n\n');
              dbResults = { type: 'product', data: productList };
              contextMessage = `${message}\n\n[Products Found]:\n${productList}`;
            }
          }
        } catch (err) {
          console.error('Product lookup error:', err);
        }
      }

      // Try to get most recent order if user says "my order" without ID
      if (!dbResults && (message.toLowerCase().includes('my order') || message.toLowerCase().includes('last order'))) {
        try {
          const query = userId ? { user: userId } : {};
          const lastOrder = await Order.findOne(query).sort({ createdAt: -1 }).lean();
          
          if (lastOrder) {
            dbResults = { type: 'order', data: formatOrderStatus(lastOrder) };
            contextMessage = `${message}\n\n[Latest Order]: ${formatOrderStatus(lastOrder)}`;
          }
        } catch (err) {
          console.error('Last order lookup error:', err);
        }
      }

      // Check for common queries first (work with or without API key)
      const lowerMsg = message.toLowerCase();
      
      if (!dbResults) {
        if (lowerMsg.includes('delivery') || lowerMsg.includes('shipping') || lowerMsg.includes('delivery charge')) {
          return res.json({ 
            reply: "🚚 **Delivery Info**\n\n• Free delivery on orders above ₹500\n• ₹100 delivery charge below ₹500\n• Delivery within 3-5 business days\n\nNeed anything else? 🍫", 
            type: 'info' 
          });
        }
        if (lowerMsg.includes('return') || lowerMsg.includes('refund')) {
          return res.json({ 
            reply: "↩️ **Return Policy**\n\n• 7 days return window\n• Items must be unused and in original packaging\n• Refund to original payment method or wallet\n\nNeed anything else? 🍫", 
            type: 'info' 
          });
        }
        if (lowerMsg.includes('payment')) {
          return res.json({ 
            reply: "💳 **Payment Options**\n\n• UPI (Google Pay, PhonePe, Paytm)\n• Credit/Debit Cards\n• Net Banking\n• Cash on Delivery (COD)\n\nAll payments are secure! 🔒", 
            type: 'info' 
          });
        }
      }

      // Call Groq API
      const isMockKey = GROQ_API_KEY === 'gsk_mock_api_key_here' || !GROQ_API_KEY;
      
      if (isMockKey) {
        // Return DB results or greeting without Groq API
        if (dbResults) {
          return res.json({ reply: dbResults.data, type: dbResults.type });
        }
        
        return res.json({ 
          reply: "👋 Hi! I'm your BakeMart assistant!\n\nI can help you with:\n• 🍫 Product info & recommendations\n• 📦 Order tracking (share your Order ID)\n• 🚚 Delivery info\n• ↩️ Returns & refunds\n• 💳 Payment options\n\nWhat can I help you with today?", 
          type: 'greeting' 
        });
      }

      // Groq API call using fetch
      const requestBody = {
        model: 'llama-3.1-8b-instant',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: contextMessage }
        ],
        max_tokens: 800,
        temperature: 0.5,
      };
      
      console.log('Chatbot request - model:', requestBody.model, 'key:', GROQ_API_KEY?.slice(0, 8));
      
      const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${GROQ_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!groqResponse.ok) {
        const errorText = await groqResponse.text();
        console.error('Groq API error:', groqResponse.status, errorText);
        return res.json({ reply: dbResults?.data || "I'm having trouble connecting right now. Please try again!", type: dbResults?.type || 'error' });
      }

      const groqData = await groqResponse.json();
      console.log('Groq response:', JSON.stringify(groqData).slice(0, 200));
      const reply = groqData.choices?.[0]?.message?.content?.trim() || "I'm sorry, I couldn't process that. Please try again!";

      return res.json({ 
        reply: reply + "\n\nAnything else I can help with? 🍫", 
        type: dbResults?.type || 'text' 
      });

    } catch (error) {
      console.error('Chatbot error:', error);
      return res.status(500).json({ 
        reply: "Sorry, I encountered an issue. Please try again in a moment! 🙏\n\nYou can also email us at Bakemartsullia123@gmail.com", 
        type: 'error' 
      });
    }
  }
}

module.exports = ChatbotController;
