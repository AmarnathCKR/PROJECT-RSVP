const User = require("../models/userModels");
const Category = require("../models/categoryModel");
const Product = require("../models/productModel");
const Wishlist = require("../models/wishlistModel");
const nodemailer = require("nodemailer");
const session = require("express-session");
const Banner = require("../models/bannerModel");

const userHome = async (req, res) => {
  if (req.session.auth) {
    const categoryData = await Category.find({ status: true });
    const banners = await Banner.find({ status: true });
    const email = req.session.auth;
    const userDetails = await User.findOne({ email: email });
    const wishData = await Wishlist.findOne({
      customer: userDetails._id,
    }).populate("products");
    res.render("user/partials/homepage", {
      details: banners,
      categories: categoryData,
      home: "active",
      wishData
    });
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
      wishData: null,
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
        req.session.auth = inputEmail;
        res.redirect("/");
      } else {
        res.render("user/partials/userLogin", {
          error: "Invalid Password",
          wishData: null,
        });
      }
    } else {
      res.render("user/partials/userLogin", {
        error: "User not found",
        wishData: null,
      });
    }
  } catch (err) {
    console.log(" User verification error: " + err.message);
    res.render("user/partials/userLogin", {
      error: "Invalid Credentials",
      wishData: null,
    });
  }
};

const userSignUp = (req, res) => {
  res.render("user/partials/signUp", {
    error: "Please Login to Enjoy Our Products.",
    wishData: null,
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
    res.render("user/partials/signUp", {
      error: "Email Already Exists.",
      wishData: null,
    });
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

const otpVerify = async (req, res) => {
  if (req.session.authOTP == req.body.otp) {
    userData.save();

    const newWishList = await new Wishlist({ customer: userData._id });
    await newWishList.save();

    req.session.authOTP = false;
    req.session.emailOTP = false;
    res.redirect("/login");

    console.log(req.session.authOTP);
  } else {
    res.render("user/partials/verifyOTP", {
      error: "Incorrect OTP",
      wishData: null,
    });
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
    res.render("user/partials/verifyOTP", { wishData: null });
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
  res.render("user/partials/forgotPassword", { wishData: null });
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
      res.render("user/partials/forgotPassword", {
        error: "User is blocked.",
        wishData: null,
      });
    }
  } else {
    res.render("user/partials/forgotPassword", {
      error: "Email does not exit.Please sign up",
      wishData: null,
    });
  }
};

const verifyEmailPage = (req, res) => {
  if (req.session.emailOtp || req.session.resendEmailOtp) {
    res.render("user/partials/verifyEmailOTP", { wishData: null });
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
  if (
    req.session.emailOtp == req.body.otp ||
    req.session.resendEmailOtp == req.body.otp
  ) {
    res.redirect("/new-password");

    console.log(req.session.emailOtp);
    console.log(req.session.resendEmailOtp);
  } else {
    res.render("user/partials/verifyEmailOTP", {
      error: "Incorrect OTP",
      wishData: null,
    });
  }
};

const newPassword = (req, res) => {
  if (req.session.emailOtp || req.session.resendEmailOtp) {
    res.render("user/partials/newPassword", { wishData: null });
  }
};

const submitPassword = async (req, res) => {
  if (req.session.emailOtp || req.session.resendEmailOtp) {
    if (req.body.password == req.body.conPassword) {
      const hashedPassword = await bcrypt.hash(req.body.password, 10);
      const passwordData = await User.findOne({ email: req.session.emailAuth });

      const match = await bcrypt.compare(
        req.body.password,
        passwordData.password
      );
      if (match) {
        res.render("user/partials/newPassword", {
          error: "Cannot use previous password.",
          wishData: null,
        });
      } else {
        const updatePassword = await User.updateOne(
          { email: req.session.emailAuth },
          {
            $set: {
              password: hashedPassword,
            },
          }
        );

        res.redirect("/");
      }
    } else {
      res.render("user/partials/newPassword", {
        error: "Password Does Not Match",
        wishData: null,
      });
    }
  }
};

//product page

const productPage = async (req, res) => {
  if (req.session.auth) {
    if (req.query.id) {
      const categoryDetails = await Category.findOne({ _id: req.query.id });
      const categoryName = categoryDetails.name;
      const categoryData = await Category.find({ status: true });
      const productDetails = await Product.find({ category: req.query.id });
      const colorData = await Product.find({ status: true });

      const email = req.session.auth;
      const userDetails = await User.findOne({ email: email });
      const wishData = await Wishlist.findOne({
        customer: userDetails._id,
      }).populate("products");

      res.render("user/partials/product", {
        product: productDetails,
        shop: "active",
        colors: colorData,
        category: categoryName,
        categories: categoryData,
        wishData,
      });
    } else if (req.query.idPro) {
      const productColor = await Product.findOne({ _id: req.query.idPro });
      const colorName = productColor.color;
      const categoryData = await Category.find({ status: true });
      const productData = await Product.find({ _id: req.query.idPro });
      const colorData = await Product.find({ status: true });

      const email = req.session.auth;
      const userDetails = await User.findOne({ email: email });
      const wishData = await Wishlist.findOne({
        customer: userDetails._id,
      }).populate("products");
      res.render("user/partials/product", {
        product: productData,
        categories: categoryData,
        category: colorName,
        colors: colorData,
        shop: "active",
        wishData,
      });
    } else if (req.query.idStock == "inStock") {
      const colorName = "In stock";
      const categoryData = await Category.find({ status: true });
      const productData = await Product.find({ stock: { $gt: 0 } });
      const colorData = await Product.find({ status: true });

      const email = req.session.auth;
      const userDetails = await User.findOne({ email: email });
      const wishData = await Wishlist.findOne({
        customer: userDetails._id,
      }).populate("products");
      res.render("user/partials/product", {
        product: productData,
        categories: categoryData,
        category: colorName,
        colors: colorData,
        shop: "active",
        wishData,
      });
    } else if (req.query.idStock == "outStock") {
      const colorName = "Out stock";
      const categoryData = await Category.find({ status: true });
      const productData = await Product.find({ stock: 0 });
      const colorData = await Product.find({ status: true });

      const email = req.session.auth;
      const userDetails = await User.findOne({ email: email });
      const wishData = await Wishlist.findOne({
        customer: userDetails._id,
      }).populate("products");
      res.render("user/partials/product", {
        product: productData,
        categories: categoryData,
        category: colorName,
        colors: colorData,
        shop: "active",
        wishData,
      });
    } else {
      const categoryData = await Category.find({ status: true });
      const productData = await Product.find({ status: true });
      const colorData = await Product.find({ status: true });

      const email = req.session.auth;
      const userDetails = await User.findOne({ email: email });
      const wishData = await Wishlist.findOne({
        customer: userDetails._id,
      }).populate("products");
      res.render("user/partials/product", {
        product: productData,
        categories: categoryData,
        shop: "active",
        colors: colorData,
        wishData,
      });
    }
  } else {
    res.redirect("/login");
  }
};

const productDetails = async (req, res) => {
  if (req.session.auth) {
    if (req.query.id) {
      const productDetails = await Product.findById(req.query.id).populate(
        "category"
      );
      const email = req.session.auth;
      const userDetails = await User.findOne({ email: email });
      const wishDetails = await Wishlist.findOne({
        customer: userDetails._id,
        products: req.query.id,
      }).populate("products");

      const wishData = await Wishlist.findOne({
        customer: userDetails._id,
      }).populate("products");

      const productImage = productDetails.image;
      console.log(productImage);
      res.render("user/partials/productDetails", {
        products: productImage,
        others: productDetails,
        wishDetails,
        wishData
      });
    }
  } else {
    res.redirect("/login");
  }
};

const wishListPage = async (req, res) => {
  if (req.session.auth) {
    const email = req.session.auth;
    const userDetails = await User.findOne({ email: email });
    const wishData = await Wishlist.findOne({
      customer: userDetails._id,
    }).populate("products");

    res.render("user/partials/wishlist", { wishData });
  } else {
    res.redirect("/login");
  }
};

const addWishList = async (req, res) => {
  if (req.session.auth) {
    if (req.query.id) {
      const email = req.session.auth;
      const userDetails = await User.findOne({ email: email });

      const wishData = await Wishlist.findOne({
        customer: userDetails._id,
      }).populate("products");

      await Wishlist.updateOne(
        { customer: userDetails._id },
        {
          $push: {
            products: [req.query.id],
          },
        }
      );
      res.redirect("/product-page/?id=" + req.query.id);
    }
  } else {
    res.redirect("/login");
  }
};

const removeWishList = async (req, res) => {
  if (req.session.auth) {
    if (req.query.id) {
      const email = req.session.auth;
      const userDetails = await User.findOne({ email: email });

      await Wishlist.updateOne(
        { customer: userDetails._id },
        {
          $pull: {
            products: req.query.id,
          },
        }
      );
      res.redirect("/product-page/?id=" + req.query.id);
    }
  } else {
    res.redirect("/login");
  }
};

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
  productPage,
  productDetails,
  wishListPage,
  addWishList,
  removeWishList,
};
