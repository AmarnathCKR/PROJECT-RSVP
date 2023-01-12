const User = require("../models/userModels");
const Category = require("../models/categoryModel");
const Product = require("../models/productModel");
const Coupon = require("../models/couponModel");
const Order = require("../models/orderModel");
const Banner = require("../models/bannerModel");
const mongoose = require("mongoose");
const excelJS = require('exceljs');

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


const adminDashboard = async (req, res) => {
  if (req.session.adminAuth) {
    const OrderDetails = await Order.find({})
      .populate("product.productId")
      .populate("customer");
    res.render("admin/layouts/adminDashboard", { OrderDetails });
  }
};

const adminCustomer = async (req, res) => {
  if (req.session.adminAuth) {
    let search = "";
    if (req.query.search) {
      search = req.query.search;
    }

    await User.find(
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

const blockUser = async (req, res) => {
  if (req.session.adminAuth) {
     await User.updateOne(
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
    await User.updateOne(
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

const adminLogOut = (req, res) => {
  req.session.destroy();
  console.log("Admin session destroyed");
  res.redirect("/admin/");
  res.end();
};

const adminCategory =async (req, res) => {
  if (req.session.adminAuth) {
    let search = "";
    if (req.query.search) {
      search = req.query.search;
    }

    await Category.find(
      {
        $or: [{ name: { $regex: "^" + search + ".*", $options: "i" } }],
      },
      (err, Category) => {
        res.render("admin/layouts/adminCategory", {
          details: Category,
          stat: "On sale",
          unStat: "Not on sale",
          blocking: "Unlist",
          unBlock: "List",
          blockRef: "block-category",
          unblockRef: "unBlock-category",
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
      await Category.findByIdAndDelete({
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
      await Category.findById({ _id: req.query.id }).then(
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
    await Category.updateOne(
      { _id: req.query.id },
      {
        $set: {
          name: req.body.name,
          image: req.file.filename,
          status: true,
        },
      }
    );
    res.redirect("/admin/category");
  }
};

const blockCategory = async (req, res) => {
  if (req.session.adminAuth) {
    await Category.updateOne(
      { _id: req.query.id },
      {
        $set: {
          status: false,
        },
      }
    );
    res.redirect("/admin/category");
  }
};

const unblockCategory = async (req, res) => {
  if (req.session.adminAuth) {
    await Category.updateOne(
      { _id: req.query.id },
      {
        $set: {
          status: true,
        },
      }
    );
    res.redirect("/admin/category");
  }
};


const addCategory = (req, res) => {
  if (req.session.adminAuth) {
    res.render("admin/layouts/addCategory");
  } else {
    res.redirect("/admin/");
  }
};


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

const adminProduct = async (req, res) => {
  if (req.session.adminAuth) {
    const productDetails = await Product.find({}).populate("category");

    res.render("admin/layouts/adminProduct", {
      details: productDetails,

      stat: "On sale",
      unStat: "Not on sale",
      blocking: "Unlist",
      unBlock: "List",
      blockRef: "block-product",
      unblockRef: "unBlock-product",
    });
  } else {
    res.redirect("/admin");
  }
};

const addProduct = async (req, res) => {
  if (req.session.adminAuth) {
    const categoryData = await Category.find({});
    res.render("admin/layouts/addProduct", { categories: categoryData });
  } else {
    res.redirect("/admin/");
  }
};

const submitProduct = async (req, res) => {
  try {
    

    const allImages = [
      req.files[0].filename,
      req.files[1].filename,
      req.files[2].filename,
      req.files[3].filename,
      req.files[4].filename,
      req.files[5].filename,
    ];
    let newProduct = new Product({
      name: req.body.name,
      model: req.body.model,
      category: mongoose.Types.ObjectId(req.body.category),
      description: req.body.description,
      status: true,
      stock: req.body.stock,
      color: req.body.color,
      price: req.body.price,
      image: allImages,
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

      await Product.findById({ _id: req.query.id }).then(
        (result) => {
          res.render("admin/layouts/editProduct", {
            details: result,

            categories: categoryDetails,
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
    const allImages = [
      req.files[0].filename,
      req.files[1].filename,
      req.files[2].filename,
      req.files[3].filename,
      req.files[4].filename,
      req.files[5].filename,
    ];
   await Product.updateOne(
      { _id: req.query.id },
      {
        $set: {
          name: req.body.name,
          model: req.body.model,
          category: mongoose.Types.ObjectId(req.body.category),
          description: req.body.description,
          status: true,
          stock: req.body.stock,
          color: req.body.color,
          price: req.body.price,
          image: allImages,
        },
      }
    );
    res.redirect("/admin/products");
  }
};

const deleteProduct = async (req, res) => {
  if (req.session.adminAuth) {
    try {
      await Product.findByIdAndDelete({
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
    await Product.updateOne(
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
    await Product.updateOne(
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

const couponPage = async (req, res) => {
  if (req.session.adminAuth) {
    const couponData = await Coupon.find({});

    res.render("admin/layouts/adminCoupons", {
      details: couponData,

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

const deleteCoupon = async (req, res) => {
  if (req.session.adminAuth) {
    try {
       await Coupon.findByIdAndDelete({
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
    await Coupon.updateOne(
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
    await Coupon.updateOne(
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

const addCoupon = async (req, res) => {
  if (req.session.adminAuth) {
    let products = await Product.find({});
    res.render("admin/layouts/addCoupon", { details: products });
  } else {
    res.redirect("/admin/");
  }
};

const submitCoupon = async (req, res) => {
  try {
    console.log(req.body.newProduct);

    let newCoupon = new Coupon({
      name: req.body.name,

      discount: req.body.code,
      status: true,
      originalPrice: req.body.ogPrice,
      finalPrice: req.body.fPrice,
      expirationTime: req.body.expDate,
    });
    newCoupon.save();
    res.redirect("/admin/coupon");
  } catch (error) {
    console.log(error.message);
  }
};

const adminOrder = async (req, res) => {
  if (req.session.adminAuth) {
    let search = "";
    if (req.query.search) {
      search = req.query.search;
    }

    const OrderDetails = await Order.find({
      $or: [
        { status: { $regex: "^" + search + ".*", $options: "i" } },
        { coupon: { $regex: "^" + search + ".*", $options: "i" } },
        { orderType: { $regex: "^" + search + ".*", $options: "i" } },
      ],
    })
      .populate("product.productId")
      .populate("customer");
    res.render("admin/layouts/adminOrders", {
      details: OrderDetails,
      stat: "Order Active",
      unStat: "Cancelled",
      blocking: "Cancel",
      unBlock: "Resume",
      blockRef: "block-order",
      unblockRef: "unBlock-order",
    });
  } else {
    res.redirect("/admin/");
  }
};

const bannerPage = async (req, res) => {
  if (req.session.adminAuth) {
    const bannerData = await Banner.find({});

    res.render("admin/layouts/adminBanner", {
      details: bannerData,

      stat: "Active",
      unStat: "Not active",
      blocking: "UnList",
      unBlock: "List",
      blockRef: "block-banner",
      unblockRef: "unBlock-banner",
    });
  } else {
    res.redirect("/admin/");
  }
};

const addBanner = async (req, res) => {
  if (req.session.adminAuth) {
    res.render("admin/layouts/addBanner");
  } else {
    res.redirect("/admin/");
  }
};

const submitBanner = async (req, res) => {
  try {
    let newBanner = new Banner({
      status: true,
      image: req.file.filename,
    });
    newBanner.save();
    res.redirect("/admin/banner");
  } catch (error) {
    console.log(error.message);
  }
};

const blockBanner = async (req, res) => {
  if (req.session.adminAuth) {
     await Banner.updateOne(
      { _id: req.query.id },
      {
        $set: {
          status: false,
        },
      }
    );
    res.redirect("/admin/banner");
  }
};

const unBlockBanner = async (req, res) => {
  if (req.session.adminAuth) {
     await Banner.updateOne(
      { _id: req.query.id },
      {
        $set: {
          status: true,
        },
      }
    );
    res.redirect("/admin/banner");
  }
};

const changeOrder = async (req, res) => {
  console.log("been here");
  

 await Order.updateOne(
    { _id: req.body.id },
    {
      $set: { status: req.body.stu },
    }
  );
  res.json({ data: req.body.stu });
};

const salesReport=async (req,res)=>{
  if(req.session.adminAuth){
    const OrderDetails = await Order.find({})
      .populate("product.productId")
      .populate("customer");
      try{
        const workbook = new excelJS.Workbook();
        const  worksheet = workbook.addWorksheet("Sales Roport")
        worksheet.columns=[
          {header:"s no.", key:"s_no"},
          {header:"Date", key:"data"},
          {header:"User", key:"user"},
          {header:"Payment", key:"payment"},
          {header:"Status", key:"status"},
          {header:"Items", key:"item"},
          {header:"total", key:"total"},
        ];
        let counter =1;
        
        
        OrderDetails.forEach((sale)=>{
          const date = sale.date;
          const isoString = date.toISOString();
          const newDate = isoString.split('T')[0];
          sale.data=newDate
        sale.s_no = counter;
        sale.user=sale.address[0].name
        sale.payment = sale.orderType
        sale.total = sale.finalPrice
        sale.item=sale.product.length
        worksheet.addRow(sale);
        counter++;
        });
        
        
        worksheet.getRow(1).eachCell((cell)=>{
          cell.font={bold:true};
        });
        
        res.setHeader(
          'Content-Type',
          'application/vnd.openxmlformats-officedocument.spreadsheatml.sheet'
        );
        
        res.setHeader('Content-Disposition',`attachment; filename=sales_Report.xlsx`);
        
        return workbook.xlsx.write(res).then(()=>{
          res.status(200);
        });
        
          }
          catch(error){
        console.log(error.message)
          }
        
  }
}

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
  blockCategory,
  unblockCategory,
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

  bannerPage,
  addBanner,
  submitBanner,
  blockBanner,
  unBlockBanner,
  changeOrder,
  salesReport,
};
