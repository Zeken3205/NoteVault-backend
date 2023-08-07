const mongoose = require('mongoose');
const mongoURI = "mongodb://127.0.0.1:27017/inotebookdb";

const connectDB = () => {
    return mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
        .then(() => {
            console.log("Successfully connected to the database");
        })
        .catch((err) => {
            console.log("Error connecting to the database:", err);
            throw err;
        });
};

module.exports = connectDB;