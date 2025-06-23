import nodemailer from "nodemailer";

const testAccount = await nodemailer.createTestAccount();

const transporter = nodemailer.createTransport({
  host: "smtp.ethereal.email",
  port: 587,
  auth: {
    user: "keshaun74@ethereal.email",
    pass: "5m8PxpAn2uxTCcjs47",
  },
});

export const sendEmail = async ({ to, subject, html }) => {
  const mailOptions = {
    from: testAccount.user,
    to,
    subject,
    html,
  };

  const info = await transporter.sendMail(mailOptions);
  const testEmailURL = nodemailer.getTestMessageUrl(info);
  console.log(testEmailURL);
};
