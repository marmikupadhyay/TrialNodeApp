const express = require("express");
const router = express.Router();
const { ensureAuthenticated } = require("../config/auth");
router.get("/", (req, res) => {
  res.render("welcome");
});
const User = require("../models/user");
router.get("/dashboard", ensureAuthenticated, (req, res) => {
  User.find({ gender: !req.user.gender }).then(users => {
    res.render("profile", { user: req.user, matches: users });
  });
});

module.exports = router;
