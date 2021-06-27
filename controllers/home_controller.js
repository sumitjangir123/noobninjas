const db = require('../config/mongoose');
const User = require("../models/user");
const Mail = require("../models/mails");
//home controller

module.exports.home = async function (req, res) {

    try {
        return res.render('home', {
            title: "Noob Ninjas",
        });
    } catch (err) {
        console.log('Error', err);
        return;
    }
}