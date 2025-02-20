const {EventEmitter} = require("events")
const { mailSend } = require("../util")


const errorEmitter = new EventEmitter()

const errorEvents = {
    err :"error"
}

errorEmitter.on(errorEvents.err, function (error, stack, user, session){
    const content = `
    <!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Error Notification</title>
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
        
        <p>Hi,</p>
        <p>Error occured on the seminar site, kindly check this and fix. </p>
        
        <div class="studentDets">
            <p><strong>Error:</strong> ${error}</p>
            <p><strong>stack Trace:</strong> ${stack}</p>
            <p><strong>endpoint function:</strong> ${functionName} </p>
            <p><strong>user :</strong> ${user} </p>
            <p><strong>session:</strong> ${session}</p>           

        </div>
        <!-- <p>Click below to RSVP or learn more about the event.</p>
        <a href="[Event Link]" class="btn">RSVP Now</a>
        <p>We look forward to seeing you there!</p> -->
        <div class="footer">
            <p>&copy; [year] Seminar Management. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
`

    mailSend("Error Notification", process.env.ERROR_MAIL, content)
})

module.exports = {
    errorEmitter, 
    errorEvents
}
