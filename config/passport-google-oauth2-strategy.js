const fs = require('fs');
const readline = require('readline');
const queue = require('../config/kue');
const resetPasswordEmail = require('../workers/onetimepass');


//this part is for passport auth2.0
const passport = require('passport');
const googleStrategy = require('passport-google-oauth').OAuth2Strategy;
const crypto = require('crypto');
const User = require('../models/user');
const env = require('./environment');
const { json } = require('express');

//tell passport to use a new strategy for google login 
passport.use(new googleStrategy({
  clientID: "*********",
  clientSecret: "********",
  callbackURL: "https://noobninjas.ml/users/auth/google/callback"
},
  function (accessToken, requestParams, profile, cb) {
    //find a user 
    User.findOne({ email: profile.emails[0].value }).exec(function (err, user) {
      if (err) { console.log('error in google strategy-passport', err); return; }
      if (user) {
        //if user is found, set this user as req.user
        return cb(null, user);
      } else {

        //if not found then create the user and set it as req.user
        console.log(profile);
        User.create({
          name: profile.displayName,
          email: profile.emails[0].value,
          password: crypto.randomBytes(20).toString('hex'),
          avatar: profile.photos[0].value,
        }, function (err, user) {
          if (err) { console.log('error in creating the user in google strategy-passport', err); return; }
          else {

            //mailing password for the first time
              let job = queue.create('userQueue', user).save(function (err) {
                if (err){ 
                  console.log('error in creating a queue at passport oauth2', err);  return cb(null, user);
                }
                  console.log('job enqueued', job.id)
              })

            return cb(null, user);
          }
        });
      }
    });
  }
));

module.exports = passport;
