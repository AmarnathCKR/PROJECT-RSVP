const User = require("../models/userModels");
const Category = require("../models/categoryModel");
const Product = require("../models/productModel");
const Wishlist = require("../models/wishlistModel");
const Cart = require("../models/cartModel");
const nodemailer = require("nodemailer");
const session = require("express-session");
const Banner = require("../models/bannerModel");
const mongoose = require("mongoose");

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
              usersession: req.session.auth,
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
              usersession: req.session.auth,
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
              usersession: req.session.auth,
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
              usersession: req.session.auth,
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
              usersession: req.session.auth,
            });
          });
        });
    } else if (req.query.sort) {
      if (req.query.sort == "high") {
        sort = { price: -1 };
      } else if (req.query.sort == "low") {
        sort = { price: 1 };
      } else {
        sort = {};
      }

      const categoryData = await Category.find({ status: true });

      const colorData = await Product.find({ status: true });

      const email = req.session.auth;
      const userDetails = await User.findOne({ email: email });
      const wishData = await Wishlist.findOne({
        customer: userDetails._id,
      }).populate("products");

      Product.find({
        status: true,
      })
        .sort(sort)
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
              usersession: req.session.auth,
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
};
