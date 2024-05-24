const MongoDB_URI_1 =
  "mongodb+srv://mannuarya2002:manishmongo@cluster0.kquyzjn.mongodb.net/";

const MongoDB_URI_2 =
  "mongodb+srv://abhijeetsinghrana2003:mongoDBaBHI5@cluster0.dxdvwer.mongodb.net/";

EMAIL_USER = "mannuarya2002@gmail.com";

EMAIL_PASS = "whrb cqwb rsep cgyq";

const nodemailer = require("nodemailer");

const verifyEmail = async (email, token) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com", // Corrected the host
    port: 587,
    auth: {
      user: "mannuarya2002@gmail.com",
      pass: "whrb cqwb rsep cgyq",
    },
  });

  const frontendLink = `https://9000-idx-qr-service-x-1716379111013.cluster-fu5knmr55rd44vy7k7pxk74ams.cloudworkstations.dev/verify-email?token=${token}`;

  //update it with your frontend link an add this line at last /verify-email?token=${token}

  const mailOptions = {
    from: "mannuarya2002@gmail.com",
    to: email,
    subject: "Email Verification - Your Application",
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
        <h2 style="color: #333;">Email Verification Required</h2>
        <p>Hello,</p>
        <p>Thank you for registering with our service. To complete your registration, please verify your email address by clicking the button below:</p>
        <p style="text-align: center;">
          <a href=${frontendLink} style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Verify Email</a>
        </p>
        <p>If the button above does not work, copy and paste the following URL into your web browser:</p>
        <p style="word-break: break-all;">${frontendLink}</p>
        <p>Thank you!</p>
        <p>The Your Application Team</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Error sending email:", error);
  }
};

module.exports = verifyEmail;
