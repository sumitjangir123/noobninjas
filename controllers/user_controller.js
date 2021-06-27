const User = require("../models/user");
const Mail = require("../models/mails");
const fs = require('fs');
const path = require('path');
const resetPasswordEmail = require('../workers/reset_password_email');
const ResetPasswordToken = require('../models/reset_password_token');
const crypto = require('crypto');
var mongoose = require('mongoose');
const { sync } = require("gulp-sass");
const { localsName } = require("ejs");
const queue = require('../config/kue');
const fornewmail= require('../mailers/new_mail');
const cron = require('node-cron');

module.exports.createMail =async function (req, res) {
    if (req.isAuthenticated()) {
      
        let mail = await Mail.create({
            name: req.user.name,
            from: req.user.email,
            to:req.body.to,
            cc: req.body.cc,
            subject: req.body.subject,
            body: req.body.body,
            isDeleted:false
          });

        // sending mail

        if(req.body.time == "30"){
            console.log("0");
            cron.schedule('30 * * * * *', () => {
                fornewmail.newmail1(mail);
                console.log('running a task every 30 seconds');
            });
            req.flash("success","Mail successfully scheduled! you will receive mails after every 30 seconds pls wait patiently.");
            return res.redirect("back");
        }else{

            fornewmail.newmail1(mail);
        }

        req.flash("success","Mail successfully scheduled! you will receive mails after every week/month pls wait patiently.");
        return res.redirect("/users/mailservices");

    }else{
        return res.render('user_sign_up', {
            title: "NB ! Sign Up"
        })
    }
    
  
}


module.exports.mailpage =async function (req, res) {
    console.log("hih")
    if (req.isAuthenticated()) {
        let mail = await Mail.find({from : req.user.email,isDeleted:false});
        let deletedmail = await Mail.find({from : req.user.email,isDeleted:true});
        return res.render('mailpage', {
            title: "Noob Ninjas",
            mail:mail,
            deletedmail:deletedmail
        });
    }

    return res.render('user_sign_up', {
        title: "NB ! Sign Up"
    })
}
module.exports.showmail =async function (req, res) {
    if (req.isAuthenticated()) {
        let mail= await Mail.findOne({_id:req.params.id}).sort('-createdAt');
        return res.render('mailshow', {
            title: "Your Mail",
            mail:mail
        })
    }

    return res.render('user_sign_up', {
        title: "NB ! Sign Up"
    })
}


module.exports.destroy =async function (req, res) {
    if (req.isAuthenticated()) {

        let mail =await Mail.findOne({ _id: req.params.id });

        mail.isDeleted=true;
        await mail.save();

        req.flash("success","Deleted!");
            return res.redirect("back");
    }
    req.flash("error","Nope! sing in first");
    return res.render('user_sign_in', {
        title: "NB ! Sign In"
    })
}

module.exports.signUp = function (req, res) {
    if (req.isAuthenticated()) {
        return res.redirect('/');
    }else{
        return res.render('user_sign_up', {
            title: "NB ! Sign Up"
        })
    }
}

module.exports.signIn = function (req, res) {

    if (req.isAuthenticated()) {
        return res.redirect('/');
    }

    return res.render('user_sign_in', {
        title: "NB ! SignIn"
    })

}

module.exports.create_user =async function (req, res) {
    if ( req.body.password != req.body.repassword) {
        req.flash("error","password is not matching !")
        res.redirect('back');
    }else{
        console.log(req.body.password);
        let check=await User.findOne({email:req.body.email});

        if(check != null){
            req.flash("error","you are already registered !");
            return res.redirect('/users/signIn');
        }
    
        User.create({
            name: req.body.name,
            email: req.body.email,
            password: req.body.password,
          }, function (err, user) {
            if (err) { 
                console.log(err);
                req.flash("error","Error while registering!");
                return res.redirect('back');
            }
          });
    
        req.flash("success","user successfully registered");
        return res.redirect('/users/signIn');

    }


  
}

// sign in and create a session for the user
module.exports.createSession = function (req, res) {
    
    if(!req.user.registered){
        req.flash('warning', 'First Things First Pls Register');
        return res.redirect('/');
    }else{
        req.flash('success', 'WELCOME '+ req.user.name);
        return res.redirect('/');
    }
    
    
}

//to sign out the user
module.exports.destroySession = function (req, res) {
    req.logout();
    req.flash('success', 'session destroyed');
    return res.redirect('/');
}

module.exports.update = async function (req, res) {

    if (req.user.id == req.params.id) {
        try {
            let user = await User.findById(req.params.id);
            User.uploadAvatar(req, res, function (err) {
                if (err) {
                    console.log('****multer error', err);
                }

                user.name = req.body.name;
                user.email = req.body.email;

                if (req.file) {

                    // if (fs.existsSync(path.join(__dirname, '..', user.avatar))) {
                    //     fs.unlinkSync(path.join(__dirname, '..', user.avatar));
                    // }

                    //this is saving the path of the uploaded file into the avatar field in the user
                    user.avatar = User.avatarPath + '/' + req.file.filename;
                }
                user.save();
                return res.redirect('back');
            });
        } catch (error) {
            req.flash('error', 'Unauthorized');
            return res.redirect('back');
        }
    } else {
        req.flash('error', 'Unauthorized');
        return res.status(401).send('Unauthorized');
    }

}

module.exports.EnterMail = function (req, res) {
    res.render('enterMail', {
        title: 'Reset Your Password'
    })
}

module.exports.resetPassword = async function (req, res) {
    try {
        let user = await User.findOne({ email: req.body.email });

        if (user) {
            let resetToken = await ResetPasswordToken.create({
                user: user._id,
                token: crypto.randomBytes(20).toString('hex')
            });

            resetToken = await resetToken.populate('user', 'name email').execPopulate();
            // commentsMailer.newComment(comment);

            let job = queue.create('passQueue', resetToken).save(function (err) {
                if (err) { console.log('error in creating a queue', err); return; }

                console.log('job enqueued', job.id)
            })

            req.flash('success', 'check your email account, your token will be expire in 5 mins');
            return res.redirect('back');

        } else {
            req.flash('error', 'Looks like the user is not registered!');
            return res.redirect('back');
        }
    } catch (error) {
        console.log('Error', error); return;
    }
}

module.exports.resetForm = async function (req, res) {
    // console.log(req.params.token);
    let resetPasswordToken = await ResetPasswordToken.findOne({ token: req.params.token });

    if (resetPasswordToken) {
            let doc = {
                updatedAt: Date.now(),
            }

            ResetPasswordToken.findByIdAndUpdate(resetPasswordToken.id, doc, function (err, raw) {
                return res.render('passResForm', {
                    title: 'Enter your password',
                    token: req.params.token
                });
            });
        
    } else {
        req.flash('error', 'your token has been expired ! Generate a new one');
        return res.redirect('back');
    }
}

module.exports.setNewPass = async function (req, res) {
    try {

        if (req.body.password != req.body.confirm_password) {
            req.flash('error', 'bhai password to sahi daal de :( ');
            return res.redirect('back');
        }

        let user = await ResetPasswordToken.findOne({ token: req.body.token });

        if (user) {
            user = await user.populate('user').execPopulate();

            let pass = {
                password: req.body.password
            }

            User.findByIdAndUpdate(user.user.id, pass, function (err, raw) {
                req.flash('success', 'Woo-hoo! your password has been changed');
                return res.redirect('/users/signIn');
            });
        } else {
            console.log('user not found'); return;
        }
    } catch (error) {
        console.log('error', error); return;
    }
}