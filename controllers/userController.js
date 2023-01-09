const User = require("../models/userModels");
const Category = require("../models/categoryModel");
const Product = require("../models/productModel");
const Wishlist = require("../models/wishlistModel");
const Cart = require("../models/cartModel");
const nodemailer = require("nodemailer");
const session = require("express-session");
const Banner = require("../models/bannerModel");
const mongoose = require("mongoose");
const Coupon = require('../models/couponModel')

const userHome = async (req, res) => {
  try {
    const categoryData = await Category.find({ status: true });
    const banners = await Banner.find({ status: true });
    let usersession = req.session.auth;

    if (usersession) {
      let userDat = await User.findOne({ email: usersession });
      const wishData = await Wishlist.findOne({ customer: userDat._id });

      res.render("user/partials/homepage", {
        details: banners,
        categories: categoryData,
        home: "active",
        wishData,
        usersession,
      });
    } else {
      res.render("user/partials/homepage", {
        details: banners,
        categories: categoryData,
        home: "active",
        wishData: null,
        usersession,
      });
    }
  } catch (err) {
    console.log(err);
  }
};

const userLogin = (req, res) => {
  try {
    res.render("user/partials/userLogin", {
      error: "Enter your email and Password",
      wishData: null,
      usersession: req.session.auth,
    });
  } catch (err) {
    console.log(err);
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
          usersession: req.session.auth,
        });
      }
    } else {
      res.render("user/partials/userLogin", {
        error: "User not found",
        wishData: null,
        usersession: req.session.auth,
      });
    }
  } catch (err) {
    console.log(" User verification error: " + err.message);
    res.render("user/partials/userLogin", {
      error: "Invalid Credentials",
      wishData: null,
      usersession: req.session.auth,
    });
  }
};

const userSignUp = (req, res) => {
  try {
    res.render("user/partials/signUp", {
      error: "Please Login to Enjoy Our Products.",
      wishData: null,
      usersession: req.session.auth,
    });
  } catch (err) {
    console.log(err);
  }
};

var userData;

const bcrypt = require("bcrypt");
const { find } = require("../models/userModels");

const checkSignUp = async (req, res) => {
  let user;
  try {
    req.session.emailOTP = req.body.email;
    user = await User.findOne({ email: req.session.emailOTP });

    if (user) {
      res.render("user/partials/signUp", {
        error: "Email Already Exists.",
        wishData: null,
        usersession: req.session.auth,
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
  } catch (err) {
    console.log(err);
  }
};

const otpVerify = async (req, res) => {
  try {
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
        usersession: req.session.auth,
      });
    }
  } catch (err) {
    console.log(err);
  }
};

const userLogout = (req, res) => {
  try {
    if (req.session.auth) {
      req.session.auth = false;
      res.redirect("/login");
    }
  } catch (err) {
    console.log(err);
  }
};

const otpVerifyPage = (req, res) => {
  try {
    if (req.session.authOTP) {
      res.render("user/partials/verifyOTP", {
        wishData: null,
        usersession: req.session.auth,
      });
    }
  } catch (err) {
    console.log(err);
  }
};

const resendOTP = (req, res) => {
  try {
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
  } catch (err) {
    console.log(err);
  }
};

const forgotPassword = (req, res) => {
  try {
    res.render("user/partials/forgotPassword", {
      wishData: null,
      usersession: req.session.auth,
    });
  } catch (err) {
    console.log(err);
  }
};

const sendEmail = async (req, res) => {
  let user;
  try {
    req.session.emailAuth = req.body.email;
    user = await User.findOne({
      email: req.session.emailAuth,
      usersession: req.session.auth,
    });

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
          usersession: req.session.auth,
        });
      }
    } else {
      res.render("user/partials/forgotPassword", {
        error: "Email does not exit.Please sign up",
        wishData: null,
        usersession: req.session.auth,
      });
    }
  } catch (err) {
    console.log(err);
  }
};

const verifyEmailPage = (req, res) => {
  try {
    if (req.session.emailOtp || req.session.resendEmailOtp) {
      res.render("user/partials/verifyEmailOTP", {
        wishData: null,
        usersession: req.session.auth,
      });
    }
  } catch (err) {
    console.log(err);
  }
};

const resendEmail = (req, res) => {
  try {
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
  } catch (err) {
    console.log(err);
  }
};

const verifyEmailOTP = (req, res) => {
  try {
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
        usersession: req.session.auth,
      });
    }
  } catch (err) {
    console.log(err);
  }
};

const newPassword = (req, res) => {
  try {
    if (req.session.emailOtp || req.session.resendEmailOtp) {
      res.render("user/partials/newPassword", {
        wishData: null,
        usersession: req.session.auth,
      });
    }
  } catch (err) {
    console.log(err);
  }
};

const submitPassword = async (req, res) => {
  try {
    if (req.session.emailOtp || req.session.resendEmailOtp) {
      if (req.body.password == req.body.conPassword) {
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        const passwordData = await User.findOne({
          email: req.session.emailAuth,
        });

        const match = await bcrypt.compare(
          req.body.password,
          passwordData.password
        );
        if (match) {
          res.render("user/partials/newPassword", {
            error: "Cannot use previous password.",
            wishData: null,
            usersession: req.session.auth,
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
          usersession: req.session.auth,
        });
      }
    }
  } catch (err) {
    console.log(err);
  }
};

//product page

const productPage = async (req, res) => {
  try {
    if (req.query.search != null) {
      let search = req.query.search;
      const categoryData = await Category.find({ status: true });

      const colorData = await Product.find({ status: true });

      const email = req.session.auth;
      const userDetails = await User.findOne({ email: email });
      const wishData = await Wishlist.findOne({
        customer: userDetails._id,
      }).populate("products");

      var perPage = 6;
      var pages = req.query.page || 1;

      Product.find({
        status: true,
        $or: [
          { name: { $regex: "." + search + ".*", $options: "i" } },

          { model: { $regex: "." + search + ".*", $options: "i" } },
        ],
      })
        .skip(perPage * pages - perPage)
        .limit(perPage)
        .exec(function (err, products) {
          Product.count().exec(function (err, count) {
            if (err) return next(err);

            res.render("user/partials/product", {
              product: products,
              categories: categoryData,
              category: "",
              colors: colorData,
              shop: "active",
              wishData,
              current: pages,
              pages: Math.ceil(count / perPage),
              usersession: req.session.auth,
            });
          });
        });
    } else {
      const categoryData = await Category.find({ status: true });

      const colorData = await Product.find({ status: true });

      const email = req.session.auth;
      const userDetails = await User.findOne({ email: email });
      const wishData = await Wishlist.findOne({
        customer: userDetails._id,
      }).populate("products");

      var perPage = 6;
      var pages = req.query.page || 1;

      Product.find({
        status: true,
      })
        .skip(perPage * pages - perPage)
        .limit(perPage)
        .exec(function (err, products) {
          Product.count().exec(function (err, count) {
            if (err) return next(err);

            res.render("user/partials/product", {
              product: products,
              categories: categoryData,
              category: "",
              colors: colorData,
              shop: "active",
              wishData,
              current: pages,
              pages: Math.ceil(count / perPage),
              usersession: req.session.auth,
            });
          });
        });
    }
  } catch (err) {
    console.log(err);
  }
};

const productDetails = async (req, res) => {
  try {
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
        usersession: req.session.auth,
      });
    }
  } catch (err) {
    console.log(err);
  }
};

const wishListPage = async (req, res) => {
  try {
    const email = req.session.auth;
    const userDetails = await User.findOne({ email: email });
    const wishData = await Wishlist.findOne({
      customer: userDetails._id,
    }).populate("products");

    res.render("user/partials/wishlist", {
      wishData,
      usersession: req.session.auth,
    });
  } catch (err) {
    console.log(err);
  }
};

const addWishList = async (req, res) => {
  try {
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
  } catch (err) {
    console.log(err);
  }
};

const removeWishList = async (req, res) => {
  try {
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
  } catch (err) {
    console.log(err);
  }
};

const cartPage = async (req, res) => {
  try {
    const email = req.session.auth;
    const userDetails = await User.findOne({ email: email });
    const wishData = await Wishlist.findOne({
      customer: userDetails._id,
    }).populate("products");

    const proimg = await Cart.findOne({ customer: userDetails._id }).populate(
      "products.productId"
    );

    res.render("user/partials/cart", {
      cartList: proimg,
      wishData,
      usersession: req.session.auth,
    });
  } catch (err) {
    console.log(err);
  }
};

//dstatatatatatatatatatattatatatatatattatatatatatatattaat

const addCart = async (req, res) => {
  try {
    const email = req.session.auth;
    const userDetails = await User.findOne({ email: email });

    let userCart = await Cart.findOne({ customer: userDetails._id });

    let itemIndex = userCart.products.findIndex((products) => {
      return products.productId == req.query.id;
    });

    if (itemIndex > -1) {
      //-1 if no item matches

      let a = await Cart.updateOne(
        { customer: userDetails._id, "products.productId": req.query.id },
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
  } catch (err) {
    console.log(err);
  }
};

const removeCart = async (req, res) => {
  try {
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
        { customer: userDetails._id },
        { $pull: { products: { productId: req.query.id } } }
      );
    } else {
      await Cart.updateOne(
        { customer: userDetails._id, "products.productId": req.query.id },
        {
          $inc: { "products.$.quantity": -1 },
        }
      );
    }

    res.redirect("/cart");
  } catch (err) {
    console.log(err);
  }
};

const deleteCart = async (req, res) => {
  try {
    const email = req.session.auth;
    const userDetails = await User.findOne({ email: email });

    await Cart.updateOne(
      { customer: userDetails._id },
      { $pull: { products: { productId: req.query.id } } }
    );

    res.redirect("/cart");
  } catch (err) {
    console.log(err);
  }
};

const incrimentQuantity = async (req, res) => {
  try {
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
  } catch (err) {
    console.log(err);
  }
};

const checkoutPage = async (req, res) => {
  const email = req.session.auth;
  const userDetails = await User.findOne({ email: email });
  const wishData = await Wishlist.findOne({
    customer: userDetails._id,
  }).populate("products");
  const cartData = await Cart.findOne({ customer: userDetails._id }).populate(
    "products.productId"
  );

  res.render("user/partials/checkout", {
    cartData,
    wishData,
    usersession: req.session.auth,
    userDetails,
  });
};

const catFiltering = async (req, res) => {
  console.log(req.body.cat);
  const categoryDetails = await Category.findOne({ _id: req.body.cat });

  const email = req.session.auth;
  const userDetails = await User.findOne({ email: email });

  const products = await Product.find({ category: req.body.cat, status: true });

  res.json({
    data: products,
  });
};

const colorFiltering = async (req, res) => {
  const colorData = await Product.find({ color: req.body.cat, status: true });

  res.json({
    data: colorData,
  });
};

const stockStatus = async (req, res) => {
  if (req.body.cat == "inStock") {
    const stockData = await Product.find({ stock: { $gt: 0 } });
    res.json({
      data: stockData,
    });
  } else if (req.body.cat == "outStock") {
    const stockData = await Product.find({ stock: 0 });
    res.json({
      data: stockData,
    });
  }
};

const sortStatus = async (req, res) => {
  if (req.body.cat == "high") {
    sort = { price: -1 };
  } else if (req.body.cat == "low") {
    sort = { price: 1 };
  } else {
    sort = {};
  }
  const sortData = await Product.find({ status: true }).sort(sort);

  res.json({
    data: sortData,
  });
};

const pageStatus = async (req, res) => {
  const email = req.session.auth;
  const userDetails = await User.findOne({ email: email });

  var perPage = 6;
  var page = req.body.cat || 1;

  Product.find({
    status: true,
  })
    .skip(perPage * page - perPage)
    .limit(perPage)
    .exec(function (err, products) {
      Product.count().exec(function (err, count) {
        if (err) return next(err);
        const val = Math.ceil(count / perPage);
        const currents = page;
        res.json({
          data: products,
          current: currents,
          pages: val,
        });
      });
    });
};

const profilePage = async (req, res) => {
  const email = req.session.auth;
  const userDetails = await User.findOne({ email: email });
  const wishData = await Wishlist.findOne({
    customer: userDetails._id,
  }).populate("products");

  res.render("user/partials/profile", {
    wishData,
    usersession: req.session.auth,
    userData: userDetails,
  });
};

const editUserSubmit = async (req, res) => {
  if (req.body.fname) {
    await User.updateOne(
      { email: req.session.auth },
      { $set: { fname: req.body.fname, mobile: req.body.mobile } }
    );
    res.redirect("/user-profile");
  } else {
    res.redirect("/user-profile");
  }
};

const addressPage = async (req, res) => {
  const email = req.session.auth;
  const userDetails = await User.findOne({ email: email });
  const wishData = await Wishlist.findOne({
    customer: userDetails._id,
  }).populate("products");

  res.render("user/partials/addresses", {
    wishData,
    usersession: req.session.auth,
    userData: userDetails,
  });
};

const addAddress = async (req, res) => {
  const email = req.session.auth;
  await User.updateOne(
    { email: email },
    {
      $push: {
        address: {
          name: req.body.name,
          contact: req.body.contact,
          fullAddress: req.body.fullAddress,
          stat: false,
          pincode: req.body.pincode,
        },
      },
    }
  );

  console.log("New address Added");
  res.redirect("/user-address");
};

const editAddress = async (req, res) => {
  const email = req.session.auth;

  await User.updateOne(
    { email: email, "address._id": req.body.id },

    {
      $set: {
        "address.$.name": req.body.name,
        "address.$.fullAddress": req.body.fullAddress,
        "address.$.contact": req.body.contact,
        "address.$.pincode": req.body.pincode,
      },
    }
  );

  console.log("address edited");
  res.redirect("/user-address");
};

const deleteAddress = async (req, res) => {
  const email = req.session.auth;
  await User.updateOne(
    { email: email },

    {
      $pull: {
        address: { _id: req.query.id },
      },
    }
  );

  console.log("delete address");
  res.redirect("/user-address");
};

const setDefault = async (req, res) => {
  const email = req.session.auth;

  await User.updateOne(
    { email: email, "address.stat": true },

    {
      $set: {
        "address.$.stat": false,
      },
    }
  );

  await User.updateOne(
    { email: email, "address._id": req.query.id },

    {
      $set: {
        "address.$.stat": true,
      },
    }
  );

  console.log("address defaulted");
  res.redirect("/user-address");
};

const checkAddress = async (req, res) => {
  const email = req.session.auth;
  const userData = await User.findOne({ email: email });
  
 
    const data = req.body
    const id = req.body.cat

    const address = await User.aggregate([


      { $match: { email: email } },
      { $unwind: "$address" },
      {
        $project: {
          address: "$address.fullAddress",
          phone: "$address.contact",
          name: "$address.name",
          pincode: "$address.pincode",
          id: "$address._id",

        },
      },

      { $match: { id: new mongoose.Types.ObjectId(id) } },

    ]);

   
    res.json({ data: address })
 
  

};


const checkCoupon = async (req,res)=>{
  const email = req.session.auth;
  const userId = await User.findOne({email : email})

  const couponData = await Coupon.findOne({discount : req.body.cat})

  if(couponData){
    let currentDate = Date.now()

    function formatDate(date) {
      var d = new Date(date),
          month = '' + (d.getMonth() + 1),
          day = '' + d.getDate(),
          year = d.getFullYear();
  
      if (month.length < 2) 
          month = '0' + month;
      if (day.length < 2) 
          day = '0' + day;
  
      return [year, month, day].join('-');
  }
   
  let formatedDate = formatDate(currentDate)

  if(couponData.expirationTime > formatedDate){
    

      
      // console.log(productData)
      const cartItems = await Cart.aggregate([
        { $match: {customer: userId._id}},
        { $unwind: "$products"},
        { $project: {
          productId: "$products.productId",
          qty: "$products.quantity"
        }},
        {
          $lookup: {
            from: 'products',
            localField: 'productId',
            foreignField: '_id',
            as: 'productDetails'
          }
        },
        { $unwind: "$productDetails"},
        {
          $project: {
            price: "$productDetails.price",
            qty: "$qty"
          }
        },
        
        
      ])
      var final = 0;
      const Total = cartItems.forEach(function(items){
        let costValue = parseInt(items.price);
        addValue = costValue*items.qty
        
        
        final = final + addValue;
        

      })
      
     if(final >=couponData.originalPrice){
      
      const finalPrice = parseInt(couponData.finalPrice)

      let discountInit =  Math.round((final * finalPrice) / 100)   

      const discountPrice= final-discountInit
      console.log(discountPrice)

      
      
      res.json({ data: "Coupon Applied Succesfully", price : final,discountInit, discount : discountPrice })
     }else{
      res.json({data : 'Need Minimum Cart Value of ₹'+couponData.originalPrice})
     }
      
  }else{
    res.json({ data: "Coupon Expired" })
  }

  }else{
    res.json({ data: "Coupon Doesn't Exist" })
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
  productPage,
  productDetails,
  wishListPage,
  addWishList,
  removeWishList,
  cartPage,
  addCart,
  incrimentQuantity,
  removeCart,
  deleteCart,
  checkoutPage,
  profilePage,
  catFiltering,
  colorFiltering,
  stockStatus,
  sortStatus,
  pageStatus,
  editUserSubmit,
  addressPage,
  addAddress,
  editAddress,
  deleteAddress,
  setDefault,
  checkAddress,
  checkCoupon
};
