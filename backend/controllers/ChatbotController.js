const OpenAI = require('openai');
const Order = require('../models/OrderModel');
const Product = require('../models/ProductModel');

let openai = null;

function getOpenAI() {
  if (!openai && process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your_openai_api_key_here') {
    openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return openai;
}

// Extract MongoDB ObjectId from message
function extractOrderId(message) {
  const patterns = [
    /#([a-f0-9]{24})/i,
    /order[^\w]*([a-f0-9]{24})/i,
    /([a-f0-9]{24})/i,
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

const SYSTEM_PROMPT = `You are BakeMart customer support assistant 🍫

Your personality:
- Warm, friendly, and helpful
- Short and concise responses
- Use Indian Rupees (₹) for all prices
- Always be positive and enthusiastic about products

About BakeMart:
- Indian online store for chocolates, gift hampers, cake supplies
- Free delivery on orders above ₹500
- Delivery charge: ₹100 below ₹500
- 7 days return policy
- Payment options: Razorpay, UPI, Cards, Netbanking, COD
- Support email: Bakemartsullia123@gmail.com

You can help with:
- Order status queries
- Product information and recommendations
- Delivery and shipping info
- Returns and refunds
- Payment related questions

When providing order info, use the data given to you. Be specific with order numbers, amounts, and status.

Keep responses under 100 words. Always end with an offer to help further.`;

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
      if (orderId) {
        try {
          let order = await Order.findById(orderId).lean();
          
          // If not found by ID, try to find by user's orders
          if (!order && userId) {
            const userOrders = await Order.find({ user: userId }).lean();
            order = userOrders.find(o => o._id.toString().slice(-8).toUpperCase() === orderId.toUpperCase());
          }

          // Try finding most recent order if user wants "my order"
          if (!order && isOrderIntent(message)) {
            const query = userId ? { user: userId } : {};
            order = await Order.findOne(query).sort({ createdAt: -1 }).lean();
          }

          if (order) {
            dbResults = { type: 'order', data: formatOrderStatus(order) };
            contextMessage = `${message}\n\n[Order Info]: ${formatOrderStatus(order)}`;
          }
        } catch (err) {
          console.error('Order lookup error:', err);
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

      // Call OpenAI
      const client = getOpenAI();
      
      if (!client) {
        // Fallback responses without OpenAI
        if (dbResults) {
          return res.json({ reply: dbResults.data, type: dbResults.type });
        }
        
        // Default fallback
        const lowerMsg = message.toLowerCase();
        if (lowerMsg.includes('delivery') || lowerMsg.includes('shipping')) {
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
        
        return res.json({ 
          reply: "👋 Hi! I'm your BakeMart assistant!\n\nI can help you with:\n• 🍫 Product info & recommendations\n• 📦 Order tracking (share your Order ID)\n• 🚚 Delivery info\n• ↩️ Returns & refunds\n• 💳 Payment options\n\nWhat can I help you with today?", 
          type: 'greeting' 
        });
      }

      // OpenAI is available - make the API call
      const completion = await client.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: contextMessage }
        ],
        max_tokens: 300,
        temperature: 0.7,
      });

      const reply = completion.choices[0]?.message?.content?.trim() || "I'm sorry, I couldn't process that. Please try again!";

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
