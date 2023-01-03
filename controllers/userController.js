const User = require("../models/userModels");
const Category = require("../models/categoryModel");
const Product = require("../models/productModel");
const Wishlist = require("../models/wishlistModel");
const Cart = require("../models/cartModel");
const nodemailer = require("nodemailer");
const session = require("express-session");
const Banner = require("../models/bannerModel");
const mongoose = require('mongoose')

const userHome = async (req, res) => {
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
    wishData,
  });
};

const userLogin = (req, res) => {
  res.render("user/partials/userLogin", {
    error: "Enter your email and Password",
    wishData: null,
  });
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
    console.log(otp);
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
    const newCart = await new Cart({ customer: userData._id });
    await newCart.save();
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
  let search = "";
  if (req.query.id) {
    const categoryDetails = await Category.findOne({ _id: req.query.id });
    const categoryName = categoryDetails.name;
    const categoryData = await Category.find({ status: true });

    const colorData = await Product.find({ status: true });

    const email = req.session.auth;
    const userDetails = await User.findOne({ email: email });
    const wishData = await Wishlist.findOne({
      customer: userDetails._id,
    }).populate("products");

    var perPage = 6;
    var page = req.query.page || 1;

    Product.find({ category: req.query.id })
      .skip(perPage * page - perPage)
      .limit(perPage)
      .exec(function (err, products) {
        Product.count().exec(function (err, count) {
          if (err) return next(err);

          res.render("user/partials/product", {
            product: products,
            shop: "active",
            colors: colorData,
            category: categoryName,
            categories: categoryData,
            wishData,
            current: page,
            pages: Math.ceil(count / perPage),
          });
        });
      });
  } else if (req.query.idPro) {
    const productColor = await Product.findOne({ _id: req.query.idPro });
    const colorName = productColor.color;
    const categoryData = await Category.find({ status: true });

    const colorData = await Product.find({ status: true });

    const email = req.session.auth;
    const userDetails = await User.findOne({ email: email });
    const wishData = await Wishlist.findOne({
      customer: userDetails._id,
    }).populate("products");

    var perPage = 6;
    var page = req.query.page || 1;

    Product.find({ _id: req.query.idPro })
      .skip(perPage * page - perPage)
      .limit(perPage)
      .exec(function (err, products) {
        Product.count().exec(function (err, count) {
          if (err) return next(err);

          res.render("user/partials/product", {
            product: products,
            categories: categoryData,
            category: colorName,
            colors: colorData,
            shop: "active",
            wishData,
            current: page,
            pages: Math.ceil(count / perPage),
          });
        });
      });
  } else if (req.query.idStock == "inStock") {
    const colorName = "In stock";
    const categoryData = await Category.find({ status: true });

    const colorData = await Product.find({ status: true });

    const email = req.session.auth;
    const userDetails = await User.findOne({ email: email });
    const wishData = await Wishlist.findOne({
      customer: userDetails._id,
    }).populate("products");

    var perPage = 6;
    var page = req.query.page || 1;

    Product.find({ stock: { $gt: 0 } })
      .skip(perPage * page - perPage)
      .limit(perPage)
      .exec(function (err, products) {
        Product.count().exec(function (err, count) {
          if (err) return next(err);

          res.render("user/partials/product", {
            product: products,
            categories: categoryData,
            category: colorName,
            colors: colorData,
            shop: "active",
            wishData,
            current: page,
            pages: Math.ceil(count / perPage),
          });
        });
      });
  } else if (req.query.idStock == "outStock") {
    const colorName = "Out stock";

    const colorData = await Product.find({ status: true });

    const email = req.session.auth;
    const userDetails = await User.findOne({ email: email });
    const wishData = await Wishlist.findOne({
      customer: userDetails._id,
    }).populate("products");

    const categoryData = await Category.find({ status: true });
    Product.find({ stock: 0 })
      .skip(perPage * page - perPage)
      .limit(perPage)
      .exec(function (err, products) {
        var perPage = 6;
        var page = req.query.page || 1;

        Product.count().exec(function (err, count) {
          if (err) return next(err);

          res.render("user/partials/product", {
            product: products,
            categories: categoryData,
            category: colorName,
            colors: colorData,
            shop: "active",
            wishData,
            current: page,
            pages: Math.ceil(count / perPage),
          });
        });
      });
  } else if (req.query.search) {
    const search = req.query.search;
    const categoryData = await Category.find({ status: true });

    const colorData = await Product.find({ status: true });

    const email = req.session.auth;
    const userDetails = await User.findOne({ email: email });
    const wishData = await Wishlist.findOne({
      customer: userDetails._id,
    }).populate("products");

    var perPage = 6;
    var page = req.query.page || 1;

    Product.find({
      status: true,
      $or: [
        { name: { $regex: "." + search + ".*", $options: "i" } },

        { model: { $regex: "." + search + ".*", $options: "i" } },
      ],
    })
      .skip(perPage * page - perPage)
      .limit(perPage)
      .exec(function (err, products) {
        Product.count().exec(function (err, count) {
          if (err) return next(err);

          res.render("user/partials/product", {
            product: products,
            categories: categoryData,
            category: "Search :" + search,
            colors: colorData,
            shop: "active",
            wishData,
            current: page,
            pages: Math.ceil(count / perPage),
          });
        });
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

    var perPage = 6;
    var page = req.query.page || 1;

    Product.find({ status: true })
      .skip(perPage * page - perPage)
      .limit(perPage)
      .exec(function (err, products) {
        Product.count().exec(function (err, count) {
          if (err) return next(err);

          res.render("user/partials/product", {
            product: products,
            categories: categoryData,
            shop: "active",
            colors: colorData,
            wishData,
            current: page,
            pages: Math.ceil(count / perPage),
          });
        });
      });
  }
};

const productDetails = async (req, res) => {
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

    res.render("user/partials/productDetails", {
      products: productImage,
      others: productDetails,
      wishDetails,
      wishData,
    });
  }
};

const wishListPage = async (req, res) => {
  const email = req.session.auth;
  const userDetails = await User.findOne({ email: email });
  const wishData = await Wishlist.findOne({
    customer: userDetails._id,
  }).populate("products");

  res.render("user/partials/wishlist", { wishData });
};

const addWishList = async (req, res) => {
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
};

const removeWishList = async (req, res) => {
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
};

const cartPage = async (req, res) => {
  const email = req.session.auth;
  const userDetails = await User.findOne({ email: email });
  const wishData = await Wishlist.findOne({
    customer: userDetails._id,
  }).populate("products");

  const proimg = await Cart.findOne({ customer: userDetails._id }).populate(
    "products.productId"
  );

  console.log(proimg);

  res.render("user/partials/cart", {
    cartList: proimg,
    wishData,
  });
};


//dstatatatatatatatatatattatatatatatattatatatatatatattaat

const addCart = async (req, res) => {
  const email = req.session.auth;
  const userDetails = await User.findOne({ email: email });


  let userCart = await Cart.findOne({ customer : userDetails._id });


  let itemIndex = userCart.products.findIndex((products) => {
    return products.productId == req.query.id;
  });

  if (itemIndex > -1) {
    //-1 if no item matches

    let a = await Cart.updateOne(
      { customer: userDetails._id , "products.productId": req.query.id },
      {
        $inc: { "products.$.quantity": 1 },
      }
    );
  } else {
    await Cart.updateOne(
      { customer: userDetails._id },
      {
        $push: { products: { productId: req.query.id, quantity: 1 } },
      }
    );
  }

  res.redirect("/cart");
};

const removeCart = async (req, res) => {
  const email = req.session.auth;
  const userDetails = await User.findOne({ email: email });
  
  
  const qtyChech = await Cart.aggregate([
      {
        $match: { "products.productId": mongoose.Types.ObjectId(req.query.id) },
      },
      { $unwind: "$products" },
      {
        $match: { "products.productId": mongoose.Types.ObjectId(req.query.id) },
      },
      { $project: { "products.quantity": 1, _id: 0 } },
    ]);
    let productqty = parseInt(qtyChech[0].products.quantity);
  
    if (productqty - 1 <= 0) {
      await Cart.updateOne(
        { customer : userDetails._id },
        { $pull: { products : { productId: req.query.id } } }
      );
    } else {
      let a = await Cart.updateOne(
        { customer: userDetails._id, "products.productId": req.query.id },
        {
          $inc: { "products.$.quantity": -1 },
        }
      );
    }

  
  res.redirect("/cart");
};



const incrimentQuantity= async (req, res)=> {
  const email = req.session.auth;
  const userDetails = await User.findOne({ email: email });
 
  let a = await Cart.updateOne(
    { customer: userDetails._id, "products.productId": req.query.id },
    {
      $inc: { "products.$.quantity": 1 },
    }
  );

  // res.redirect('/cartpage')
  res.redirect("/cart");
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
  productPage,
  productDetails,
  wishListPage,
  addWishList,
  removeWishList,
  cartPage,
  addCart,
  incrimentQuantity,
  removeCart
};
