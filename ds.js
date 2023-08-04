const mongoose = require('mongoose');
const mongoURI = "mongodb://127.0.0.1:27017/inotebookdb"

const connectDB = async () => {
    try {
        await mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });
        console.log("successfully connected");
    } catch (err) {
        console.log(err);
    }
}


module.exports = connectDB;
