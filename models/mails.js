const mongoose = require('mongoose');

const mailSchema = new mongoose.Schema({
    to: {
        type: String,
        required:true
    },
    name: {
        type: String,//sender name
        required:true
    },
    cc: {
        type: String
    },
    subject: {
        type: String,
        required:true
    },
    body: {
        type: String
    },
    from: {
        type: String,
        required:true
    },
    isDeleted:{
            type : Boolean
    }
}, {
    timestamps: true
});

const Mail = mongoose.model('Mail', mailSchema);
module.exports = Mail;
