const express = require('express');
const router = express.Router();
const passport = require('passport');

//setting up user controller call
const userController = require("../controllers/user_controller");

router.get("/signUp", userController.signUp);
router.get("/signIn", userController.signIn);
router.post("/create_user", userController.create_user);
router.get('/forgotPasswordEnterMail', userController.EnterMail);
router.post('/reset-password', userController.resetPassword);
router.post('/create-mail', userController.createMail);
router.get('/reset-password/:token', userController.resetForm);
router.get('/mail/:id',passport.checkAuthentication,userController.showmail);
router.get('/mail/destroy/:id',passport.checkAuthentication,userController.destroy);
router.get('/mailservices',passport.checkAuthentication,userController.mailpage);
router.post('/set-new-password', userController.setNewPass);

//use passport as an middleware to authenticate
router.post("/create_session", passport.authenticate(
    'local',
    { failureRedirect: '/users/signIn' }
), userController.createSession);
router.get('/signOut', userController.destroySession);

//google login
router.get('/auth/google', passport.authenticate('google', {
    scope: ['profile', 'email'],    
}));

router.get('/auth/google/callback', passport.authenticate(
    'google',
    { failureRedirect: '/users/signIn' }
), userController.createSession);

//make it available for index.js
module.exports = router;
