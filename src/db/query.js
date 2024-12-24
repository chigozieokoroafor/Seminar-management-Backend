const { sessions } = require("./model");

exports.fetchSpecificSession = async(session) => {
    return await sessions.findOne({where:{session}})
}

exports.createSession = async(session) =>{
    return await sessions.create({session})
}

exports.fetchSessions = async()  =>{
    return await sessions.findAll()
}