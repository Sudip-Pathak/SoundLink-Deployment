import "dotenv/config";
import nodemailer from "nodemailer";

async function testEmail() {
  console.log("Testing email with:");
  console.log("SMTP_HOST:", process.env.SMTP_HOST);
  console.log("SMTP_PORT:", process.env.SMTP_PORT);
  console.log("SMTP_SECURE:", process.env.SMTP_SECURE);
  console.log("SMTP_USER:", process.env.SMTP_USER);
  console.log("SMTP_PASS length:", process.env.SMTP_PASS ? process.env.SMTP_PASS.length : 0);

  const transporterConfig = process.env.SMTP_HOST === 'smtp.gmail.com' 
    ? {
        service: 'gmail',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        }
      }
    : {
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        secure: process.env.SMTP_SECURE === "true",
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      };

  console.log("Config:", JSON.stringify({ ...transporterConfig, auth: { user: process.env.SMTP_USER, pass: "***" } }, null, 2));

  const transporter = nodemailer.createTransport(transporterConfig);

  try {
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: process.env.SMTP_USER, // send to self
      subject: "Test Email from SoundLink",
      text: "If you get this, Nodemailer is working!"
    });
    console.log("SUCCESS! Email sent:", info.messageId);
  } catch (err) {
    console.error("FAILED! Error details:");
    console.error(err);
  }
}

testEmail();
