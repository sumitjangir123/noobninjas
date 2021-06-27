const nodeMailer= require('../config/nodemailer');

exports.org1= (mails) => {
    let htmlString=nodeMailer.renderTemplate({mail: mails},'/new_mail/new_mail.ejs');
    console.log(htmlString);

    nodeMailer.transporter.sendMail({
       from: 'kumarsumit16022000@gmail.com',
        to: mails.to,
        subject: mails.subject,
        html: htmlString
    }, (err,info) => {
        if(err){
            console.log('err in sending mail',err);return;
        }
        console.log('Message Sent', info);
        return;
    });
}