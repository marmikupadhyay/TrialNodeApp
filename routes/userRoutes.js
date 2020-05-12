const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const passport = require("passport");
const { ensureAuthenticated } = require("../config/auth");
const multer = require("multer");
const path = require("path");

const User = require("../models/user");

//Setting up storage
const storage = multer.diskStorage({
  destination: "./public/imgs/",
  filename: (req, file, cb) => {
    cb(null, file.fieldname + "-" + req.user._id + ".png");
  }
});

//INIT Upload
const upload = multer({
  storage: storage,
  limits: { fileSize: 1000000 },
  fileFilter: (req, file, cb) => {
    checkFileType(file, cb);
  }
}).single("profilePhoto");

//Function for file check
checkFileType = (file, cb) => {
  const fileTypes = /jpeg|jpg|png|gif/;
  const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = fileTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb("Error:Images Only");
  }
};

router.get("/login", (req, res) => {
  res.render("login");
});

router.get("/register", (req, res) => {
  res.render("register");
});

router.post("/register", (req, res) => {
  const { name, email, password, password2, gender, phone } = req.body;

  let errors = [];
  if (!name || !email || !password || !password2) {
    errors.push({ msg: "Fill All Fields" });
  }

  if (password !== password2) {
    errors.push({ msg: "Passwords do not Match" });
  }

  if (errors.length > 0) {
    res.render("register", {
      errors,
      name,
      email,
      password,
      password2,
      gender,
      phone
    });
  }

  User.findOne({ email: email }).then(user => {
    if (user) {
      errors.push({ msg: "User Already Exists" });
      res.render("register", {
        errors,
        name,
        email,
        password,
        password2,
        gender,
        phone
      });
    } else {
      const newUser = new User({
        name,
        email,
        password,
        gender,
        phone
      });
      bcrypt.genSalt(10, (errors, salt) => {
        bcrypt.hash(password, salt, (err, hash) => {
          if (err) throw err;
          newUser.password = hash;
          if (newUser.gender == 1) {
            newUser.gender = true;
          } else {
            newUser.gender = false;
          }
          newUser
            .save()
            .then(user => {
              req.flash("success_msg", "You are now registered and can login");
              res.redirect("/users/login");
            })
            .catch(err => {
              console.log(err);
            });
        });
      });
    }
  });
});

router.post("/login", (req, res, next) => {
  passport.authenticate("local", {
    successRedirect: "/dashboard",
    failureRedirect: "/users/login",
    failureFlash: true
  })(req, res, next);
});

router.get("/logout", (req, res) => {
  req.logout();
  req.flash("success_msg", "You are logged out");
  res.redirect("/users/login");
});

router.get("/addMatch/:id", ensureAuthenticated, (req, res) => {
  User.findOneAndUpdate(
    { _id: req.user._id },
    { $push: { matches: req.params.id } },
    { new: true },
    (err, success) => {
      if (err) console.log(err);
    }
  );
  console.log(req.params.id);
  res.redirect("/dashboard");
});
router.get("/removeMatch/:id", ensureAuthenticated, (req, res) => {
  User.findOneAndUpdate(
    { _id: req.user._id },
    { $push: { removedmatches: req.params.id } },
    { new: true },
    (err, success) => {
      if (err) console.log(err);
    }
  );
  console.log(req.params.id);
  res.redirect("/dashboard");
});

router.get("/matches", ensureAuthenticated, (req, res) => {
  User.find({ gender: !req.user.gender }).then(users => {
    res.render("match", { user: req.user, matches: users });
  });
});

router.get("/editProfile", ensureAuthenticated, (req, res) => {
  User.find({ gender: !req.user.gender }).then(users => {
    res.render("editProfile", { user: req.user });
  });
});

router.post("/upload", ensureAuthenticated, (req, res) => {
  var errors = [];
  upload(req, res, err => {
    if (err) {
      errors.push({ msg: err });
      res.render("editProfile", { user: req.user, errors });
    } else {
      if (req.file == undefined) {
        errors.push({ msg: "Please Select Something" });
        res.render("editProfile", { user: req.user, errors });
      } else {
        res.render("editProfile", {
          user: req.user,
          errors
        });
      }
    }
  });
});

module.exports = router;
