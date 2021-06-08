// Based on https://gist.github.com/isamarietr/4e71bc75c5f91ef55bcb748e8591426a
//
// Send emails using an IBM Cloud Functions action using Node.js and the
// Nodemailer module.

// Use a payload similar to this to send the message.
/* 
    const params = {
        "server": {
            "host": "smtp.example.com",
            "port" : 465,
            "id": "your-sender-id@example.com",
            "password": "strong-password"
        },
        "email": {
            "sender": "henrik@example.com",
            "receiver": "data_henrik@example.com",
            "subject": "This is a test",
            "html": "<html><h1>subject</h1>this is the html message</html>",
            "text": "just plain text"
        }
    } */

// require Nodemailer which is included in the runtime    
var nodemailer = require('nodemailer');

// main receives params including something like above config payload
function main(params) {
    return new Promise(function (resolve, reject) {
        let response = {
            code: 200,
            msg: 'Email sent successfully'
        };

        sendEmail(params, function (email_response) {
            response.msg = email_response['msg'];
            response.code = email_response['code'];
            response.reason = email_response['reason'];
            console.log(`Email delivery response: (${email_response['code']}) ${response.msg}`);
            resolve(response);
        });

    });
}

function sendEmail(params, callback) {
    // SMTP server connection
    let transporter = nodemailer.createTransport({
        host: params.server.host,
        port: params.server.port,
        secure: true,
        auth: {
            user: params.server.id,
            pass: params.server.password
        }
    });

    // email content
    // both text and html values are optional
    let emailOptions = {
        from: params.email.sender,
        to: params.email.receiver,
        subject: params.email.subject,
        text: (params.email.text || ''),
        html: (params.email.html || '')
    };

    // send the content to the SMTP server
    transporter.sendMail(emailOptions, function (error, info) {

        let email_response = {
            code: 200,
            msg: 'Email was sent successfully',
            reason: 'Success'
        };

        if (error) {
            email_response.msg = 'Error';
            email_response.code = 500;
            email_response.reason = error;
        }
        else {
            email_response.msg = info.response;
            email_response.code = 200;
            email_response.reason = info.response;
        }
        callback(email_response);
    });
}