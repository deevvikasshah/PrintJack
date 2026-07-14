const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: Number(process.env.SMTP_PORT) === 465,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

transporter.verify((err) => {
  if (err) {
    console.error("SMTP connection verification failed:", err.message);
  } else {
    console.log("SMTP server is ready to send emails");
  }
});

module.exports = transporter;
