const nodeMailer= require('../config/nodemailer');

exports.newmail1= (mailData) => {
    let htmlString=nodeMailer.renderTemplate({mail: mailData},'/new_mail/new_mail.ejs');
    nodeMailer.transporter.sendMail({
       from: 'kumarsumit16022000@gmail.com',
        to: mailData.to,
        cc:mailData.cc,
        subject: mailData.subject,
        html: htmlString
    }, (err,info) => {
        if(err){
            console.log('err in sending mail',err);return;
        }
        console.log('Message Sent', info);
        return;
    });
}