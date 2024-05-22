const nodemailer = require("nodemailer");

const verifyEmail = async (to, subject, text) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "mannuarya2002@gmail.com",
      pass: "whrb cqwb rsep cgyq",
    },
  });

  const mailOptions = {
    from: "mannuarya2002@gmail.com",
    to: email,
    subject: "Email Verification",
    text: `Please verify your email by clicking on the following link: \nhttp://${process.env.CLIENT_URL}/verify-email?token=${token}`,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Error sending email:", error);
  }
};


module.exports = verifyEmail;
