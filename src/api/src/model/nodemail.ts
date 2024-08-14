import NodeMailer from "nodemailer"

const EmailTransporter = NodeMailer.createTransport({
  host: "localhost",
  port: 465,
  secure: true,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASSWORD
  }
});

export default EmailTransporter;
