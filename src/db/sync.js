const { users,
    sessions,
    seminars,
    activity,
    attendance,
    progressT,
    conceptT,
    projects,
    studentCourses,
    allCourses,
    staff,
    students,
    error_logs } = require("./model")

const admin_sync = async (year) => {
    seminars(year).sync({ alter: true })
    activity(year).sync({ alter: true })
    attendance(year).sync({ alter: true })
    progressT(year).sync({ alter: true })
    conceptT(year).sync({ alter: true })
    seminars(year).sync({ alter: true })
    studentCourses(year).sync({ alter: true })
}

const dev_sync = async (year) => {
    // users.sync({ alter: true })
    // sessions.sync({ alter: true })
    // seminars(year).sync({ alter: true })
    // activity(year).sync({ alter: true })
    // attendance(year).sync({ alter: true })
    // progressT(year).sync({ alter: true })
    // conceptT(year).sync({ alter: true })
    // seminars(year).sync({ alter: true })
    // projects.sync({ alter: true })
    // studentCourses(year).sync({ alter: true })
    // allCourses.sync({ alter: true })
    // staff.sync({ alter: true })
    // students.sync({ alter: true })
    // error_logs.sync({ alter: true })
}

year = "2021/2022"

dev_sync(year)

module.exports = {
    admin_sync
}

