const { sessions, students, users, error_logs, allCourses } = require("./model");
const { P, DEFAULT_TABLE_NAMES } = require("../helpers/consts");
const { pool } = require("./conn");


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
    return await students.findOne({ where: { netqueFormId: formId }, raw: true })
}

exports.getUserByUniqueId = async (uid) => {
    return await users.findOne({ where: { uid: uid }, raw: true })
}

exports.getUserByEmail = async (email) => {
    return await users.findOne({ where: { email: email } })
}

exports.logError = async (err, endpoint, session) => {
    await error_logs.create({ session, err, endpoint })
}

exports.fetchUserForSignin = async (email) =>{
    
    return (await pool.promise().execute(`SELECT ${P.uid}, ${P.first_name}, ${P.last_name}, ${P.middleName}, ${P.designation}, ${P.email}, ${P.phone}, ${P.img}, ${P.password}, ${P.isVerified}, ${P.userType}, student.${P.program}, student.${P.program} FROM ${process.env.DB_NAME}.${DEFAULT_TABLE_NAMES.users} user LEFT JOIN ${DEFAULT_TABLE_NAMES.students} student on student.sid = user.uid where user.email = '${email}' ;`))[0]
}

exports.fetchUserForMiddleware = async (uid, userType) =>{
    
    return (await pool.promise().execute(`SELECT ${P.uid}, ${P.first_name}, ${P.last_name}, ${P.middleName}, ${P.designation}, ${P.email}, ${P.phone}, ${P.img}, ${P.password}, ${P.isVerified}, ${P.userType}, student.${P.program}, student.${P.program} FROM ${process.env.DB_NAME}.${DEFAULT_TABLE_NAMES.users} user LEFT JOIN ${DEFAULT_TABLE_NAMES.students} student on student.sid = user.uid where user.uid = '${uid}' AND user.userType = ${userType} ;`))[0]
}

exports.createUser = async (data) => {
    return await users.create(data)
}

exports.verifyUser = async (uid) => {
    return await users.update({ isVerified: true }, { where: { uid } })
}

exports.createStudent = async (data) => {
    return await students.create(data)
}

exports.registerStudent = async (user_data, student_data) => {
    return Promise.allSettled([this.createUser(user_data), this.createStudent(student_data)])
}

exports.fetchAllCourses = async () => {
    return await allCourses.findAll({ raw: true, attributes: [P.code, P.title] })
}