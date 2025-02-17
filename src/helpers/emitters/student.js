const events = require("events")
const { mailSend } = require("../util")

class Emitter extends events.EventEmitter { }

const studentEmitter = new Emitter()

const studentEvents = {
    rejected: "reg_rejected",
    approved: "newRegistration"
}

studentEmitter.on(studentEvents.rejected, (email, supeName, studentName, feedback, type) => {
    const year = new Date().getFullYear()
    const content = `
    <!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Seminar Application Update</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
        }
        .container {
            max-width: 600px;
            margin: 20px auto;
            background: #ffffff;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
        }
        h2 {
            color: #333;
            text-align: center;
        }
        .studentDets {
            background: #f9f9f9;
            padding: 15px;
            border-radius: 5px;
            margin: 20px 0;
        }
        p {
            color: #555;
            font-size: 16px;
            line-height: 1.6;
        }
        .btn {
            display: block;
            width: 200px;
            text-align: center;
            background: #007BFF;
            color: white;
            padding: 10px;
            text-decoration: none;
            font-size: 18px;
            margin: 20px auto;
            border-radius: 5px;
        }
        .btn:hover {
            background: #0056b3;
        }
        .footer {
            text-align: center;
            margin-top: 20px;
            font-size: 14px;
            color: #777;
        }
    </style>
</head>
<body>
    <div class="container">
        
        <p>Hi ${studentName},</p>
        <p>Your ${type} seminar registration was rejected by your supervisor with the following feedbacks. </p>
        <p>feedback: ${feedback}. </p>
        <br>
        <p>Kindly attend to these corrections on your dashboard to proceed with your registration. </p>

        <p> Regards </p>
        
        <div class="footer">
            <p>&copy; ${year} Seminar Management. All rights reserved.</p>
        </div>
    </div>
</body>
</html>

    `
    mailSend("Seminar Application Update [Rejected]", email, content)
})

studentEmitter.on(studentEvents.approved, (email, supeName, studentName, matricNo, type) => {
    const year = new Date().getFullYear()
    const content = `
    <!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Seminar Application Approved</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
        }
        .container {
            max-width: 600px;
            margin: 20px auto;
            background: #ffffff;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
        }
        h2 {
            color: #333;
            text-align: center;
        }
        .studentDets {
            background: #f9f9f9;
            padding: 15px;
            border-radius: 5px;
            margin: 20px 0;
        }
        p {
            color: #555;
            font-size: 16px;
            line-height: 1.6;
        }
        .btn {
            display: block;
            width: 200px;
            text-align: center;
            background: #007BFF;
            color: white;
            padding: 10px;
            text-decoration: none;
            font-size: 18px;
            margin: 20px auto;
            border-radius: 5px;
        }
        .btn:hover {
            background: #0056b3;
        }
        .footer {
            text-align: center;
            margin-top: 20px;
            font-size: 14px;
            color: #777;
        }
    </style>
</head>
<body>
    <div class="container">
        
        <p>Hi ${studentName},</p>
        <p>This is to inform you that your application has been approved for the forthcoming seminar. </p>
        <p>Kindly log on to your dashboard to view your placement on the list. </p>
        
        
        <p>We look forward to seeing you there!</p> 
        <p>Regards</p>
        <div class="footer">
            <p>&copy; ${year} Seminar Management. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
    `
    mailSend("Seminar Application Approved", email, content)
})

module.exports = {
    studentEmitter,
    studentEvents
}