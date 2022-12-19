const User = require("../models/userModels");

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
const adminDashboard = (req,res)=>{
  if (req.session.adminAuth) {
    res.render('admin/layouts/adminDashboard')
  }
}


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
          stat : "Active",
          unStat : 'Blocked',
          blocking: "Block",
          unBlock: "Unblock",
          blockRef : 'block-user',
          unblockRef : 'unBlock-user'
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
    res.redirect('/admin/customer')
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
    res.redirect('/admin/customer')
  }
};


// Admin Logout
const adminLogOut = (req, res) => {
  req.session.destroy();
  console.log("Admin session destroyed");
  res.redirect("/admin/");
  res.end();
};

module.exports = {
  adminSignin,
  adminVerification,
  adminLogOut,
  adminCustomer,
  blockUser,
  unBlockUser,
  adminDashboard
};
