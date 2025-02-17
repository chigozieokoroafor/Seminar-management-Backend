const events = require("events")
const { sendOutSeminarNotification} = require("../util")

class Emitter extends events.EventEmitter {}

const baseEmitter = new Emitter()

const baseEvents = {
    
    newSeminar:" new seminar"
}

baseEmitter.on(baseEvents.newSeminar,  (emails, data) =>{
    // const year = new Date().getFullYear()
    sendOutSeminarNotification(data, emails)
})



module.exports = {
    baseEmitter,
    baseEvents
}