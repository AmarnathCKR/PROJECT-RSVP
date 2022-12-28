const User = require("../models/userModels");
const Category = require("../models/categoryModel");
const Product = require("../models/productModel");
const nodemailer = require("nodemailer");
const session = require("express-session");

const userHome =async (req, res) => {
  if (req.session.auth) {
    const categoryData = await Category.find({status :true})
    const products = await Product.find({status : true})
    res.render("user/partials/homepage",{details: products, categories: categoryData,home : "active"});
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
let otpSentTime;
let counter = 0;

const bcrypt = require("bcrypt");
const { find } = require("../models/userModels");
const checkSignUp = async (req, res) => {
  let user;

  req.session.emailOTP = req.body.email;
  user = await User.findOne({ email: req.session.emailOTP });

  if (user) {
    res.render("user/partials/signUp", { error: "Email Already Exists." });
  } else {
    const hashPassword = await bcrypt.hash(req.body.password, 10);

    const otp = Math.floor(Math.random() * 1000000 + 1);
    // const authPassword = "icnzdiqbjvqrydak";
    req.session.authOTP = otp;
    setTimeout(() => {
      req.session.authOTP = false;
      console.log("OTP Expired");
    }, 180000);

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
        res.redirect("/verifyOTP");

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

    req.session.authOTP = false;
    req.session.emailOTP = false;
    res.redirect("/login");

    console.log(req.session.authOTP);
  } else {
    res.render("user/partials/verifyOTP", { error: "Incorrect OTP" });
  }
};

const userLogout = (req, res) => {
  if (req.session.auth) {
    req.session.auth = false;
    res.redirect("/login");
  }
};

const otpVerifyPage = (req, res) => {
  if (req.session.authOTP) {
    res.render("user/partials/verifyOTP");
  }
};

const resendOTP = (req, res) => {
  const otp = Math.floor(Math.random() * 1000000 + 1);
  // const authPassword = "icnzdiqbjvqrydak";
  req.session.authOTP = otp;

  setTimeout(() => {
    req.session.authOTP = false;
    console.log("Resend OTP Expired");
  }, 180000);

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
    to: req.session.emailOTP,
    subject: "YOUR OTP",
    //   text: `enterotp`
    html: `<h3>Your OTP is here<h3> <br> <p>${otp}</p>`,
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log("Email sent: " + info.response);
      console.log("Nre OTP : " + otp);
      res.redirect("/verifyOTP");

      // req.session.email = req.body.email;
      // req.session.fname = req.body.fname;
      // req.session.password = hashPassword;
    }
  });

  res.redirect("/verifyOTP");
};

const forgotPassword = (req, res) => {
  res.render("user/partials/forgotPassword");
};

const sendEmail = async (req, res) => {
  let user;

  req.session.emailAuth = req.body.email;
  user = await User.findOne({ email: req.session.emailAuth });

  if (user) {
    if (user.status == true) {
      const otp = Math.floor(Math.random() * 1000000 + 1);
      // const authPassword = "icnzdiqbjvqrydak";
      req.session.emailOtp = otp;
      setTimeout(() => {
        req.session.emailOtp = false;
        console.log("OTP Expired");
      }, 180000);

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
          res.redirect("/verifyEmail");

          // req.session.email = req.body.email;
          // req.session.fname = req.body.fname;
          // req.session.password = hashPassword;
        }
      });
    } else {
      res.render("user/partials/forgotPassword", { error: "User is blocked." });
    }
  } else {
    res.render("user/partials/forgotPassword", {
      error: "Email does not exit.Please sign up",
    });
  }
};

const verifyEmailPage = (req, res) => {
  if (req.session.emailOtp||req.session.resendEmailOtp) {
    res.render("user/partials/verifyEmailOTP");
  }
};

const resendEmail = (req, res) => {
  const otp = Math.floor(Math.random() * 1000000 + 1);
  // const authPassword = "icnzdiqbjvqrydak";
  req.session.resendEmailOtp = otp;

  setTimeout(() => {
    req.session.resendEmailOtp = false;
    console.log("Resend OTP Expired");
  }, 180000);

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
    to: req.session.emailAuth,
    subject: "YOUR OTP",
    //   text: `enterotp`
    html: `<h3>Your OTP is here<h3> <br> <p>${otp}</p>`,
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log("Email sent: " + info.response);
      console.log("New OTP : " + otp);
      res.redirect("/verifyEmail");

      // req.session.email = req.body.email;
      // req.session.fname = req.body.fname;
      // req.session.password = hashPassword;
    }
  });

  
};

const verifyEmailOTP = (req, res) => {
  console.log(req.session.emailOtp);
    console.log(req.session.resendEmailOtp);
  if (req.session.emailOtp == req.body.otp || req.session.resendEmailOtp == req.body.otp) {
    res.redirect("/new-password");

    console.log(req.session.emailOtp);
    console.log(req.session.resendEmailOtp);
  } else {
    res.render("user/partials/verifyEmailOTP", { error: "Incorrect OTP" });
  }
};

const newPassword = (req, res) => {
  if (req.session.emailOtp || req.session.resendEmailOtp) {
    res.render("user/partials/newPassword")
}
}

const submitPassword =async (req,res) =>{
  if (req.session.emailOtp ||req.session.resendEmailOtp) {
    if(req.body.password==req.body.conPassword){
      const hashedPassword = await bcrypt.hash(req.body.password, 10);
      const passwordData = await User.findOne(
        { email : req.session.emailAuth },
      )
      
      const match = await bcrypt.compare(req.body.password, passwordData.password);
        if(match){
          res.render("user/partials/newPassword",{error : "Cannot use previous password."})
        }else{
          
          const updatePassword = await User.updateOne(
            { email: req.session.emailAuth },
            {
              $set: {
                password : hashedPassword
              }
            }
          );

          res.redirect('/')
        }
        
      
    }else{
      res.render("user/partials/newPassword",{error : "Password Does Not Match"})
    }
  }
}


//product page

const productPage = async (req,res)=>{
  if (req.session.auth) {
    if(req.query.id){
      const categoryDetails = await Category.findOne({_id : req.query.id})
      const categoryName = categoryDetails.name
      console.log(categoryName)
      const productDetails = await Product.find({category : req.query.id})
      res.render('user/partials/product',{product : productDetails,  shop : "active",category :  categoryName})


   }else{
    const categoryData = await Category.find({status : true})
    const productData = await Product.find({status : true})

    res.render('user/partials/product',{product : productData, categories : categoryData, shop : "active"})
  }
  } else {
    res.redirect('/login')
  }
}





module.exports = {
  userHome,
  userLogin,
  userSignUp,
  checkSignUp,
  otpVerify,
  userVerification,
  userLogout,
  otpVerifyPage,
  resendOTP,
  forgotPassword,
  sendEmail,
  verifyEmailPage,
  resendEmail,
  verifyEmailOTP,
  newPassword,
  submitPassword,
  productPage
};
