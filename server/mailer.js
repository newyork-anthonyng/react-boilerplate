require("dotenv").config();
const nodemailer = require("nodemailer");
const { APP_URL } = process.env;

const transport = nodemailer.createTransport({
  host: process.env.nodemailer_host,
  port: process.env.nodemailer_port,
  auth: {
    user: process.env.nodemailer_user,
    pass: process.env.nodemailer_password,
  },
});

function sendMail({ email, firstName, token }) {
  const confirmationLink = `${APP_URL}/confirmation/${token}`;

  const message = {
    from: "welcome@earth.com",
    to: email,
    subject: "Welcome | Email Verification 👋",
    html: `<h1>Welcome ${firstName}</h1><p><a href="${confirmationLink}">Click here</a> to finish setting up your account</p>`,
  };

  return new Promise((resolve, reject) => {
    transport.sendMail(message, function (err, info) {
      if (err) {
        reject(err);
      } else {
        resolve(info);
      }
    });
  });
}

function sendResetPassword({ email, firstName, token }) {
  const resetPasswordLink = `${APP_URL}/reset-password/${token}`;

  const message = {
    from: "welcome@earth.com",
    to: email,
    subject: "Password Reset",
    html: `<h1>Hi ${firstName}</h1><p>You requested to reset your password. <a href="${resetPasswordLink}">Click here</a> to finish.</p>`,
  };

  return new Promise((resolve, reject) => {
    transport.sendMail(message, function (err, info) {
      if (err) {
        reject(err);
      } else {
        resolve(info);
      }
    });
  });
}

module.exports = { sendMail, sendResetPassword };
