const nodemailer = require("nodemailer");

const transport = nodemailer.createTransport({
  host: "smtp.mailtrap.io",
  port: 2525,
  auth: {
    user: process.env.nodemailer_user,
    pass: process.env.nodemailer_password,
  },
});

function sendMail({ email, firstName, token }) {
  const confirmationLink = `localhost:3000/confirmation/${token}`;

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

module.exports = sendMail;
