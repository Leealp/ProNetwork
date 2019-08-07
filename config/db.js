const mongoose = require('mongoose');
const config = require('config');           // to store global variables
const db = config.get('mongoURI');          // to get the URI that is in the default.json file

//The word “async” before a function means one simple thing: a function always returns a promise.
//Even If it actually returns a non-promise value, prepending it with 
//the “async” keyword directs JavaScript to automatically wrap that value in a resolved promise.
const connectDB = async () => {
    try {
        await mongoose.connect(db, {
            useNewUrlParser: true,
            useCreateIndex: true,   //because we had a DeprecationWarning
            useFindAndModify: false
        });
        console.log('mongoDB is connected');
    } catch(err){
        console.error(err.message);
        //exit process with failure
        process.exit(1);
    }
}

module.exports = connectDB;