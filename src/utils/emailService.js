const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false, // true for 465
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

const sendResetEmail = async (to, resetLink) => {
    const mailOptions = {
        from: `"FoodApp" <${process.env.EMAIL_USER}>`,
        to,
        subject: 'Password Reset Request',
        html: `
            <h2>Reset Your Password</h2>
            <p>You requested a password reset. Click the link below to set a new password:</p>
            <a href="${resetLink}" target="_blank">${resetLink}</a>
            <p>This link expires in 1 hour.</p>
            <p>If you didn't request this, ignore this email.</p>
        `,
    };
    await transporter.sendMail(mailOptions);
};

module.exports = { sendResetEmail };