const nodemailer = require('nodemailer');

let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'shahshubh1010@gmail.com',
        pass: 'chandra#401'
    }
});


let mailOptions = {
    from: 'shahshubh1010@gmail.com',
    to: 'shahshubh251@gmail.com',
    subject: 'ORDER',
    text: 'Hello it worked from nodemailer'
};

transporter.sendMail(mailOptions, function(err,data){
    if(err){
        console.log("Failed ",err);
    }
    else{
        console.log("Email sent !!");
    }
});
