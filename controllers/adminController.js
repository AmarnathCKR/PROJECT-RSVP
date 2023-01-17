const User = require("../models/userModels");
const Category = require("../models/categoryModel");
const Product = require("../models/productModel");
const Coupon = require("../models/couponModel");
const Order = require("../models/orderModel");
const Banner = require("../models/bannerModel");
const mongoose = require("mongoose");
const excelJS = require("exceljs");
const cloudinary = require("cloudinary").v2;

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
  const userDetails = await User.find({});

  res.render("admin/layouts/adminCustomers", {
    details: userDetails,
    stat: "Active",
    unStat: "Blocked",
    blocking: "Block",
    unBlock: "Unblock",
    blockRef: "block-user",
    unblockRef: "unBlock-user",
  });
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

const adminCategory = async (req, res) => {
  if (req.session.adminAuth) {
    const category = await Category.find({});

    res.render("admin/layouts/adminCategory", {
      details: category,
      stat: "On sale",
      unStat: "Not on sale",
      blocking: "Unlist",
      unBlock: "List",
      blockRef: "block-category",
      unblockRef: "unBlock-category",
    });
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
      await Category.findById({ _id: req.query.id }).then((result) => {
        res.render("admin/layouts/editCategory", {
          details: result,
        });
      });
    } catch (error) {
      console.log("Edit user error: " + error.message);
    }
  } else {
    res.redirect("/admin/");
  }
};

const submitEditCategory = async (req, res) => {
  if (req.session.adminAuth) {
    cloudinary.config({
      cloud_name: process.env.CLOUD_NAME,
      api_key: process.env.CLOUD_API,
      api_secret: process.env.CLOUD_API_SECRET,
    });

    // Upload
    let fileName = req.file;

    const resp = cloudinary.uploader.upload(fileName.path, {
      transformation: [
        { width: 1440, height: 1920, gravity: "face", crop: "fill" },
      ],
    });
  

    resp
      .then((data) => {
        console.log(data.secure_url);
        Category.updateOne(
          { _id: req.query.id },
          {
            $set: {
              name: req.body.name,
              image: data.secure_url,
              status: true,
            },
          }
        );
        res.redirect("/admin/category");
      })
      .catch((err) => {
        console.log(err);
      });

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


    cloudinary.config({
      cloud_name: process.env.CLOUD_NAME,
      api_key: process.env.CLOUD_API,
      api_secret: process.env.CLOUD_API_SECRET,
    });

    // Upload
    let fileName = req.file;
    console.log(fileName)
    const resp = cloudinary.uploader.upload(fileName.path, {
      transformation: [
        { width: 1440, height: 1920, gravity: "face", crop: "fill" },
      ],
    });
    // const resp = cloudinary.url(filenamesss,{ transformation: [
    //   { width: 485, height: 485, gravity: "face", crop: "fill" },
    // ]})

    resp
      .then((data) => {
        console.log(data.secure_url);
        let newCategory = new Category({
          name: req.body.name,
    
          image: data.secure_url,
        });
        newCategory.save();
        res.redirect("/admin/category");
        
      })
      .catch((err) => {
        console.log(err);
      });

    
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
    cloudinary.config({
      cloud_name: process.env.CLOUD_NAME,
      api_key: process.env.CLOUD_API,
      api_secret: process.env.CLOUD_API_SECRET,
    });

    let allImages = [];

    console.log(allImages);

    const files = req.files;
    const promises = await files.map((file) => {
      return new Promise((resolve, reject) => {
        cloudinary.uploader.upload(
          file.path,
          {
            transformation: [
              { width: 1440, height: 1920, gravity: "face", crop: "fill" },
            ],
          },
          (error, result) => {
            if (error) {
              reject(error);
            } else {
              resolve(result);
            }
          }
        );
      });
    });

    Promise.all(promises).then(async (results) => {
      console.log("All files uploaded successfully", results);
      let newProduct = new Product({
        name: req.body.name,
        model: req.body.model,
        category: mongoose.Types.ObjectId(req.body.category),
        description: req.body.description,
        status: true,
        stock: req.body.stock,
        color: req.body.color,
        price: req.body.price,
        image: results,
      });
      // newProduct.save();

      newProduct.save();

      res.redirect("/admin/products");
    });
  } catch (error) {
    console.log(error.message);
  }
};

const editProduct = async (req, res) => {
  if (req.session.adminAuth) {
    try {
      const categoryDetails = await Category.find({});

      await Product.findById({ _id: req.query.id }).then((result) => {
        res.render("admin/layouts/editProduct", {
          details: result,

          categories: categoryDetails,
        });
      });
    } catch (error) {
      console.log("Edit Product error: " + error.message);
    }
  } else {
    res.redirect("/admin/");
  }
};

const submitEditProduct = async (req, res) => {
  // Configuration
  cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API,
    api_secret: process.env.CLOUD_API_SECRET,
  });

  const allImages = [];

  const files = req.files;
  const promises = await files.map((file) => {
    return new Promise((resolve, reject) => {
      cloudinary.uploader.upload(
        file.path,
        {
          transformation: [
            { width: 1440, height: 1920, gravity: "face", crop: "fill" },
          ],
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        }
      );
    });
  });

  Promise.all(promises).then(async (results) => {
    console.log("All files uploaded successfully", results);
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
          image: results,
        },
      }
    );

    res.redirect("/admin/products");
  });
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
    const OrderDetails = await Order.find({})
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

    cloudinary.config({
      cloud_name: process.env.CLOUD_NAME,
      api_key: process.env.CLOUD_API,
      api_secret: process.env.CLOUD_API_SECRET,
    });

    // Upload
    let fileName = req.file;
    console.log(fileName)

    const resp = cloudinary.uploader.upload(fileName.path, {
      transformation: [
        { width: 1341, height: 213, gravity: "face", crop: "fill" },
      ],
    });
  

    resp
      .then((data) => {
        console.log(data.secure_url);
        let newBanner = new Banner({
          status: true,
          image:data.secure_url,
        });
        newBanner.save();
        res.redirect("/admin/banner");
      })
      .catch((err) => {
        console.log(err);
      });




    
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

const salesReport = async (req, res) => {
  if (req.session.adminAuth) {
    const OrderDetails = await Order.find({})
      .populate("product.productId")
      .populate("customer");
    try {
      const workbook = new excelJS.Workbook();
      const worksheet = workbook.addWorksheet("Sales Roport");
      worksheet.columns = [
        { header: "s no.", key: "s_no" },
        { header: "Date", key: "data" },
        { header: "User", key: "user" },
        { header: "Payment", key: "payment" },
        { header: "Status", key: "status" },
        { header: "Items", key: "item" },
        { header: "total", key: "total" },
      ];
      let counter = 1;

      OrderDetails.forEach((sale) => {
        const date = sale.date;
        const isoString = date.toISOString();
        const newDate = isoString.split("T")[0];
        sale.data = newDate;
        sale.s_no = counter;
        sale.user = sale.address[0].name;
        sale.payment = sale.orderType;
        sale.total = sale.finalPrice;
        sale.item = sale.product.length;
        worksheet.addRow(sale);
        counter++;
      });

      worksheet.getRow(1).eachCell((cell) => {
        cell.font = { bold: true };
      });

      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheatml.sheet"
      );

      res.setHeader(
        "Content-Disposition",
        `attachment; filename=sales_Report.xlsx`
      );

      return workbook.xlsx.write(res).then(() => {
        res.status(200);
      });
    } catch (error) {
      console.log(error.message);
    }
  }
};

const chartReport = async (req, res) => {
  const OrderDetails = await Order.find({});

  let cod = 0;
  let pay = 0;
  for (let i = 0; i < OrderDetails.length; i++) {
    if (OrderDetails[i].orderType === "COD") {
      cod = cod + 1;
    }

    if (OrderDetails[i].orderType === "PayPal") {
      pay = pay + 1;
    }
  }
  console.log(cod + " " + pay);
  res.json({ cod, pay });
};

const areaChartReport = async (req, res) => {
  const OrderDetails = await Order.aggregate([
    { $project: { month: { $month: "$date" }, price: "$finalPrice" } },
  ]);
  let jan = 0;
  let feb = 0;
  let march = 0;
  let april = 0;
  let may = 0;
  let june = 0;
  let july = 0;
  let aug = 0;
  let sept = 0;
  let oct = 0;
  let nov = 0;
  let dec = 0;

  // console.log(OrderDetails)

  OrderDetails.forEach(function (items) {
    if (items.month == 1) {
      jan = jan + items.price;
    } else if (items.month == 2) {
      feb = feb + items.price;
    } else if (items.month == 3) {
      march = march + items.price;
    } else if (items.month == 4) {
      april = april + items.price;
    } else if (items.month == 5) {
      may = may + items.price;
    } else if (items.month == 6) {
      june = june + items.price;
    } else if (items.month == 7) {
      july = july + items.price;
    } else if (items.month == 8) {
      aug = aug + items.price;
    } else if (items.month == 9) {
      sept = sept + items.price;
    } else if (items.month == 10) {
      oct = oct + items.price;
    } else if (items.month == 11) {
      nov = nov + items.price;
    } else if (items.month == 12) {
      dec = dec + items.price;
    }
  });

  res.json({
    jan,
    feb,
    march,
    april,
    may,
    june,
    july,
    aug,
    sept,
    oct,
    nov,
    dec,
  });
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
  chartReport,
  areaChartReport,
};
