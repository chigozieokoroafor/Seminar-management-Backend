const { users,
    sessions,
    seminars,
    activity,
    attendance,
    progressT,
    conceptT,
    seminars,
    projects,
    studentCourses,
    allCourses,
    staff,
    students } = require("./model")

const sync = async (year) => {
    users.sync({ alter: true })
    sessions.sync({ alter: true })
    seminars(year).sync({ alter: true })
    activity(year).sync({ alter: true })
    attendance(year).sync({ alter: true })
    progressT(year).sync({ alter: true })
    conceptT(year).sync({ alter: true })
    seminars(year).sync({ alter: true })
    projects.sync({ alter: true })
    studentCourses(year).sync({ alter: true })
    allCourses.sync({ alter: true })
    staff.sync({ alter: true })
    students.sync({ alter: true })

}

module.exports = {
    model_sync:sync
}

