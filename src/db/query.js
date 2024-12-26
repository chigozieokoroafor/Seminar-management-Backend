const { sessions, students, users, error_logs } = require("./model");
const { P } = require("../helpers/consts")


exports.fetchSpecificSession = async (session) => {
    return await sessions.findOne({ where: { session } })
}

exports.createSession = async (session) => {
    return await sessions.create({ session })
}

exports.fetchSessions = async () => {
    return await sessions.findAll()
}


exports.getStudentByFormId = async (formId) => {
    return await students.findOne({ where: {netqueFormId: formId}, raw:true})
}

exports.getUserByUniqueId = async (uid) => {
    return await users.findOne({ where: {uid:uid}, raw:true})
}

exports.getUserByEmail = async(email) =>{
    return await users.findOne({where:{email:email}})
}

exports.logError = async(err, endpoint, session   ) =>{
    await error_logs.create({session, err, endpoint})
}

exports.createUser = async(data) =>{
    return await users.create(data)
}

exports.verifyUser = async(uid) =>{
    return await users.update({isVerified:true}, {where:{uid}})
}

exports.createStudent = async (data) =>{
    return await students.create(data)
}

exports.registerStudent = async(user_data, student_data) =>{
    return Promise.allSettled([this.createUser(user_data), this.createStudent(student_data)])
}