var express = require('express');
var router = express.Router();

const User = require("../models/user")
const Message = require("../models/message")
const bcrypt = require("bcryptjs")
const passport = require("passport")
const asyncHandler = require('express-async-handler')
const { body, validationResult } = require("express-validator");


/* GET home page. */
router.get('/', async (req, res, next) => {
  const allMessages = await Message.find().sort({ date: 1 }).exec();

  res.render('index', { 
    title: 'Messages',
    user: req.user,
    messages: allMessages
  });
});

router.get('/log-in', async (req, res) => {
  res.render("log-in", {
    title: "Log in",
    errorMessage: ""
  })
})

router.post('/log-in', function(req, res, next) {
  passport.authenticate('local', function(err, user, info) {
    if (err) { return next(err); }
    if (!user) { 
      return res.render('log-in', { 
        title: "Log in",
        errorMessage: 'Invalid username or password' 
      });
    }
    req.logIn(user, function(err) {
      if (err) { return next(err); }
      return res.redirect('/');
    });
  })(req, res, next);
});

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
    title: "Sign Up",
    userInfo: null,
    errors: []
  })
})

router.post('/sign-up', [
  body("username", "Email is required")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("password", "Password is required")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("confirmpassword", "Confirm Password is required")
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Password confirmation does not match password');
      }
      return true;
    })
    .escape(),
  body("firstname", "First name is required")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("lastname", "Last name is required")
    .trim()
    .isLength({ min: 1 })
    .escape(),

    asyncHandler(async (req, res, next) => {
    const errors = validationResult(req)

    const userInfo = {
      username: req.body.username,
      firstname: req.body.firstname,
      lastname: req.body.lastname,
    }

    if (!errors.isEmpty()) {
      res.render("sign-up", {
        title: "Sign Up",
        userInfo: userInfo,
        errors: errors.array()
      })
      return
    }

    const userExists = await User.findOne({ username: req.body.username }).exec()
    if (userExists) {
      res.render("sign-up", {
        title: "Sign Up",
        userInfo: userInfo,
        errors: [{msg:"Email already in use"}]
      })
      return
    }

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
])

router.get('/post-message', async (req, res) => {
  res.render("post-message", {
    title: "Post Message",
    user: req.user,
    errors: []
  })
})

router.post('/post-message', async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    
    const message = new Message({
      user: user.firstname + " " + user.lastname,
      date: new Date(),
      text: req.body.message
    })

    const result = await message.save()
    res.redirect("/")    
  } catch (err) {
    return next(err)
  }  
})

router.post('/make-member', async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (req.body.password === "47") {
      user.member = true;
  
      await user.save()
  
      res.redirect("/post-message")
    } else {
      res.redirect("/post-message")
    }
  } catch (err) {
    return next(err)
  }  
})

module.exports = router;
