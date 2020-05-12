const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const mongoose = require("mongoose");
const session = require("express-session");
const flash = require("connect-flash");
const app = express();
const passport = require("passport");
const path = require("path");

//PORT
const PORT = process.env.PORT || 5000;
app.use(express.static(path.join(__dirname, "public")));
//Connecting to database
mongoose.connect("mongodb://localhost/authApp", {
  useUnifiedTopology: true,
  useNewUrlParser: true
});
let db = mongoose.connection;

db.once("open", () => {
  console.log("Connected To Database");
});

db.on("error", err => {
  console.log(err);
});

//Passport
require("./config/passport")(passport);

//EJS

app.use(expressLayouts);
app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: false }));

// Express session
app.use(
  session({
    secret: "secret",
    resave: true,
    saveUninitialized: true
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.use(flash());

app.use(function (req, res, next) {
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  res.locals.error = req.flash("error");
  next();
});

//ROUTES

app.use("/", require("./routes/indexRoutes"));
app.use("/users", require("./routes/userRoutes"));
app.listen(PORT, console.log(`The Server Started on PORT:${PORT}`));
