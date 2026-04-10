const nodemailer = require('nodemailer');
const config = require('../config/config')

const transporter = nodemailer.createTransport({
  host: config.SMTP_HOST,
  port: Number(config.SMTP_PORT) || 465,
  secure: true,
  auth: {
    user: config.SMTP_USER,
    pass: config.SMTP_PASS,
  },
});

function sendOtpEmail(to, otp) {
  const mailOptions = {
    from: config.SMTP_FROM || config.SMTP_USER,
    to,
    subject: 'Your verification code',
    text: `Your verification code is ${otp}. It will expire in 10 minutes.`,
    html: `<p>Your verification code is <strong>${otp}</strong>. It will expire in 10 minutes.</p>`,
  };

  return transporter.sendMail(mailOptions);
}

function sendPasswordResetEmail(to, resetLink) {
  const mailOptions = {
    from: config.SMTP_FROM || config.SMTP_USER,
    to,
    subject: 'Reset your password',
    text: `You requested a password reset. Click this link to reset your password: ${resetLink}`,
    html: `<p>You requested a password reset.</p>
           <p>Click this link to reset your password:</p>
           <p><a href="${resetLink}">${resetLink}</a></p>
           <p>If you did not request this, you can ignore this email.</p>`,
  };

  return transporter.sendMail(mailOptions);
}

function sendRefundEmail(to, amount, refundId) {
  const mailOptions = {
    from: config.SMTP_FROM || config.SMTP_USER,
    to,
    subject: '💰 Refund Initiated - BakeMart',
    html: `
      <h2>Refund Initiated</h2>
      <p>Your refund of <strong>₹${amount}</strong> has been initiated.</p>
      <p><strong>Refund ID:</strong> ${refundId}</p>
      <p>The amount will reflect in your original payment method in 5-7 business days.</p>
      <p>Thank you for shopping with BakeMart!</p>
    `,
  };

  return transporter.sendMail(mailOptions);
}

function sendRefundSuccessEmail(to, amount, refundId) {
  const mailOptions = {
    from: config.SMTP_FROM || config.SMTP_USER,
    to,
    subject: '✅ Refund Processed - BakeMart',
    html: `
      <h2>Refund Processed Successfully</h2>
      <p>Your refund of <strong>₹${amount}</strong> has been processed successfully.</p>
      <p><strong>Refund ID:</strong> ${refundId}</p>
      <p>Please check your bank statement/original payment method.</p>
    `,
  };

  return transporter.sendMail(mailOptions);
}

function sendRefundToWalletEmail(to, amount, newBalance, orderId) {
  const mailOptions = {
    from: config.SMTP_FROM || config.SMTP_USER,
    to,
    subject: `💰 ₹${amount} Credited to Your BakeMart Wallet!`,
    html: `
      <h2>Refund Credited to Wallet</h2>
      <p>Your refund for <strong>Order #${orderId}</strong> has been credited to your wallet.</p>
      <p><strong>Amount Credited:</strong> ₹${amount}</p>
      <p><strong>New Wallet Balance:</strong> ₹${newBalance}</p>
      <div style="margin-top: 20px;">
        <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/shop" style="background-color: #6B3F1F; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">Shop Now & Use Wallet</a>
      </div>
    `,
  };

  return transporter.sendMail(mailOptions);
}

function sendRefundChoiceEmail(to, amount, orderId) {
  const mailOptions = {
    from: config.SMTP_FROM || config.SMTP_USER,
    to,
    subject: '🔄 Choose Your Refund Method - BakeMart',
    html: `
      <h2>Your Return is Approved!</h2>
      <p>The return for <strong>Order #${orderId}</strong> has been approved.</p>
      <p>Since this was a COD order, please choose how you would like to receive your refund of <strong>₹${amount}</strong>:</p>
      <div style="margin-top: 20px;">
        <p>1. <strong>BakeMart Wallet (Instant)</strong></p>
        <p>2. <strong>Bank Transfer (5-7 business days)</strong></p>
        <p>Please log in to your account and go to "My Orders" to select your preference.</p>
        <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/view-orders" style="background-color: #6B3F1F; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">Choose Refund Method</a>
      </div>
    `,
  };

  return transporter.sendMail(mailOptions);
}

function sendBankRefundEmail(to, amount, orderId) {
  const mailOptions = {
    from: config.SMTP_FROM || config.SMTP_USER,
    to,
    subject: '🏦 Bank Refund Initiated - BakeMart',
    html: `
      <h2>Bank Refund Initiated</h2>
      <p>Your bank refund of <strong>₹${amount}</strong> for <strong>Order #${orderId}</strong> has been initiated.</p>
      <p>The amount will reflect in your provided bank account in <strong>5-7 business days</strong>.</p>
      <p>Please ensure the bank details you provided are correct. If there is any issue, our support team will contact you.</p>
    `,
  };

  return transporter.sendMail(mailOptions);
}

module.exports = { 
  sendOtpEmail, 
  sendPasswordResetEmail, 
  sendRefundEmail, 
  sendRefundSuccessEmail,
  sendRefundToWalletEmail,
  sendRefundChoiceEmail,
  sendBankRefundEmail
};