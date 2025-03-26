const nodemailer = require('nodemailer');


const transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false, 
    auth: {
        user: 'shanie15@ethereal.email',
        pass: 'CMbVpZgdBjp4nVbHdH'
    }
});

module.exports = transporter;
