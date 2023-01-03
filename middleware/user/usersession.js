const User = require("../../models/userModels");
module.exports = {
  isLogin: async (req, res, next) => {
    try {
      const user = await User.findOne({ email: req.session.auth });
      if (req.session.auth && user.status == true) {
        next();
      } else {
        res.redirect("/login");
      }
    } catch (err) {
      console.log("error in is Login" + err);
    }
  },
};
