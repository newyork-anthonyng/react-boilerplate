const mongoose = require("mongoose");
const router = require("express").Router();
const addUserMiddleware = require("../auth");
const Users = mongoose.model("Users");
const VerificationTokens = mongoose.model("VerificationTokens");
const passwordChecker = require("owasp-password-strength-test");

router.post("/", async (req, res) => {
  console.log("post create new user");
  // console.log(req.body);
  // return res.json({});
  try {
    const {
      body: { user },
    } = req;

    if (!user.email) {
      return res.status(422).json({
        errors: {
          email: "is required",
        },
      });
    }

    if (!user.firstName) {
      return res.status(422).json({
        errors: {
          firstName: "is required",
        },
      });
    }

    if (!user.lastName) {
      return res.status(422).json({
        errors: {
          lastName: "is required",
        },
      });
    }

    if (!user.password) {
      return res.status(422).json({
        errors: {
          password: ["is required"],
        },
      });
    }

    const passwordTestResult = passwordChecker.test(user.password);
    const isPasswordWeak = passwordTestResult.errors.length > 0;
    if (isPasswordWeak) {
      return res.status(422).json({
        errors: {
          password: passwordTestResult.errors,
        },
      });
    }

    console.log("getting existing user");
    const existingUser = await Users.findOne({ email: user.email });
    console.log("existing user", existingUser);
    if (existingUser) {
      return res.status(422).json({
        errors: {
          email: "is taken",
        },
      });
    }

    console.log("creating new user");
    const finalUser = new Users(user);
    console.log("setting password");
    finalUser.setPassword(user.password);

    try {
      console.log("saving user");
      await finalUser.save();

      console.log("creating verification token");
      const verificationToken = new VerificationTokens({
        _userId: finalUser._id,
      });
      console.log("saving verification token");
      await verificationToken.save();
      console.log("sending email");
      await finalUser.sendEmail(verificationToken.token);

      res.json({ status: "ok" });
    } catch (e) {
      res.status(500).json({ error: JSON.stringify(e) });
    }
  } catch (e) {
    console.error("there was an error!!!");
    console.error(e);
  }
});

router.post("/confirmation", async (req, res) => {
  const {
    body: { token },
  } = req;

  try {
    const verificationToken = await VerificationTokens.findOne({ token });
    if (!verificationToken) {
      return res.status(400).json({ error: "Token not found" });
    }
    const user = await Users.findOne({ _id: verificationToken._userId });
    if (!user) {
      return res.status(400).json({ error: "User not found" });
    }

    if (user.isVerified) {
      return res.status(400).json({ error: "User already verified" });
    }

    user.isVerified = true;
    await user.save();
    await VerificationTokens.findByIdAndDelete(verificationToken.id);
    return res.status(200).json({ status: "ok" });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: JSON.stringify(e) });
  }
});

router.post("/resend-token", async (req, res) => {
  const {
    body: { email },
  } = req;

  try {
    const user = await Users.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }
    if (user.isVerified) {
      return res.status(400).json({ message: "User already verified" });
    }
    await VerificationTokens.findOneAndDelete({ _userId: user._id });

    const verificationToken = new VerificationTokens({ _userId: user._id });
    await verificationToken.save();
    await user.sendEmail(verificationToken.token);
    res.json({ status: "ok" });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: JSON.stringify(e) });
  }
});

router.post("/login", async (req, res) => {
  const {
    body: { user },
  } = req;

  if (!user.email) {
    return res.status(422).json({
      errors: {
        email: "is required",
      },
    });
  }

  if (!user.password) {
    return res.status(422).json({
      errors: {
        password: "is required",
      },
    });
  }

  const foundUser = await Users.findOne({ email: user.email });
  const isValidUser = foundUser && foundUser.validatePassword(user.password);
  if (!isValidUser) {
    return res.status(422).json({
      errors: {
        email: "Email/password combination is invalid",
      },
    });
  }

  if (!foundUser.isVerified) {
    return res.status(401).json({
      errors: { verified: "user not verified" },
    });
  }

  return res.json({
    user: {
      id: foundUser._id,
      email: foundUser.email,
      token: foundUser.generateJWT(),
      refreshToken: foundUser.generateRefreshToken(),
    },
  });
});

router.get("/me", addUserMiddleware, async (req, res) => {
  if (!req.user) {
    return res.status(400).json({ errors: "Token expired" });
  }

  const user = await Users.findById(req.user.id);

  if (user) {
    return res.json({
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    });
  } else {
    return res.status(400).json({
      errors: "User not found",
    });
  }
});

module.exports = router;
