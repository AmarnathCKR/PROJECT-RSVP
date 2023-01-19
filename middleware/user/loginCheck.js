const User = require("../../models/userModels");
module.exports = {
  loged: async (req, res, next) => {
    try {
      
      if (!req.session.auth) {
        next();
      } else {
        res.redirect("/");
      }
    } catch (err) {
      console.log("error in is Login" + err);
    }
  },
};
