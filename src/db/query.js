const { sessions, students, users, error_logs, allCourses, seminars } = require("./model");
const { P, DEFAULT_TABLE_NAMES, DEFAULT_VENUE } = require("../helpers/consts");
const { pool } = require("./conn");
const { Op } = require("sequelize")

//  for sessions
exports.fetchSpecificSession = async (session) => {
    return await sessions.findOne({ where: { session } })
}

exports.createSession = async (session) => {
    await sessions.update({ isActive: false }, { where: { session: { [Op.ne]: session } } })
    return await sessions.create({ session })
}

exports.fetchSessions = async () => {
    return await sessions.findAll({ attributes: [P.session, P.isActive], order: [[P.createdAt, "DESC"]] })
}

// For users
exports.getAllUsers = async (limit, offset) => {
    return await users.findAll({ limit: limit, offset: offset, attributes: [P.uid, P.first_name, P.last_name, P.middleName, P.designation, P.userType, P.email, P.phone, P.img] })
}

exports.updateSpecificUser = async (uid, update) => {
    return await users.update(update, { where: { uid } })
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

exports.fetchUserForSignin = async (email) => {

    return (await pool.promise().execute(`SELECT ${P.uid}, ${P.first_name}, ${P.last_name}, ${P.middleName}, ${P.designation}, ${P.email}, ${P.phone}, ${P.img}, ${P.password}, ${P.isVerified}, ${P.userType}, student.${P.matricNo}, student.${P.program}, student.${P.program} FROM ${process.env.DB_NAME}.${DEFAULT_TABLE_NAMES.users} user LEFT JOIN ${DEFAULT_TABLE_NAMES.students} student on student.sid = user.uid where user.email = '${email}' ;`))[0]
}

exports.fetchUserForMiddleware = async (uid, userType) => {

    return (await pool.promise().execute(`SELECT ${P.uid}, ${P.first_name}, ${P.last_name}, ${P.middleName}, ${P.designation}, ${P.email}, ${P.phone}, ${P.img}, ${P.password}, ${P.isVerified}, ${P.userType}, student.${P.matricNo}, student.${P.program}, student.${P.program} FROM ${process.env.DB_NAME}.${DEFAULT_TABLE_NAMES.users} user LEFT JOIN ${DEFAULT_TABLE_NAMES.students} student on student.sid = user.uid where user.uid = '${uid}' AND user.userType = ${userType} ;`))[0]
}

exports.createUser = async (data) => {
    return await users.create(data)
}

exports.updateUserByEmail = async(email, update) => {
    return await users.update(update, {where:{email}})
}
exports.verifyUser = async (uid) => {
    return await users.update({ isVerified: true }, { where: { uid } })
}

exports.createStudent = async (data) => {
    return await students.create(data)
}

exports.registerStudent = async (user_data, student_data) => {
    return await Promise.allSettled([this.createUser(user_data), this.createStudent(student_data)])
}


// for courses
exports.fetchAllCourses = async () => {
    return await allCourses.findAll({ raw: true, attributes: [P.code, P.title] })
}

exports.createCourse = async (code, title) => {
    return await allCourses.create({ code, title })
}

exports.updateCourse = async (id, update) => {
    return await allCourses.update(update, { where: { id } })
}

exports.getSeminars = async (session, limit, offset) => {
    return await seminars.findAll(
        {
            where: {
                scheduledDate: {
                    [Op.gte]: new Date().toISOString()
                }
            },
            limit,
            offset,
            order: [["scheduledDate", "ASC"]]
        })
    // `
    // select * from ${DEFAULT_TABLE_NAMES.seminars}
    // `

    // return (await pool.promise().execute(`SELECT ${P.uid}, ${P.first_name}, ${P.last_name}, ${P.middleName}, ${P.designation}, ${P.email}, ${P.phone}, ${P.img}, ${P.password}, ${P.isVerified}, ${P.userType}, student.${P.matricNo}, student.${P.program}, student.${P.program} FROM ${process.env.DB_NAME}.${DEFAULT_TABLE_NAMES.users} user LEFT JOIN ${DEFAULT_TABLE_NAMES.students} student on student.sid = user.uid where user.uid = '${uid}' AND user.userType = ${userType} ;`))[0]
}

exports.createNewSeminarDate = async (session, date) => {
    return await seminars.create({ scheduledDate: date, session, venue: DEFAULT_VENUE})
}

exports.fetchAllTopics = async () => {
    return await students.findAll({ where: { topic: { [Op.not]: null } } , attributes: [P.matricNo, P.topic]})
}

exports.fetchAllStudents = async(limit, skip) => {
    const query = `SELECT ${P.uid}, ${P.first_name}, ${P.last_name}, ${P.middleName}, ${P.designation}, students.${P.matricNo}, students.${P.program} FROM students INNER JOIN users ON students.sId = users.uid LIMIT ${limit} OFFSET ${skip} ;`
    return (await pool.promise().execute(query))[0]
}
