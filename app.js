const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const session = require("express-session");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcrypt");
const shortid = require("shortid");
const flash = require("connect-flash");
const path = require("path");
require("dotenv").config();

// model Import
const User = require("./models/user");
const Url = require("./models/shortUrl");

const app = express();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

// Set up sessions for authentication
app.use(
  session({
    secret: process.env.SECRET_KEY,
    resave: false,
    saveUninitialized: false,
  })
);

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Initialize Flash Messages
app.use(flash());

// Passport local strategy for authentication
passport.use(
  new LocalStrategy(async (username, password, done) => {
    try {
      const user = await User.findOne({ username });

      if (!user) {
        return done(null, false, { message: "Incorrect username." });
      }

      const isValidPassword = await bcrypt.compare(password, user.password);

      if (!isValidPassword) {
        return done(null, false, { message: "Incorrect password." });
      }

      return done(null, user);
    } catch (error) {
      return done(error);
    }
  })
);

// Passport serialization/deserialization for user sessions
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error);
  }
});

// Serve your HTML views
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.get("/", (req, res) => {
  if (req.isAuthenticated()) {
    res.redirect("/dashboard");
  } else {
    res.render("index", { user: req.user });
  }
});

// Registration form
app.get("/register", (req, res) => {
  res.render("register", { message: req.flash("error") });
});

// Registration POST route
app.post("/register", async (req, res) => {
  const { username, password } = req.body;

  // Check if the user already exists
  const existingUser = await User.findOne({ username });
  if (existingUser) {
    req.flash("error", "Username already exists");
    return res.redirect("/register");
  }

  // Hash the password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create a new user
  const newUser = new User({ username, password: hashedPassword });
  await newUser.save();

  res.redirect("/login");
});

// Login form
app.get("/login", (req, res) => {
  res.render("login", { message: req.flash("error") });
});

// Login POST route
app.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/dashboard",
    failureRedirect: "/login",
    failureFlash: true,
  })
);

// Logout route
app.get("/logout", (req, res) => {
  req.logout((err) => {
    if (err) {
      console.error(err);
    }
    res.redirect("/");
  });
});

// Short url
app.post("/shorten", isAuthenticated, async (req, res) => {
  // console.log(req);
  const { fullUrl, customName } = req.body;
  const isValidCustomName = /^[a-zA-Z0-9]{1,8}$/.test(customName);

  try {
    let shortUrl = "";
    if (isValidCustomName) {
      shortUrl = customName;
    } else {
      shortUrl = shortid.generate();
    }
    const url = new Url({ full: fullUrl, short: shortUrl, user: req.user._id });
    await url.save();
    res.redirect("/dashboard");
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
});

// Dashboard route
app.get("/dashboard", isAuthenticated, async (req, res) => {
  try {
    const urls = await Url.find({ user: req.user._id });
    res.render("dashboard", { user: req.user, urls });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// redirect
app.get("/:shortUrl", async (req, res) => {
  try {
    const urls = await Url.findOne({ short: req.params.shortUrl });
    if (urls == null) return res.sendStatus(404);
    urls.clicks = urls.clicks + 1;
    urls.save();

    res.redirect(urls.full);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Serve static files (CSS, JavaScript, etc.)
app.use(express.static("public"));

// Authentication middleware to protect routes
function isAuthenticated(req, res, next) {
  // console.log(req);
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/login");
}

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
