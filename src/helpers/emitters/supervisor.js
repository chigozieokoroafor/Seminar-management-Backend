const events = require("events")
const { mailSend, addSeminarToQueue } = require("../util")
const { getSeminarsNotOnQueue, getSpecSeminarById, getFreeSeminarDate, getSeminarOnSpecDateOnQueue } = require("../../db/query")
const { P } = require("../consts")

class Emitter extends events.EventEmitter {}

const supervisorEmitter = new Emitter()

const supervisorEvents = {
    feedback:"feedback completed",
    newSeminaar:" new seminar",
    newReg:"newRegistration",
    addToSeminar:"addToSeminar"

}

supervisorEmitter.on(supervisorEvents.feedback,  (email, supeName, studentName, matricNo, type) =>{
    const year = new Date().getFullYear()
    const content = `
    <!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Event Notification</title>
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
        
        <p>Hi ${supeName},</p>
        <p>A student of yours with details below has made corrections requested. </p>
        <p>Kindly review his application and approve for the next seminar. </p>
        <div class="studentDets">
            <p><strong>Student:</strong> ${studentName}</p>
            <p><strong>MatricNo:</strong> ${matricNo}</p>
            <p><strong>Seminar Type:</strong> ${type?.toUpperCase()}</p>

        </div>
        <!-- <p>Click below to RSVP or learn more about the event.</p>
        <a href="[Event Link]" class="btn">RSVP Now</a>
        <p>We look forward to seeing you there!</p> -->
        <div class="footer">
            <p>&copy; ${year} Seminar Management. All rights reserved.</p>
        </div>
    </div>
</body>
</html>

    `
    mailSend("Seminar Registration Update", email, content)
})

supervisorEmitter.on(supervisorEvents.newReg, (email, supeName, studentName, matricNo, type) =>{
    const year = new Date().getFullYear()
    const content = `
    <!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Seminar Notification</title>
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
        
        <p>Hi ${supeName},</p>
        <p>A student of yours with details below just applied for the forthcoming seminar. </p>
        <p>Kindly review his application and approve for the next seminar. </p>
        <div class="studentDets">
            <p><strong>Student:</strong> ${studentName}</p>
            <p><strong>MatricNo:</strong> ${matricNo}</p>
            <p><strong>Seminar Type:</strong> ${type?.toUpperCase()}</p>

        </div>
        <!-- <p>Click below to RSVP or learn more about the event.</p>
        <a href="[Event Link]" class="btn">RSVP Now</a>
        <p>We look forward to seeing you there!</p> -->
        <div class="footer">
            <p>&copy; ${year} Seminar Management. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
    `
    mailSend("New Registration", email, content)
})

supervisorEmitter.on(supervisorEvents.addToSeminar, async (formId, programType, session) =>{
    // flow :  get dates that still have space. -> get applications that have been approved -> doctorates first -> 
    await addSeminarToQueue(formId, programType, session)
})

module.exports = {
    supervisorEmitter,
    supervisorEvents
}