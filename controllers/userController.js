const User = require("../models/userModels");
const Category = require("../models/categoryModel");
const Product = require("../models/productModel");
const Wishlist = require("../models/wishlistModel");
const Cart = require("../models/cartModel");
const nodemailer = require("nodemailer");
const Banner = require("../models/bannerModel");
const mongoose = require("mongoose");
const Coupon = require("../models/couponModel");
const Order = require("../models/orderModel");
const paypal = require("paypal-rest-sdk");
const instance=require("../middleware/razorpay")
require("dotenv").config();
const crypto=require("crypto");

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

let userData;

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

      var transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.NODEMAIL,
          pass: process.env.NODEMAIL_PASSWORD,
        },
      });

      var mailOptions = {
        from: "amarnathchakkiyar@gmail.com",
        to: req.body.email,
        subject: "YOUR OTP",

        html: `<h3>Your OTP is here<h3> <br> <p>${otp}</p>`,
      };

      transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
          console.log(error);
        } else {
          console.log("Email sent: " + info.response);
          res.redirect("/verifyOTP");
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

    req.session.authOTP = otp;

    setTimeout(() => {
      req.session.authOTP = false;
      console.log("Resend OTP Expired");
    }, 180000);

    var transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.NODEMAIL,
        pass: process.env.NODEMAIL_PASSWORD,
      },
    });

    var mailOptions = {
      from: "amarnathchakkiyar@gmail.com",
      to: req.session.emailOTP,
      subject: "YOUR OTP",

      html: `<h3>Your OTP is here<h3> <br> <p>${otp}</p>`,
    };

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log("Email sent: " + info.response);
        console.log("Nre OTP : " + otp);
        res.redirect("/verifyOTP");
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

        req.session.emailOtp = otp;
        setTimeout(() => {
          req.session.emailOtp = false;
          console.log("OTP Expired");
        }, 180000);

        // email
        var transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: process.env.NODEMAIL,
            pass: process.env.NODEMAIL_PASSWORD,
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

    ``;
    var transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.NODEMAIL,
        pass: process.env.NODEMAIL_PASSWORD,
      },
    });

    var mailOptions = {
      from: "amarnathchakkiyar@gmail.com",
      to: req.session.emailAuth,
      subject: "YOUR OTP",
      html: `<h3>Your OTP is here<h3> <br> <p>${otp}</p>`,
    };

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log("Email sent: " + info.response);
        console.log("New OTP : " + otp);
        res.redirect("/verifyEmail");
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

const productPage = async (req, res) => {
  try {
    if (req.query.search != null) {
      if (req.query.category) {
        let search = req.query.search;
        const categoryData = await Category.find({ status: true });

        const colorData = await Product.find({ status: true });

        const email = req.session.auth;
        const userDetails = await User.findOne({ email: email });
        const wishData = await Wishlist.findOne({
          customer: userDetails._id,
        }).populate("products");

        Product.find({
          status: true,
          category: req.query.category,
          $or: [
            { name: { $regex: ".*" + search + "*.", $options: "i" } },

            { model: { $regex: ".*" + search + "*.", $options: "i" } },
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
      } else if (req.query.color) {
        let search = req.query.search;
        const categoryData = await Category.find({ status: true });

        const colorData = await Product.find({ status: true });

        const email = req.session.auth;
        const userDetails = await User.findOne({ email: email });
        const wishData = await Wishlist.findOne({
          customer: userDetails._id,
        }).populate("products");

        Product.find({
          status: true,
          color: req.query.color,
          $or: [
            { name: { $regex: ".*" + search + "*.", $options: "i" } },

            { model: { $regex: ".*" + search + "*.", $options: "i" } },
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
      } else if (req.body.stock) {
        if (req.query.stock == "inStock") {
          let search = req.query.search;
          const categoryData = await Category.find({ status: true });

          const colorData = await Product.find({ status: true });

          const email = req.session.auth;
          const userDetails = await User.findOne({ email: email });
          const wishData = await Wishlist.findOne({
            customer: userDetails._id,
          }).populate("products");

          Product.find({
            status: true,
            stock: { $gt: 0 },
            $or: [
              { name: { $regex: ".*" + search + "*.", $options: "i" } },

              { model: { $regex: ".*" + search + "*.", $options: "i" } },
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
        } else if (req.query.stock == "outStock") {
          let search = req.query.search;
          const categoryData = await Category.find({ status: true });

          const colorData = await Product.find({ status: true });

          const email = req.session.auth;
          const userDetails = await User.findOne({ email: email });
          const wishData = await Wishlist.findOne({
            customer: userDetails._id,
          }).populate("products");

          Product.find({
            status: true,
            stock: 0,
            $or: [
              { name: { $regex: ".*" + search + "*.", $options: "i" } },

              { model: { $regex: ".*" + search + "*.", $options: "i" } },
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
        }
      } else {
        let search = req.query.search;
          const categoryData = await Category.find({ status: true });

          const colorData = await Product.find({ status: true });

          const email = req.session.auth;
          const userDetails = await User.findOne({ email: email });
          const wishData = await Wishlist.findOne({
            customer: userDetails._id,
          }).populate("products");

          Product.find({
            status: true,
            
            $or: [
              { name: { $regex: ".*" + search + "*.", $options: "i" } },

              { model: { $regex: ".*" + search + "*.", $options: "i" } },
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
        
      }
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

    res.render("user/partials/wishList", {
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

const addCart = async (req, res) => {
  try {
    const email = req.session.auth;
    const userDetails = await User.findOne({ email: email });

    let userCart = await Cart.findOne({ customer: userDetails._id });

    let itemIndex = userCart.products.findIndex((products) => {
      return products.productId == req.query.id;
    });

    if (itemIndex > -1) {
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
    const stockData = await Product.find({ status : true, stock: { $gt: 0 } });
    res.json({
      data: stockData,
    });
  } else if (req.body.cat == "outStock") {
    const stockData = await Product.find({ status : true, stock: 0 });
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

  const data = req.body;
  const id = req.body.cat;

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

  res.json({ data: address });
};

const checkCoupon = async (req, res) => {
  const email = req.session.auth;
  const userId = await User.findOne({ email: email });

  const couponData = await Coupon.findOne({ discount: req.body.cat });

  if (couponData) {
    let userValid = await User.findOne({
      email: email,
      coupons: couponData._id,
    });

    if (userValid == null) {
      let currentDate = Date.now();

      function formatDate(date) {
        var d = new Date(date),
          month = "" + (d.getMonth() + 1),
          day = "" + d.getDate(),
          year = d.getFullYear();

        if (month.length < 2) month = "0" + month;
        if (day.length < 2) day = "0" + day;

        return [year, month, day].join("-");
      }

      let formatedDate = formatDate(currentDate);

      if (couponData.expirationTime > formatedDate) {
        const cartItems = await Cart.aggregate([
          { $match: { customer: userId._id } },
          { $unwind: "$products" },
          {
            $project: {
              productId: "$products.productId",
              qty: "$products.quantity",
            },
          },
          {
            $lookup: {
              from: "products",
              localField: "productId",
              foreignField: "_id",
              as: "productDetails",
            },
          },
          { $unwind: "$productDetails" },
          {
            $project: {
              price: "$productDetails.price",
              qty: "$qty",
            },
          },
        ]);
        var final = 0;
        const Total = cartItems.forEach(function (items) {
          let costValue = parseInt(items.price);
          addValue = costValue * items.qty;

          final = final + addValue;
        });

        if (final >= couponData.originalPrice) {
          const finalPrice = parseInt(couponData.finalPrice);

          let discountInit = Math.round((final * finalPrice) / 100);

          const discountPrice = final - discountInit;
          console.log(discountPrice);

          res.json({
            data: 'Coupon Applied Succesfully <i class="fa fa-check text-success"></i>',
            price: final,
            discountInit,
            discount: discountPrice,
            finalPrice,
          });
        } else {
          const cartItems = await Cart.aggregate([
            { $match: { customer: userId._id } },
            { $unwind: "$products" },
            {
              $project: {
                productId: "$products.productId",
                qty: "$products.quantity",
              },
            },
            {
              $lookup: {
                from: "products",
                localField: "productId",
                foreignField: "_id",
                as: "productDetails",
              },
            },
            { $unwind: "$productDetails" },
            {
              $project: {
                price: "$productDetails.price",
                qty: "$qty",
              },
            },
          ]);
          var final = 0;
          const Total = cartItems.forEach(function (items) {
            let costValue = parseInt(items.price);
            addValue = costValue * items.qty;

            final = final + addValue;
          });

          res.json({
            data: "Need Minimum Cart Value of ₹" + couponData.originalPrice,
            price: final,
          });
        }
      } else {
        const cartItems = await Cart.aggregate([
          { $match: { customer: userId._id } },
          { $unwind: "$products" },
          {
            $project: {
              productId: "$products.productId",
              qty: "$products.quantity",
            },
          },
          {
            $lookup: {
              from: "products",
              localField: "productId",
              foreignField: "_id",
              as: "productDetails",
            },
          },
          { $unwind: "$productDetails" },
          {
            $project: {
              price: "$productDetails.price",
              qty: "$qty",
            },
          },
        ]);
        var final = 0;
        const Total = cartItems.forEach(function (items) {
          let costValue = parseInt(items.price);
          addValue = costValue * items.qty;

          final = final + addValue;
        });

        res.json({ data: "Coupon Expired", price: final });
      }
    } else {
      const cartItems = await Cart.aggregate([
        { $match: { customer: userId._id } },
        { $unwind: "$products" },
        {
          $project: {
            productId: "$products.productId",
            qty: "$products.quantity",
          },
        },
        {
          $lookup: {
            from: "products",
            localField: "productId",
            foreignField: "_id",
            as: "productDetails",
          },
        },
        { $unwind: "$productDetails" },
        {
          $project: {
            price: "$productDetails.price",
            qty: "$qty",
          },
        },
      ]);
      var final = 0;
      const Total = cartItems.forEach(function (items) {
        let costValue = parseInt(items.price);
        addValue = costValue * items.qty;

        final = final + addValue;
      });

      res.json({ data: "Coupon Already Used", price: final });
    }
  } else {
    const cartItems = await Cart.aggregate([
      { $match: { customer: userId._id } },
      { $unwind: "$products" },
      {
        $project: {
          productId: "$products.productId",
          qty: "$products.quantity",
        },
      },
      {
        $lookup: {
          from: "products",
          localField: "productId",
          foreignField: "_id",
          as: "productDetails",
        },
      },
      { $unwind: "$productDetails" },
      {
        $project: {
          price: "$productDetails.price",
          qty: "$qty",
        },
      },
    ]);
    var final = 0;
    const Total = cartItems.forEach(function (items) {
      let costValue = parseInt(items.price);
      addValue = costValue * items.qty;

      final = final + addValue;
    });

    res.json({ data: "Coupon Doesn't Exist", price: final });
  }
};

paypal.configure({
  mode: "sandbox",
  client_id: process.env.CLIENT_ID,
  client_secret: process.env.CLIENT_SECRET,
});

var newOrder;

const orderCheck = async (req, res) => {
  const email = req.session.auth;
  const userDetails = await User.findOne({ email: email });
  console.log(req.body)
  
  if (req.body.paymentMethod == "COD") {
    const couponData = await Coupon.findOne({ discount: req.body.couponText });

    if (couponData) {
      await User.updateOne(
        { email: email },
        {
          $push: { coupons: [couponData._id] },
        }
      );
      const cartItems = await Cart.aggregate([
        { $match: { customer: userDetails._id } },
        { $unwind: "$products" },
        {
          $project: {
            productId: "$products.productId",
            qty: "$products.quantity",
          },
        },
        {
          $lookup: {
            from: "products",
            localField: "productId",
            foreignField: "_id",
            as: "productDetails",
          },
        },
        { $unwind: "$productDetails" },
        {
          $project: {
            price: "$productDetails.price",
            qty: "$qty",
          },
        },
      ]);
      var final = 0;
      const Total = cartItems.forEach(function (items) {
        let costValue = parseInt(items.price);
        addValue = costValue * items.qty;

        final = final + addValue;
      });

      const finalPrice = parseInt(couponData.finalPrice);

      let discountInit = Math.round((final * finalPrice) / 100);

      const discountPrice = final - discountInit;
      console.log(discountPrice);

      const orderItems = await Cart.aggregate([
        {
          $match: { customer: userDetails._id },
        },
        {
          $unwind: "$products",
        },
        {
          $project: {
            productId: "$products.productId",
            qtyItems: "$products.quantity",
          },
        },
      ]);

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

        { $match: { id: new mongoose.Types.ObjectId(req.body.address) } },
      ]);
      let nowDate = Date.now();

      newOrder = new Order({
        customer: userDetails._id,
        status: "placed",
        date: nowDate,
        coupon: req.body.couponText,
        Totalprice: final,
        finalPrice: discountPrice,
        discount: discountInit,
        address: [
          {
            name: req.body.nameAdd,
            contact: req.body.contactAdd,
            fullAddress: req.body.fullAdd,
            stat: true,
            pincode: req.body.pinAdd,
          },
        ],
        product: orderItems,
        orderType: "COD",
      });

      

      res.redirect("/check-payment");
    } else {
      const cartItems = await Cart.aggregate([
        { $match: { customer: userDetails._id } },
        { $unwind: "$products" },
        {
          $project: {
            productId: "$products.productId",
            qty: "$products.quantity",
          },
        },
        {
          $lookup: {
            from: "products",
            localField: "productId",
            foreignField: "_id",
            as: "productDetails",
          },
        },
        { $unwind: "$productDetails" },
        {
          $project: {
            price: "$productDetails.price",
            qty: "$qty",
          },
        },
      ]);
      var final = 0;
      const Total = cartItems.forEach(function (items) {
        let costValue = parseInt(items.price);
        addValue = costValue * items.qty;

        final = final + addValue;
      });

      const orderItems = await Cart.aggregate([
        {
          $match: { customer: userDetails._id },
        },
        {
          $unwind: "$products",
        },
        {
          $project: {
            productId: "$products.productId",
            qtyItems: "$products.quantity",
          },
        },
      ]);

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

        { $match: { id: new mongoose.Types.ObjectId(req.body.address) } },
      ]);
      let nowDate = Date.now();
      console.log(nowDate);
      newOrder = new Order({
        customer: userDetails._id,
        status: "placed",
        date: nowDate,
        coupon: "Nil",
        Totalprice: final,
        finalPrice: final,
        discount: 0,
        address: [
          {
            name: req.body.nameAdd,
            contact: req.body.contactAdd,
            fullAddress: req.body.fullAdd,
            stat: true,
            pincode: req.body.pinAdd,
          },
        ],
        product: orderItems,
        orderType: "COD",
      });

      console.log("order saved");

      res.redirect("/check-payment");
    }
  } else {
    const couponData = await Coupon.findOne({ discount: req.body.couponText });

    if (couponData) {
      await User.updateOne(
        { email: email },
        {
          $push: { coupons: [couponData._id] },
        }
      );
      const cartItems = await Cart.aggregate([
        { $match: { customer: userDetails._id } },
        { $unwind: "$products" },
        {
          $project: {
            productId: "$products.productId",
            qty: "$products.quantity",
          },
        },
        {
          $lookup: {
            from: "products",
            localField: "productId",
            foreignField: "_id",
            as: "productDetails",
          },
        },
        { $unwind: "$productDetails" },
        {
          $project: {
            price: "$productDetails.price",
            qty: "$qty",
          },
        },
      ]);
      var final = 0;
      const Total = cartItems.forEach(function (items) {
        let costValue = parseInt(items.price);
        addValue = costValue * items.qty;

        final = final + addValue;
      });

      const finalPrice = parseInt(couponData.finalPrice);

      let discountInit = Math.round((final * finalPrice) / 100);

      const discountPrice = final - discountInit;
      console.log(discountPrice);

      const orderItems = await Cart.aggregate([
        {
          $match: { customer: userDetails._id },
        },
        {
          $unwind: "$products",
        },
        {
          $project: {
            productId: "$products.productId",
            qtyItems: "$products.quantity",
          },
        },
      ]);

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

        { $match: { id: new mongoose.Types.ObjectId(req.body.address) } },
      ]);
      let nowDate = Date.now();

      newOrder = new Order({
        customer: userDetails._id,
        status: "placed",
        date: nowDate,
        coupon: req.body.couponText,
        Totalprice: final,
        finalPrice: discountPrice,
        discount: discountInit,
        address: [
          {
            name: req.body.nameAdd,
            contact: req.body.contactAdd,
            fullAddress: req.body.fullAdd,
            stat: false,
            pincode: req.body.pinAdd,
          },
        ],
        product: orderItems,
        orderType: "PayPal",
      });

      console.log("order saved");

      let lots = discountPrice * 0.012;
      let paytm = parseInt(lots);

      const create_payment_json = {
        intent: "sale",
        payer: {
          payment_method: "paypal",
        },
        redirect_urls: {
          return_url: "http://bestrsvp.co/check-payment",
          cancel_url: "http://bestrsvp.co/checkout",
        },
        transactions: [
          {
            item_list: {
              items: [
                {
                  name: "item",
                  sku: "item",
                  price: paytm,
                  currency: "USD",
                  quantity: 1,
                },
              ],
            },
            amount: {
              currency: "USD",
              total: paytm,
            },
            description: "This is the payment description.",
          },
        ],
      };
      paypal.payment.create(
        create_payment_json,
        async function (error, payment) {
          if (error) {
            throw error;
          } else {
            for (let i = 0; i < payment.links.length; i++) {
              if (payment.links[i].rel === "approval_url") {
                res.redirect(payment.links[i].href);
              }
            }
          }
        }
      );
    } else {
      const cartItems = await Cart.aggregate([
        { $match: { customer: userDetails._id } },
        { $unwind: "$products" },
        {
          $project: {
            productId: "$products.productId",
            qty: "$products.quantity",
          },
        },
        {
          $lookup: {
            from: "products",
            localField: "productId",
            foreignField: "_id",
            as: "productDetails",
          },
        },
        { $unwind: "$productDetails" },
        {
          $project: {
            price: "$productDetails.price",
            qty: "$qty",
          },
        },
      ]);
      var final = 0;
      const Total = cartItems.forEach(function (items) {
        let costValue = parseInt(items.price);
        addValue = costValue * items.qty;

        final = final + addValue;
      });

      const orderItems = await Cart.aggregate([
        {
          $match: { customer: userDetails._id },
        },
        {
          $unwind: "$products",
        },
        {
          $project: {
            productId: "$products.productId",
            qtyItems: "$products.quantity",
          },
        },
      ]);

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

        { $match: { id: new mongoose.Types.ObjectId(req.body.address) } },
      ]);
      let nowDate = Date.now();
      console.log(nowDate);
      newOrder = new Order({
        customer: userDetails._id,
        status: "placed",
        date: nowDate,
        coupon: "Nil",
        Totalprice: final,
        finalPrice: final,
        discount: 0,
        address: [
          {
            name: req.body.nameAdd,
            contact: req.body.contactAdd,
            fullAddress: req.body.fullAdd,
            stat: false,
            pincode: req.body.pinAdd,
          },
        ],
        product: orderItems,
        orderType: "PayPal",
      });

      let loter = final * 0.012;
      let paym = parseInt(loter);

      const create_payment_json = {
        intent: "sale",
        payer: {
          payment_method: "paypal",
        },
        redirect_urls: {
          return_url: "http://bestrsvp.co/check-payment",
          cancel_url: "http://bestrsvp.co/checkout",
        },
        transactions: [
          {
            item_list: {
              items: [
                {
                  name: "item",
                  sku: "item",
                  price: paym,
                  currency: "USD",
                  quantity: 1,
                },
              ],
            },
            amount: {
              currency: "USD",
              total: paym,
            },
            description: "This is the payment description.",
          },
        ],
      };
      paypal.payment.create(
        create_payment_json,
        async function (error, payment) {
          if (error) {
            throw error;
          } else {
            for (let i = 0; i < payment.links.length; i++) {
              if (payment.links[i].rel === "approval_url") {
                res.redirect(payment.links[i].href);
              }
            }
          }
        }
      );
    }
  }
};

const checkPayment = async (req, res) => {
  const email = req.session.auth;
  console.log(newOrder.address[0].name)
  
  const addressExist = await User.findOne({
    email: email,
    "address": {$elemMatch: { name: newOrder.address[0].name,contact :  newOrder.address[0].contact,fullAddress :  newOrder.address[0].fullAddress, pincode :newOrder.address[0].pincode }} ,
    
  });
  console.log(addressExist)
  if (!addressExist) {
    await User.updateOne(
      { email: email },
      {
        $push: {
          address: {
            name: newOrder.address[0].name,
            contact: newOrder.address[0].contact,
            fullAddress: newOrder.address[0].fullAddress,
            stat: false,
            pincode: newOrder.address[0].pincode,
          },
        },
      }
    );
  }

  
  newOrder.save();
  console.log(newOrder)

  for(let i=0;i<newOrder.product.length;i++){
    console.log(newOrder.product[i].productId)
    console.log(newOrder.product[i].qtyItems)
    
    await Product.updateOne({
      _id: newOrder.product[i].productId ,
      stock: { $gt: 0 },
    },
    
      {$inc : {
        stock : -newOrder.product[i].qtyItems
      }}
      )
    }

  
  const userDetails = await User.findOne({ email: email });
  const wishData = await Wishlist.findOne({
    customer: userDetails._id,
  }).populate("products");
  await Cart.updateOne(
    { customer: userDetails._id },
    {
      $set: { products: [] },
    }
  );

  res.render("user/partials/orderSuccess", {
    wishData,
    usersession: req.session.auth,
    userDetails,
    newOrder,
  });
};

const orderPage = async (req, res) => {
  const email = req.session.auth;
  const userDetails = await User.findOne({ email: email });
  const wishData = await Wishlist.findOne({
    customer: userDetails._id,
  }).populate("products");

  const orderDetails = await Order.find({ customer: userDetails._id }).populate(
    "product.productId"
  );

  res.render("user/partials/order", {
    wishData,
    usersession: req.session.auth,
    userDetails,
    orderDetails,
  });
};

const orderDetailPage = async (req, res) => {
  const email = req.session.auth;
  const userDetails = await User.findOne({ email: email });
  const wishData = await Wishlist.findOne({
    customer: userDetails._id,
  }).populate("products");

  const orderDetails = await Order.findOne({ _id: req.query.id }).populate(
    "product.productId"
  );

  res.render("user/partials/orderDetail", {
    wishData,
    usersession: req.session.auth,
    userDetails,
    orderDetails,
  });
};

const cancelOrder = async (req, res) => {
  await Order.updateOne(
    { _id: req.body.id },
    {
      $set: { status: "cancelled" },
    }
  );
  res.json({ data: "cancelled" });
};

const checkPassword = async (req, res) => {
  console.log("hereeeee");
  console.log(req.body.data);
  const email = req.session.auth;
  const userDetails = await User.findOne({ email: email });
  const match = await bcrypt.compare(req.body.data, userDetails.password);
  if (match) {
    res.json({
      data: '<b class="text-success">Correct password</b>',
      att: "right",
    });
  } else {
    res.json({
      data: '<b class="text-danger">Wrong Password</b>',
      att: "wrong",
    });
  }
};

const passwordChange = async (req, res) => {
  const email = req.session.auth;
  const userDetails = await User.findOne({ email: email });
  const match = await bcrypt.compare(
    req.body.currentPassword,
    userDetails.password
  );
  if (match) {
    const hashPassword = await bcrypt.hash(req.body.confirmPassword, 10);
    await User.updateOne(
      { email: email },
      {
        $set: { password: hashPassword },
      }
    );
    res.redirect("/user-profile");
  } else {
    res.redirect("/user-profile");
  }
};

const orderFailed = async (req, res) => {
  const email = req.session.auth;
  const userDetails = await User.findOne({ email: email });
  const wishData = await Wishlist.findOne({
    customer: userDetails._id,
  }).populate("products");

  const orderDetails = await Order.find({ customer: userDetails._id }).populate(
    "product.productId"
  );

  res.render("user/partials/order", {
    wishData,
    usersession: req.session.auth,
    userDetails,
    orderDetails,
  });
};

const test = async (req, res) => {
  const email = req.session.auth;
  const userDetails = await User.findOne({ email: email });
  const wishData = await Wishlist.findOne({
    customer: userDetails._id,
  }).populate("products");

  const orderDetails = await Order.find({ customer: userDetails._id }).populate(
    "product.productId"
  );

  res.render("user/layouts/header1", {
    wishData,
    usersession: req.session.auth,
    userDetails,
    orderDetails,
  });
};

const addNewAddress = async (req, res) => {
  const email = req.session.auth;
  await User.updateOne(
    { email: email },
    {
      $push: {
        address: {
          name: req.body.inputName,
          contact: req.body.inputContact,
          fullAddress: req.body.inputAdddd,
          stat: false,
          pincode: req.body.inputPin,
        },
      },
    }
  );
  res.json({ data: "success" });
};


const initRazor= async (req,res)=>{
  
  const email = req.session.auth;
  const userDetails = await User.findOne({ email: email });
  const couponData = await Coupon.findOne({discount : req.body.couponText})
  console.log(couponData)
  if (couponData !==null) {
    console.log('Entering Coupon Mode')
    await User.updateOne(
      { email: email },
      {
        $push: { coupons: [couponData._id] },
      }
    );
    const cartItems = await Cart.aggregate([
      { $match: { customer: userDetails._id } },
      { $unwind: "$products" },
      {
        $project: {
          productId: "$products.productId",
          qty: "$products.quantity",
        },
      },
      {
        $lookup: {
          from: "products",
          localField: "productId",
          foreignField: "_id",
          as: "productDetails",
        },
      },
      { $unwind: "$productDetails" },
      {
        $project: {
          price: "$productDetails.price",
          qty: "$qty",
        },
      },
    ]);
    var final = 0;
    const Total = cartItems.forEach(function (items) {
      let costValue = parseInt(items.price);
      addValue = costValue * items.qty;

      final = final + addValue;
    });

    const finalPrice = parseInt(couponData.finalPrice);

    let discountInit = Math.round((final * finalPrice) / 100);

    const discountPrice = final - discountInit;
    console.log(discountPrice);

    const orderItems = await Cart.aggregate([
      {
        $match: { customer: userDetails._id },
      },
      {
        $unwind: "$products",
      },
      {
        $project: {
          productId: "$products.productId",
          qtyItems: "$products.quantity",
        },
      },
    ]);

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

      { $match: { id: new mongoose.Types.ObjectId(req.body.address) } },
    ]);
    let nowDate = Date.now();

    newOrder = new Order({
      customer: userDetails._id,
      status: "placed",
      date: nowDate,
      coupon: req.body.couponText,
      Totalprice: final,
      finalPrice: discountPrice,
      discount: discountInit,
      address: [
        {
          name: req.body.inputName,
          contact: req.body.inputContact,
          fullAddress: req.body.inputAddress,
          stat: true,
          pincode: req.body.inputPin,
        },
      ],
      product: orderItems,
      orderType: "RazorPay",
    });

    console.log("order saved");

    var options = {
      amount: final*100,  // amount in the smallest currency unit
      currency: "INR",
      receipt: "order_rcptid_11"
    };
     instance.orders.create(options, function(err, order) {
      if(err){
      console.log(err);
      console.log('online payment error');
      res.json({fail:true})
      }else{
        res.json({order,newOrder})
      }
    });
  } else {
    console.log('Entering no Coupon Mode')
    const cartItems = await Cart.aggregate([
      { $match: { customer: userDetails._id } },
      { $unwind: "$products" },
      {
        $project: {
          productId: "$products.productId",
          qty: "$products.quantity",
        },
      },
      {
        $lookup: {
          from: "products",
          localField: "productId",
          foreignField: "_id",
          as: "productDetails",
        },
      },
      { $unwind: "$productDetails" },
      {
        $project: {
          price: "$productDetails.price",
          qty: "$qty",
        },
      },
    ]);
    var final = 0;
    const Total = cartItems.forEach(function (items) {
      let costValue = parseInt(items.price);
      addValue = costValue * items.qty;

      final = final + addValue;
    });

    const orderItems = await Cart.aggregate([
      {
        $match: { customer: userDetails._id },
      },
      {
        $unwind: "$products",
      },
      {
        $project: {
          productId: "$products.productId",
          qtyItems: "$products.quantity",
        },
      },
    ]);

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

      { $match: { id: new mongoose.Types.ObjectId(req.body.address) } },
    ]);
    let nowDate = Date.now();
    console.log(nowDate);
    newOrder = new Order({
      customer: userDetails._id,
      status: "placed",
      date: nowDate,
      coupon: "Nil",
      Totalprice: final,
      finalPrice: final,
      discount: 0,
      address: [
        {
          name: req.body.inputName,
          contact: req.body.inputContact,
          fullAddress: req.body.inputAddress,
          stat: true,
          pincode: req.body.inputPin,
        },
      ],
      product: orderItems,
      orderType: "RazorPay",
    });

    var options = {
      amount: final*100,  // amount in the smallest currency unit
      currency: "INR",
      receipt: "order_rcptid_11"
    };
     instance.orders.create(options, function(err, order) {
      if(err){
      console.log(err);
      console.log('online payment error');
      res.json({fail:true})
      }else{
        res.json({order,newOrder})
      }
    });
  }
}

const verifyRazor = async (req,res)=>{
  const details = req.body;
  
  let hmac = crypto.createHmac("sha256", 'v4yYwIjiXpfWB484WE2Vff4i');
  hmac.update(details.payment.razorpay_order_id + "|" + details.payment.razorpay_payment_id);
  hmac = hmac.digest("hex");
  if (hmac == details.payment.razorpay_signature) {
    res.json({success:true})
  }else{
    res.json({ failed:true});
  }
}

const contactPage = async (req,res)=>{
  const categoryData = await Category.find({ status: true });
    const banners = await Banner.find({ status: true });
    let usersession = req.session.auth;

    
      let userDat = await User.findOne({ email: usersession });
      const wishData = await Wishlist.findOne({ customer: userDat._id });

      res.render("user/partials/contact", {
        details: banners,
        categories: categoryData,
        home: "active",
        wishData,
        usersession,
      });
    
    
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
  checkCoupon,
  orderCheck,

  checkPayment,
  orderPage,
  orderDetailPage,
  cancelOrder,
  checkPassword,
  passwordChange,
  orderFailed,
  test,
  addNewAddress,
  initRazor,
  verifyRazor,
  contactPage
};
