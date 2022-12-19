const User = require("../models/userModels");
const nodemailer = require("nodemailer");
const session = require("express-session");

const userHome = (req, res) => {
  if (req.session.auth) {
    res.render("user/partials/homepage");
  } else {
    res.redirect("/login");
  }
};

const userLogin = (req, res) => {
  if (req.session.auth) {
    res.redirect("/");
  } else {
    res.render("user/partials/userLogin", {
      error: "Enter your email and Password",
    });
  }
};

const userVerification = async (req, res) => {
  try {
    const inputEmail = req.body.email;
    const password = req.body.password;
    const userDB = await User.findOne({ email: inputEmail });
    if (userDB.status == true) {
      const match = await bcrypt.compare(password, userDB.password);
      if (match) {
        req.session.auth = password;
        res.redirect("/");
      } else {
        res.render("user/partials/userLogin", {
          error: "Invalid Password",
        });
      }
    } else {
      res.render("user/partials/userLogin", {
        error: "User not found",
      });
    }
  } catch (err) {
    console.log(" User verification error: " + err.message);
    res.render("user/partials/userLogin", {
      error: "Invalid Credentials",
    });
  }
};

const userSignUp = (req, res) => {
  res.render("user/partials/signUp", {
    error: "Please Login to Enjoy Our Products.",
  });
};

var userData;

const bcrypt = require("bcrypt");
const checkSignUp = async (req, res) => {
  let user;

  const email = req.body.email;

  user = await User.findOne({ email: email });

  if (user) {
    res.render("user/partials/signUp", { error: "Email Already Exists." });
  } else {
    const hashPassword = await bcrypt.hash(req.body.password, 10);

    const otp = Math.floor(Math.random() * 1000000 + 1);
    // const authPassword = "icnzdiqbjvqrydak";
    req.session.authOTP = otp;

    userData = new User({
      fname: req.body.fname,
      email: req.body.email,
      mobile: req.body.mobile,
      password: hashPassword,
      status: true,
    });

    // email
    var transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "amarnathchakkiyar@gmail.com",
        pass: "icnzdiqbjvqrydak",
      },
    });

    var mailOptions = {
      from: "amarnathchakkiyar@gmail.com",
      to: req.body.email,
      subject: "YOUR OTP",
      //   text: `enterotp`
      html: `<h3>Your OTP is here<h3> <br> <p>${otp}</p>`,
    };

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log("Email sent: " + info.response);
        res.render("user/partials/verifyOTP", {
          error: "Please Enter the OTP.",
        });

        // req.session.email = req.body.email;
        // req.session.fname = req.body.fname;
        // req.session.password = hashPassword;
      }
    });
  }
};

const otpVerify = (req, res) => {
  if (req.session.authOTP == req.body.otp) {
    userData.save();

    req.session.destroy();
    res.redirect("/login");

    console.log(req.session.authOTP);
  } else {
    res.render("user/partials/verifyOTP", { error: "Incorrect OTP" });
  }
};

module.exports = {
  userHome,
  userLogin,
  userSignUp,
  checkSignUp,
  otpVerify,
  userVerification,
};
