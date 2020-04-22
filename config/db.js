const mongoose = require('mongoose');
const config = require('config');

const db = config.get('mongoURI');

const connectDB = async () => {
    try {
        await mongoose.connect(db, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useFindAndModify: false
        });
        console.log('Database Connected..')
    } catch (err) {
        console.error(err.message);
        //PROCESS EXIT WITH FAILURE
        process.exit(1);
    }
};

module.exports = connectDB;