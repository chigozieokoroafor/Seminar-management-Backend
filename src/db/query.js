const { sessions, students, users, error_logs, allCourses, seminars, forms, feedbacks, applicationDocuments } = require("./model");
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

exports.getUserByEmailRaw = async (email) => {
    const query = `SELECT * FROM ${DEFAULT_TABLE_NAMES.users} user LEFT JOIN ${DEFAULT_TABLE_NAMES.students} as student ON user.uid = student.sid where user.email="${email}";`
    return (await pool.promise().execute(query))[0]
}

exports.logError = async (err, endpoint, session) => {
    await error_logs.create({ session, err, endpoint })
}

exports.fetchUserForSignin = async (email) => {

    return (await pool.promise().execute(`SELECT ${P.uid}, ${P.first_name}, ${P.last_name}, ${P.middleName}, ${P.designation}, ${P.email}, ${P.phone}, ${P.img}, ${P.password}, ${P.isVerified}, ${P.userType}, student.${P.matricNo}, student.${P.program}, student.${P.program} FROM ${process.env.DB_NAME}.${DEFAULT_TABLE_NAMES.users} user LEFT JOIN ${DEFAULT_TABLE_NAMES.students} student on student.sid = user.uid where user.email = '${email}' ;`))[0]
}

exports.fetchUserForMiddleware = async (uid, userType) => {

    return (await pool.promise().execute(`SELECT ${P.uid}, ${P.first_name}, ${P.last_name}, ${P.middleName}, ${P.designation}, ${P.email}, ${P.phone}, ${P.img}, ${P.isVerified}, ${P.userType}, student.${P.matricNo}, student.${P.program}, student.${P.program}, student.${P.isActive}, student.${P.supervisor} FROM ${process.env.DB_NAME}.${DEFAULT_TABLE_NAMES.users} user LEFT JOIN ${DEFAULT_TABLE_NAMES.students} student on student.sid = user.uid where user.uid = '${uid}' AND user.userType = ${userType} ;`))[0]
}

exports.createUser = async (data) => {
    return await users.create(data)
}

exports.updateUserByEmail = async (email, update) => {
    return await users.update(update, { where: { email } })
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
    return await seminars.create({ scheduledDate: date, session, venue: DEFAULT_VENUE })
}

exports.fetchAllTopics = async () => {
    return await students.findAll({ where: { topic: { [Op.not]: null } }, attributes: [P.matricNo, P.topic] })
}

exports.fetchAllStudents = async (limit, skip) => {
    const query = `SELECT ${P.uid}, ${P.first_name}, ${P.last_name}, ${P.middleName}, ${P.designation}, students.${P.matricNo}, students.${P.program} FROM students INNER JOIN users ON students.sId = users.uid LIMIT ${limit} OFFSET ${skip} ;`
    return (await pool.promise().execute(query))[0]
}

exports.registerSeminar = async (data) => {
    return await forms.create(data)
}

exports.validateSeminarExists = async (data) => {
    return await forms.findOne({ where: data })
}

exports.updateSeminarForReg = async (update, query) => {
    return await forms.update(update, { where: query })
}

// exports.getSeminarRegistrationForSpecificUser = async (user_id, fid) => {
//     // const query = `SELECT forms.id, forms.${P.lid}, forms.${P.sid},forms.${P.detail}, forms.${P.isSupervisorPending}, forms.${P.isSupervisorApproved}, forms.${P.isCoordinatorPending}, forms.${P.isCoordinatorApproved}, forms.${P.seminarType} FROM ${DEFAULT_TABLE_NAMES.forms} as forms WHERE forms.${P.sid} = '${user_id}'`
//     // LEFT JOIN '${DEFAULT_TABLE_NAMES.feedbacks}_${year}' as feedback ON forms.${P.id} = feedback.${P.fid} //this is extra query for the feedbacks
//     // LEFT JOIN ${DEFAULT_TABLE_NAMES.users} as supervisor ON  forms.${P.lid} = supervisor.${P.uid}
//     // supervisor.${P.first_name} as sp_firstName, supervisor.${P.last_name} as sp_lastName, supervisor.${P.middleName} as sp_middleName
//     // return (await pool.promise().query(query))[0]

//     return await forms.findOne({
//         where: {
//             sid: user_id,
//             id: fid,
//             isPresented:false
//         },
//         attributes: [P.id, P.seminarType, P.detail, P.session, P.status, P.isCoordinatorApproved, P.isSupervisorApproved],
//         // order
//     })
// }

exports.getSeminarRegistrationForSpecificUser = async (user_id, fid) => {
    const query = `SELECT forms.id, forms.${P.lid}, forms.${P.sid},forms.${P.detail}, forms.${P.isSupervisorPending}, forms.${P.isSupervisorApproved}, forms.${P.isCoordinatorPending}, forms.${P.isCoordinatorApproved}, forms.${P.seminarType}, doc.${P.filename}, doc.${P.url} FROM ${DEFAULT_TABLE_NAMES.forms} as forms LEFT JOIN ${DEFAULT_TABLE_NAMES.documents} doc ON doc.${P.fid} = forms.id  WHERE forms.${P.sid} = '${user_id}' AND forms.id = '${fid}'`
    return (await pool.promise().query(query))[0]

    // return await forms.findOne({
    //     where: {
    //         sid: user_id,
    //         id: fid,
    //         isPresented:false
    //     },
    //     attributes: [P.id, P.seminarType, P.detail, P.session, P.status, P.isCoordinatorApproved, P.isSupervisorApproved],
    //     // order
    // })
}

exports.getAllSeminarApplicationsForUser = async (user_id, session) =>{
    // const query = `SELECT ${P.id}, ${P.detail}, ${P.seminarType}, ${P.lid},  FROM ${DEFAULT_TABLE_NAMES.forms} as forms  LEFT JOIN ON ${DEFAULT_TABLE_NAMES.users}.id = forms.${P.lid} WHERE ${P.sid} = '${user_id}' AND ${P.session} = ${session} ORDER BY ${P.createdAt} ASC;`
    const query = `SELECT form.id, form.detail, form.lid, form.seminarType, form.status, CONCAT(lecturer.designation, " ",lecturer.firstName, ' ', lecturer.lastName) AS supervisor FROM ${DEFAULT_TABLE_NAMES.forms} form  LEFT JOIN ${DEFAULT_TABLE_NAMES.users} lecturer ON lecturer.${P.uid} = form.${P.lid} WHERE ${P.sid} = '${user_id}' AND ${P.session} = '${session}' ORDER BY form.${P.createdAt} ASC;`
    // console.log("query:::", query)
    return (await pool.promise().query(query))[0]
}

exports.getSpecificSeminarRegistrationById = async (user_id, id) => {
    const query = `SELECT *, docs.id as did FROM ${DEFAULT_TABLE_NAMES.forms} as forms LEFT JOIN ${DEFAULT_TABLE_NAMES.documents} docs ON docs.${P.fid} = forms.${P.id} WHERE forms.${P.id} = ${id} AND  ${P.sid} = '${user_id}' ;`
    return (await pool.promise().query(query))[0]
}

exports.updateSpecificSeminarRegistration = async (id, update_) => {
    // detail = JSON_SET(detail, '$.key', 'new_value') - this is the content of update_, it's an extra query or rather the update to be made.

    const query = `UPDATE ${DEFAULT_TABLE_NAMES.forms} SET ${update_} WHERE ${P.id} = ${id};`
    // console.log(query)
    return (await pool.promise().query(query))[0]
}

exports.getFeedbackForForm = async (fid, year) => {
    return await feedbacks(year).findOne({ where: { fid }, order: [[P.createdAt, "DESC"]] })
}

exports.getSeminarRegistrationBySupervisor = async (lid) => {
    const query = `SELECT student.${P.matricNo} , forms.id, user.${P.first_name}, user.${P.last_name}, user.${P.middleName}, forms.${P.lid}, forms.${P.sid},forms.${P.detail} FROM ${DEFAULT_TABLE_NAMES.forms} as forms LEFT JOIN ${DEFAULT_TABLE_NAMES.users} as user ON user.${P.uid} = forms.${P.sid} LEFT JOIN ${DEFAULT_TABLE_NAMES.students} as student ON student.${P.sid} = forms.${P.sid}  WHERE forms.${P.lid} = '${lid}' AND forms.${P.status} = 0`
    return (await pool.promise().query(query))[0]
}

exports.getSpecificSeminarRegBySupervisor = async (where_q) => {
    return await forms.findOne({ where: where_q })
}

exports.updateFormRegistration = async (where, update) => {
    return await forms.update(update, { where })
}

exports.createFeedback = async (data, session) => {
    return await feedbacks(session).create(data)
}

exports.getActiveUserEmails = async () => {
    return await users.findAll({
        where: {
            status:"active"
        },
        attributes:[P.email],
        raw:true
    })
}

exports.uploadDocumentDataForForm = async(data) =>{
    return await applicationDocuments.create(data)
}

exports.deleteRegistration = async(fid) =>{
    return await forms.destroy({where:{id:fid}})
}

exports.updateDocumentData = async(fid, update) =>{
    return await applicationDocuments.update(update, {where:{fid}})
}

exports.getStudentsUndersupervisor = async(supervisor) =>{
    const query =  `SELECT student.${P.sid}, student.${P.program}, student.${P.isActive}, CONCAT(user.${P.first_name}, " ", user.${P.last_name}) as name, user.${P.email}, user.${P.phone}, user.${P.status} FROM ${DEFAULT_TABLE_NAMES.students} student LEFT JOIN ${DEFAULT_TABLE_NAMES.users} user ON student.${P.sid} = user.${P.uid}  WHERE supervisor='${supervisor}' ;`
    return (await pool.promise().query(query))[0]   
}

exports.getOtherStudentsNotUndersupervisor = async(supervisor) =>{
    const query =  `SELECT student.${P.sid}, student.${P.program}, student.${P.isActive}, CONCAT(user.${P.first_name}, " ", user.${P.last_name}) as name, user.${P.email}, user.${P.phone}, user.${P.status} FROM ${DEFAULT_TABLE_NAMES.students} student LEFT JOIN ${DEFAULT_TABLE_NAMES.users} user ON student.${P.sid} = user.${P.uid}  WHERE supervisor !='${supervisor}' ;`
    return (await pool.promise().query(query))[0]   
}

exports.getStudentDetailById = async(student) =>{
    const query = `SELECT student.${P.sid}, student.${P.program}, student.${P.isActive}, CONCAT(user.${P.first_name}, " ", user.${P.last_name}) as name, user.${P.email}, user.${P.phone}, user.${P.status} FROM ${DEFAULT_TABLE_NAMES.students} student LEFT JOIN ${DEFAULT_TABLE_NAMES.users} user ON student.${P.sid} = user.${P.uid}  WHERE ${P.sid} ='${student}' ;`
    return (await pool.promise().query(query))[0]
}