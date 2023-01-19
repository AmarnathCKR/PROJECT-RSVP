const User = require("../../models/userModels");
module.exports = {
  loged: async (req, res, next) => {
    try {
      const userValid = await User.find({ email: req.session.auth });
      if (!req.session.auth) {
        next();
      } else if( userValid.status == false || req.session.auth ) {
        next();
      }else{
        res.redirect("/");
      }
    } catch (err) {
      console.log("error in is Login" + err);
    }
  },
};
