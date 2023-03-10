const mongoose = require('mongoose');
mongoose.set('strictQuery', true);
require('dotenv').config()

mongoose.connect(process.env.MONGO_URL, 
    {useNewUrlParser : true},
    (err) => {
        if (!err) {
            console.log("Database Connected..!");
        }
        else{
            console.log("DB error: " + err);
        }
    }
);

require('./userModels');