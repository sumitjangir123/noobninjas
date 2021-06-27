const nodeMailer= require('../config/nodemailer');

exports.user1= (user) => {
    let htmlString=nodeMailer.renderTemplate({user: user},'/new_user/new_user.ejs');
    nodeMailer.transporter.sendMail({
       from: 'kumarsumit16022000@gmail.com',
        to: user.email,
        subject: 'Welcome to the world of Noob Ninjas!',
        html: htmlString
    }, (err,info) => {
        if(err){
            console.log('err in sending mail',err);return;
        }
        console.log('Message Sent', info);
        return;
    });
}