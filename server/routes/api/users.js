const mongoose = require("mongoose");
const passport = require("passport");
const router = require("express").Router();
const auth = require("../auth");
const Users = mongoose.model("Users");
const passwordChecker = require("owasp-password-strength-test");

router.post("/", auth.optional, async (req, res) => {
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

  const existingUser = await Users.findOne({ email: user.email });
  if (existingUser) {
    return res.status(422).json({
      errors: {
        email: "is taken",
      },
    });
  }

  const finalUser = new Users(user);
  finalUser.setPassword(user.password);

  return finalUser
    .save()
    .then(() => res.json({ user: finalUser.toAuthJSON() }));
});

router.post("/login", auth.optional, (req, res, next) => {
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

  return passport.authenticate(
    "local",
    { session: false },
    (err, passportUser, info) => {
      if (err) {
        return next(err);
      }

      if (passportUser) {
        const user = passportUser;
        user.token = passportUser.generateJWT();

        return res.json({ user: user.toAuthJSON() });
      }

      return res.status(400).json(info);
    }
  )(req, res, next);
});

router.get("/current", auth.required, async (req, res) => {
  const {
    payload: { id },
  } = req;

  const user = await Users.findById(id);
  if (!user) {
    return res.sendStatus(400);
  }

  return res.json({ user: user.toAuthJSON() });
});

module.exports = router;
