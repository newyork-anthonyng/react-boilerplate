jest.mock("nodemailer");
const nodemailer = require("nodemailer");

describe("mailer", () => {
  const mockMailer = {
    sendMail: jest.fn((message, cb) => {
      cb(null, {});
    }),
  };
  nodemailer.createTransport.mockImplementation(() => mockMailer);
  const { sendMail, sendResetPassword } = require("./mailer");

  beforeEach(() => {
    mockMailer.sendMail.mockClear();
  });

  it("should send correct verification email", async () => {
    await sendMail({
      email: "johndoe@gmail.com",
      firstName: "John",
      token: "some-token",
    });

    expect(mockMailer.sendMail).toHaveBeenCalledTimes(1);
    expect(mockMailer.sendMail.mock.calls[0][0]).toMatchInlineSnapshot(`
      Object {
        "from": "welcome@earth.com",
        "html": "<h1>Welcome John</h1><p><a href=\\"localhost:3000/confirmation/some-token\\">Click here</a> to finish setting up your account</p>",
        "subject": "Welcome | Email Verification 👋",
        "to": "johndoe@gmail.com",
      }
    `);
  });

  it("should send correct Reset Password email", async () => {
    await sendResetPassword({
      email: "johndoe@gmail.com",
      firstName: "John",
      token: "some-token",
    });

    expect(mockMailer.sendMail).toHaveBeenCalledTimes(1);
    expect(mockMailer.sendMail.mock.calls[0][0]).toMatchInlineSnapshot(`
      Object {
        "from": "welcome@earth.com",
        "html": "<h1>Hi John</h1><p>You requested to reset your password. <a href=\\"localhost:3000/reset-password/some-token\\">Click here</a> to finish.</p>",
        "subject": "Password Reset",
        "to": "johndoe@gmail.com",
      }
    `);
    nodemailer.createTransport.mockReset();
  });
});

describe("sendResetPassword", () => {});
