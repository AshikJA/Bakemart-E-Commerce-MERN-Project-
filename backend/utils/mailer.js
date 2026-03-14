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

module.exports = { sendOtpEmail, sendPasswordResetEmail };