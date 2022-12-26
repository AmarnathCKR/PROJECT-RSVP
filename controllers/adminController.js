const User = require("../models/userModels");
const Category = require("../models/categoryModel");
const Product = require("../models/productModel");
const Coupon = require("../models/couponModel");
const Order = require("../models/orderModel");


const adminSignin = (req, res) => {
  if (req.session.adminAuth) {
    res.redirect("/admin/dashboard");
  } else {
    res.render("admin/layouts/adminLogin");
  }
};

const adminDetails = {
  email: "adminMail@gmail.com",
  password: "adminPassword",
};

// Admin verification
const adminVerification = (req, res) => {
  try {
    const email = req.body.adminEmail;
    const password = req.body.adminPassword;
    if (req.body) {
      if (email == adminDetails.email && password == adminDetails.password) {
        req.session.adminAuth = email;
        console.log("Admin session created");
        res.redirect("/admin/dashboard");
      } else {
        res.render("admin/layouts/adminLogin", {
          invalid: "Invalid Credentials",
        });
      }
    } else {
      res.render("admin/layouts/adminLogin", {
        invalid: "Admin not found",
      });
    }
  } catch (error) {
    console.log(" Admin verification error: " + error.message);
    res.render("admin/layouts/adminLogin", {
      invalid: "Invalid Credentials",
    });
  }
};

// Dashboard
const adminDashboard = (req, res) => {
  if (req.session.adminAuth) {
    res.render("admin/layouts/adminDashboard");
  }
};

const adminCustomer = (req, res) => {
  if (req.session.adminAuth) {
    let search = "";
    if (req.query.search) {
      search = req.query.search;
    }

    const userDetails = User.find(
      {
        $or: [
          { fname: { $regex: "^" + search + ".*", $options: "i" } },
          { email: { $regex: "^" + search + ".*", $options: "i" } },
        ],
      },
      (err, Users) => {
        res.render("admin/layouts/adminCustomers", {
          details: Users,
          stat: "Active",
          unStat: "Blocked",
          blocking: "Block",
          unBlock: "Unblock",
          blockRef: "block-user",
          unblockRef: "unBlock-user",
        });
      }
    ).sort({ datefield: -1 });
  } else {
    res.redirect("/admin/");
  }
};

// Add user page
// const addUserPage = (req, res) => {
//   if (req.session.adminAuth) {
//     res.render("admin/layouts/adminCreate");
//   } else {
//     res.redirect("/admin/");
//   }
// };

// // Admin create user
// const addUser = async (req, res) => {
//   try {
//     var userDetails = new User({
//       fname: req.body.fname,
//       email: req.body.email,
//       mobile: req.body.mobile,
//       password: req.body.password,
//       status : true
//     });
//     const email = req.body.email;
//     const user = await User.findOne({ email: email });
//     if (email === user.email) {
//       res.render("admin/layouts/adminCreate", {
//         error: "User already existing. Please Log in",
//       });
//     }
//   } catch {
//     const userData = userDetails.save();
//     res.redirect("/admin/dashboard");
//   }
// };

// Edit user
// const editUser = async (req, res) => {
//   if (req.session.adminAuth) {
//     try {
//       const userID = req.query.id;
//       const userDetails = User.findById({ _id: req.query.id }).then(
//         (result) => {
//           res.render("admin/layouts/adminEdit", {
//             details: result,
//           });
//         }
//       );
//     } catch (error) {
//       console.log("Edit user error: " + error.message);
//     }
//   } else {
//     res.redirect("/admin/");
//   }
// };

// // After editing by admin
// const adminEdited = async (req, res) => {
//   try {
//     const updatedUser = await User.updateOne(
//       { email: req.body.email },
//       {
//         $set: {
//           fname: req.body.fname,
//           email: req.body.email,
//           mobile : req.body.mobile,
//           password: req.body.password,
//         },
//       }
//     );
//     console.log();
//     res.redirect("/admin/dashboard");
//   } catch (error) {
//     console.log("User edit error: " + error.message);
//   }
// };

// // Delete user
// const deleteUser = async (req, res) => {
//   if (req.session.adminAuth) {
//     try {
//       const userData = await User.findByIdAndDelete({ _id: req.query.id });
//       res.redirect("/admin/dashboard");
//     } catch (error) {
//       console.log("User deleting error: " + error.message);
//     }
//   } else {
//     res.redirect("/admin/");
//   }
// };

const blockUser = async (req, res) => {
  if (req.session.adminAuth) {
    const updatedUser = await User.updateOne(
      { _id: req.query.id },
      {
        $set: {
          status: false,
        },
      }
    );
    res.redirect("/admin/customer");
  }
};

const unBlockUser = async (req, res) => {
  if (req.session.adminAuth) {
    const updatedUser = await User.updateOne(
      { _id: req.query.id },
      {
        $set: {
          status: true,
        },
      }
    );
    res.redirect("/admin/customer");
  }
};

// Admin Logout
const adminLogOut = (req, res) => {
  req.session.destroy();
  console.log("Admin session destroyed");
  res.redirect("/admin/");
  res.end();
};

const adminCategory = (req, res) => {
  if (req.session.adminAuth) {
    let search = "";
    if (req.query.search) {
      search = req.query.search;
    }

    const CategoryDetails = Category.find(
      {
        $or: [{ name: { $regex: "^" + search + ".*", $options: "i" } }],
      },
      (err, Category) => {
        res.render("admin/layouts/adminCategory", {
          details: Category,
          stat: "On sale",
          unStat: "Not on sale",
          blocking: "Block",
          unBlock: "Unblock",
          blockRef: "block-product",
          unblockRef: "unBlock-product",
        });
      }
    ).sort({ datefield: -1 });
  } else {
    res.redirect("/admin/");
  }
};

const deleteCategory = async (req, res) => {
  if (req.session.adminAuth) {
    try {
      const CategoryData = await Category.findByIdAndDelete({
        _id: req.query.id,
      });
      res.redirect("/admin/category");
    } catch (error) {
      console.log("User deleting error: " + error.message);
    }
  } else {
    res.redirect("/admin/");
  }
};


const editCategory = async (req, res) => {
  if (req.session.adminAuth) {
    try {
      const CategoryDetails = Category.findById({ _id: req.query.id }).then(
        (result) => {
          res.render("admin/layouts/editCategory", {
            details: result,
          });
        }
      );
    } catch (error) {
      console.log("Edit user error: " + error.message);
    }
  } else {
    res.redirect("/admin/");
  }
};

const submitEditCategory = async (req, res) => {
  if (req.session.adminAuth) {
    const updatedCategory = await Category.updateOne(
      { _id: req.query.id },
      {
        $set: {
          name: req.body.name,
          image: req.file.filename,
        },
      }
    );
    res.redirect("/admin/category");
  }
};

// Add user page
const addCategory = (req, res) => {
  if (req.session.adminAuth) {
    res.render("admin/layouts/addCategory");
  } else {
    res.redirect("/admin/");
  }
};

// Admin create category
const categorySubmit = (req, res) => {
  try {
    let newCategory = new Category({
      name: req.body.name,

      image: req.file.filename,
    });
    newCategory.save();
    res.redirect("/admin/category");
    res.send("ok");
    console.log(Product);
  } catch (error) {
    console.log(error.message);
  }
};

const adminProduct =async (req, res) => {
  if (req.session.adminAuth) {
    let search = "";
    if (req.query.search) {
      search = req.query.search;
    }
    const CategoryValue =await Category.find({})
    
    
    const productDetails = Product.find(
      {
        $or: [
          { name: { $regex: "^" + search + ".*", $options: "i" } },
          
          { model: { $regex: "^" + search + ".*", $options: "i" } },
          { color: { $regex: "^" + search + ".*", $options: "i" } },
        ],
      },
      (err, Product) => {
        
        
        res.render("admin/layouts/adminProduct", {
          details: Product,
          value : CategoryValue,
          stat: "On sale",
          unStat: "Not on sale",
          blocking: "Unlist",
          unBlock: "List",
          blockRef: "block-product",
          unblockRef: "unBlock-product",
        });
      }
    ).sort({ datefield: -1 });
  } else {
    res.redirect("/admin/");
  }
};

const addProduct = async(req, res) => {
  if (req.session.adminAuth) {
    const categoryData =await Category.find({});
    res.render("admin/layouts/addProduct",{categories : categoryData});
    
  } else {
    res.redirect("/admin/");
  }
};

const submitProduct =async (req, res) => {
  try {
    const categoryId = await Category.findOne({name : req.body.category})
    let newProduct = new Product({
      name: req.body.name,
      model: req.body.model,
      category: categoryId._id,
      description: req.body.description,
      status: true,
      stock: req.body.stock,
      color: req.body.color,
      price: req.body.price,
      image: req.file.filename,
    });
    newProduct.save();
    res.redirect("/admin/products");
  } catch (error) {
    console.log(error.message);
  }
};

const editProduct = async (req, res) => {
  if (req.session.adminAuth) {
    try {
      const categoryDetails = await Category.find({});
      
      const ProductDetails = Product.findById({ _id: req.query.id }).then(
        (result) => {
          
      
          res.render("admin/layouts/editProduct", {
            details: result,
            
            categories : categoryDetails
          });
        }
      );
    } catch (error) {
      console.log("Edit Product error: " + error.message);
    }
  } else {
    res.redirect("/admin/");
  }
};

const submitEditProduct = async (req, res) => {
  if (req.session.adminAuth) {
    const categoryId = await Category.findOne({name : req.body.category})
    const updatedProduct = await Product.updateOne(
      { _id: req.query.id },
      {
        $set: {
          name: req.body.name,
          model: req.body.model,
          category: categoryId._id,
          description: req.body.description,
          status: true,
          stock: req.body.stock,
          color: req.body.color,
          price: req.body.price,
          image: req.file.filename,
        },
      }
    );
    res.redirect("/admin/products");
  }
};

const deleteProduct= async (req, res) => {
  if (req.session.adminAuth) {
    try {
      const ProductData = await Product.findByIdAndDelete({
        _id: req.query.id,
      });
      res.redirect("/admin/products");
    } catch (error) {
      console.log("User deleting error: " + error.message);
    }
  } else {
    res.redirect("/admin/");
  }
};

const blockProduct = async (req, res) => {
  if (req.session.adminAuth) {
    const updatedProduct = await Product.updateOne(
      { _id: req.query.id },
      {
        $set: {
          status: false,
        },
      }
    );
    res.redirect("/admin/products");
  }
};

const unBlockProduct = async (req, res) => {
  if (req.session.adminAuth) {
    const updatedProduct = await Product.updateOne(
      { _id: req.query.id },
      {
        $set: {
          status: true,
        },
      }
    );
    res.redirect("/admin/products");
  }
};

const couponPage =async (req, res) => {
  if (req.session.adminAuth) {
    let search = "";
    if (req.query.search) {
      search = req.query.search;
    }

    const CouponDetails = await Coupon.find(
      {
        $or: [{ name: { $regex: "^" + search + ".*", $options: "i" } }],
      })
      res.render("admin/layouts/adminCoupons", {
        details: CouponDetails,
        stat: "Active",
        unStat: "Not active",
        blocking: "Block",
        unBlock: "Unblock",
        blockRef: "block-coupon",
        unblockRef: "unBlock-coupon",
      });
  } else {
    res.redirect("/admin/");
  }
};

const deleteCoupon= async (req, res) => {
  if (req.session.adminAuth) {
    try {
      const CouponData = await Coupon.findByIdAndDelete({
        _id: req.query.id,
      });
      res.redirect("/admin/coupon");
    } catch (error) {
      console.log("User deleting error: " + error.message);
    }
  } else {
    res.redirect("/admin/");
  }
};

const blockCoupon = async (req, res) => {
  if (req.session.adminAuth) {
    const updatedCoupon = await Coupon.updateOne(
      { _id: req.query.id },
      {
        $set: {
          status: false,
        },
      }
    );
    res.redirect("/admin/coupon");
  }
};

const unBlockCoupon = async (req, res) => {
  if (req.session.adminAuth) {
    const updatedCoupon = await Coupon.updateOne(
      { _id: req.query.id },
      {
        $set: {
          status: true,
        },
      }
    );
    res.redirect("/admin/coupon");
  }
};

const addCoupon = (req, res) => {
  if (req.session.adminAuth) {
    
    res.render("admin/layouts/addCoupon");
  } else {
    res.redirect("/admin/");
  }
};

const submitCoupon = (req, res) => {
  try {
    let newCoupon = new Coupon({
      name: req.body.name,
      value : req.body.value,
      code : req.body.code,
      status: true
      
    });
    newCoupon.save();
    res.redirect("/admin/coupon");
  } catch (error) {
    console.log(error.message);
  }
};


const adminOrder =async (req, res) => {
  if (req.session.adminAuth) {
    let search = "";
    if (req.query.search) {
      search = req.query.search;
    }

    const OrderDetails = await Order.find(
      {
        $or: [{ orderId: { $regex: "^" + search + ".*", $options: "i" } },
        { product: { $regex: "^" + search + ".*", $options: "i" } },
        { user: { $regex: "^" + search + ".*", $options: "i" } }]
        
      })
      res.render("admin/layouts/adminOrders", {
        details: OrderDetails,
        stat: "Order Active",
        unStat: "Cancelled",
        blocking: "Block",
        unBlock: "Unblock",
        blockRef: "block-order",
        unblockRef: "unBlock-order",
      });
  } else {
    res.redirect("/admin/");
  }
};

const blockOrder = async (req, res) => {
  if (req.session.adminAuth) {
    const updatedOrder = await Order.updateOne(
      { _id: req.query.id },
      {
        $set: {
          status: false,
        },
      }
    );
    res.redirect("/admin/order");
  }
};

const unBlockOrder = async (req, res) => {
  if (req.session.adminAuth) {
    const updatedOrder = await Order.updateOne(
      { _id: req.query.id },
      {
        $set: {
          status: true,
        },
      }
    );
    res.redirect("/admin/order");
  }
};

module.exports = {
  adminSignin,
  adminVerification,
  adminLogOut,
  adminCustomer,
  blockUser,
  unBlockUser,
  adminDashboard,
  adminCategory,
  deleteCategory,
  editCategory,
  submitEditCategory,
  addCategory,
  categorySubmit,
  adminProduct,
  addProduct,
  submitProduct,
  editProduct,
  submitEditProduct,
  deleteProduct,
  blockProduct,
  unBlockProduct,
  couponPage,
  deleteCoupon,
  blockCoupon,
  unBlockCoupon,
  addCoupon,
  submitCoupon,
  adminOrder,
  blockOrder,
  unBlockOrder
};
