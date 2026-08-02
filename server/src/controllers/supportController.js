const { notifyAdmins } = require('../utils/notifyAdmins');
const { sendEmail } = require('../services/email');

exports.createSupportMessage = async (req, res, next) => {
  try {
    const { name, email, phone, subject, message, orderNumber, topic } = req.body;

    if (!name || !message) {
      return res.status(400).json({ success: false, message: 'Name and message are required' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email && !emailRegex.test(email)) {
      return res.status(400).json({ success: false, message: 'Invalid email address' });
    }

    const supportEmail = process.env.SUPPORT_EMAIL || process.env.SMTP_USER || 'support@printjack.in';

    const html = `
      <h2>New Support Message Received</h2>
      <div class="info-box">
        <strong>From:</strong> ${name}${phone ? ` (${phone})` : ''}<br>
        <strong>Email:</strong> ${email || 'N/A'}<br>
        ${orderNumber ? `<strong>Order Number:</strong> ${orderNumber}<br>` : ''}
        ${subject ? `<strong>Subject:</strong> ${subject}<br>` : ''}
        ${topic ? `<strong>Topic:</strong> ${topic}<br>` : ''}
      </div>
      <div class="info-box info-box-blue">
        <strong>Message:</strong><br><br>
        ${message.replace(/\n/g, '<br>')}
      </div>
      <p>Please respond to this customer as soon as possible.</p>
    `;

    if (process.env.SMTP_USER) {
      try {
        await sendEmail({
          to: supportEmail,
          subject: `[PrintJack Support] ${subject || 'New message'} from ${name}`,
          html,
        });
      } catch (e) {
        console.error('Support email failed to send:', e.message);
      }
    }

    await notifyAdmins({
      type: 'support',
      title: 'New support message',
      message: `${name}${orderNumber ? ` (Order #${orderNumber})` : ''}: ${(message || '').slice(0, 100)}`,
      data: { kind: 'support', name, email, phone, subject, message, orderNumber, topic },
    });

    res.status(201).json({ success: true, message: 'Message received. We will get back to you shortly.' });
  } catch (err) {
    next(err);
  }
};
