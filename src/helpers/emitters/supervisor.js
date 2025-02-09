const events = require("events")
const { mailSend } = require("../util")

class Emitter extends events.EventEmitter {}

const supervisorEmitter = new Emitter()

const supervisorEvents = {
    feedback:"feedback completed",
    newSeminaar:" new seminar"
}

supervisorEmitter.on(supervisorEvents.feedback,  (email, studentName, ) =>{
    mailSend()
})