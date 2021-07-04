const fs= require('fs');
const rfs= require('rotating-file-stream');
const path= require('path');

const logDirectory= path.join(__dirname, '../production_logs');
//if logDirectory is not exist than create it 
fs.existsSync(logDirectory) || fs.mkdirSync(logDirectory);

const accessLogStream= rfs.createStream('access.log',{
  interval: '1d',
  path: logDirectory
});

const development= {
    name: 'development',
    asset_path: './assets',
    session_cookie_key: 'something_something',
    db: 'noobworld',
    smtp: {
        service: 'gmail',
        host: 'smtp.gmail.com',
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
          user: 'thethunderbirdus@gmail.com',
          pass: '********'
        }
    },
    google_client_id: "922852696533-qrr4lrcdb3uj5sjdjcqi1g90fc5mpsoq.apps.googleusercontent.com",
    google_client_secret: "Vu8_IYaYygO-z07kp80i7356",
    google_call_back_url: "https://noobninjas.ml/users/auth/google/callback",

    morgan: {
      mode: 'dev',
      options: {stream: accessLogStream}
    }

}


const production= {
    name: 'production',
    asset_path: process.env.THUNDER_ASSET_PATH,
    session_cookie_key: process.env.THUNDER_SESSION_COOKIE_KEY,
    db:process.env.NOOB_DB,
    // process.env.THUNDER_DB
    smtp: {
        service: 'gmail',
        host: 'smtp.gmail.com',
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
          user: process.env.THUNDER_GMAIL_USERNAME,
          pass: process.env.THUNDER_GMAIL_PASSWORD
        }
    },
    google_client_id: process.env.GOOGLE_CLIENT_ID,
    google_client_secret: process.env.GOOGLE_CLIENT_SECRET,
    google_call_back_url: process.env.GOOGLE_CALLBACK_URL,

    morgan: {
      mode: 'combined',
      options: {stream: accessLogStream}
    } 
}

// eval(process.env.THUNDER_ENVIRONMENT)==undefined ? development : eval(process.env.THUNDER_ENVIRONMENT)
module.exports= development;
