import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "externalkey7@gmail.com",
    pass: process.env.GMAIL_APP_PASS,
  },
});

const sendMail = async ({ to, subject, text, html }) => {
  const info = await transporter.sendMail({
    from: '"Realtime Chat App" <externalkey7@gmail.com>',
    to,
    subject,
    text,
    html,
  });

  return info;
};

export default sendMail;
