const PDFDocument = require('pdfkit');
const Order = require('../models/OrderModel');

const getInvoicePDF = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id).populate('user', 'name email phone');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const isOwner = order.user._id.toString() === req.userId;
    const isAdmin = req.tokenType === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'Not authorized to access this invoice' });
    }

    if (order.paymentStatus !== 'paid') {
      return res.status(400).json({ message: 'Invoice not available - order payment not completed' });
    }

    const doc = new PDFDocument({ margin: 50 });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=BakeMart-Invoice-${order._id}.pdf`
    );

    doc.pipe(res);

    doc.fontSize(24).fillColor('#6B3F1F').font('Helvetica-Bold').text('BakeMart', { align: 'center' });
    doc.moveDown(0.3);
    doc.fontSize(10).fillColor('#666666').font('Helvetica').text('Bakemartsullia123@gmail.com', { align: 'center' });
    doc.text('+91 94838 01700', { align: 'center' });
    doc.text('Sullia, Karnataka, India', { align: 'center' });

    doc.moveDown(1);
    doc.moveTo(50, doc.y).lineTo(560, doc.y).stroke('#D4A96A');
    doc.moveDown(1);

    doc.fontSize(18).fillColor('#6B3F1F').font('Helvetica-Bold').text('INVOICE', { align: 'center' });
    doc.moveDown(0.5);

    const shortId = order._id.toString().slice(-8).toUpperCase();
    doc.fontSize(11).fillColor('#333333').font('Helvetica');
    doc.text(`Invoice #: ORD-${shortId}`, { align: 'center' });
    doc.text(`Date: ${new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}`, { align: 'center' });
    doc.text(`Payment: ${order.paymentMethod}`, { align: 'center' });

    doc.moveDown(1);
    doc.moveTo(50, doc.y).lineTo(560, doc.y).stroke('#D4A96A');
    doc.moveDown(1);

    doc.fontSize(12).fillColor('#6B3F1F').font('Helvetica-Bold').text('Bill To:', { align: 'left' });
    doc.fontSize(11).fillColor('#333333').font('Helvetica');
    doc.text(order.shippingAddress?.name || order.user.name || 'N/A');
    const addressLines = [
      order.shippingAddress?.street,
      order.shippingAddress?.city,
      order.shippingAddress?.state,
      order.shippingAddress?.pincode
    ].filter(Boolean).join(', ');
    doc.text(addressLines || 'N/A');
    doc.text(order.shippingAddress?.phoneNumber || order.user.phone || 'N/A');

    doc.moveDown(1);
    doc.moveTo(50, doc.y).lineTo(560, doc.y).stroke('#D4A96A');
    doc.moveDown(1);

    doc.fontSize(12).fillColor('#6B3F1F').font('Helvetica-Bold').text('Items', { underline: true });
    doc.moveDown(0.5);

    const tableTop = doc.y;
    const col1 = 50;
    const col2 = 150;
    const col3 = 350;
    const col4 = 480;

    doc.fontSize(10).fillColor('#666666').font('Helvetica-Bold');
    doc.text('#', col1, tableTop);
    doc.text('Product', col2, tableTop);
    doc.text('Qty', col3, tableTop);
    doc.text('Price', col4, tableTop);

    doc.moveTo(50, tableTop + 15).lineTo(560, tableTop + 15).stroke('#E5E5E5');

    let y = tableTop + 25;
    order.items.forEach((item, index) => {
      doc.fontSize(10).fillColor('#333333').font('Helvetica');
      doc.text(String(index + 1), col1, y);
      
      const itemName = item.name.length > 25 ? item.name.substring(0, 25) + '...' : item.name;
      doc.text(itemName, col2, y);
      doc.text(String(item.quantity), col3, y);
      doc.text(`₹${item.price * item.quantity}`, col4, y);
      
      y += 20;
    });

    doc.moveTo(50, y).lineTo(560, y).stroke('#E5E5E5');
    y += 15;

    const subtotalY = y;
    doc.fontSize(11).font('Helvetica').fillColor('#666666');
    doc.text('Subtotal:', 350, subtotalY);
    doc.text(`₹${order.subtotal}`, 480, subtotalY);

    const shippingCost = order.subtotal > 499 ? 0 : 99;
    const shippingLabel = shippingCost === 0 ? 'FREE' : `₹${shippingCost}`;
    doc.text('Shipping:', 350, subtotalY + 18);
    doc.text(shippingLabel, 480, subtotalY + 18);

    doc.moveTo(340, subtotalY + 35).lineTo(560, subtotalY + 35).stroke('#D4A96A');
    
    doc.fontSize(12).font('Helvetica-Bold').fillColor('#6B3F1F');
    doc.text('TOTAL:', 350, subtotalY + 45);
    doc.text(`₹${order.totalAmount}`, 480, subtotalY + 45);

    doc.moveDown(3);
    doc.moveTo(50, doc.y).lineTo(560, doc.y).stroke('#D4A96A');
    doc.moveDown(1);

    doc.fontSize(10).fillColor('#666666').font('Helvetica').text('Thank you for shopping with BakeMart!', { align: 'center' });
    doc.text('🍫', { align: 'center' });

    doc.end();
  } catch (error) {
    console.error('Invoice generation error:', error);
    res.status(500).json({ message: 'Failed to generate invoice' });
  }
};

module.exports = { getInvoicePDF };