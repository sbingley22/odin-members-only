var express = require('express');
var router = express.Router();

const User = require("../models/user")
const bcrypt = require("bcryptjs")
const passport = require("passport")

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { 
    title: 'Messages',
    user: req.user
  });
});

router.get('/log-in', async (req, res) => {
  res.render("log-in", {
    title: "Log in"
  })
})

router.post('/log-in', passport.authenticate("local", {
  successRedirect: "/",
  failureRedirect: "/log-in"
}))

router.get("/log-out", async (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err)
    }
    res.redirect("/")
  })
})

router.get('/sign-up', async (req, res) => {
  res.render("sign-up", {
    title: "Sign Up"
  })
})

router.post('/sign-up', async (req, res, next) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10)
    const user = new User({
      username: req.body.username,
      password: hashedPassword,
      firstname: req.body.firstname,
      lastname: req.body.lastname,
      member: false
    })
    const result = await user.save()
    res.redirect("/")
  } catch(err) {
    return next(err)
  }
})

module.exports = router;
