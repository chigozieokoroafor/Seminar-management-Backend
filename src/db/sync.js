require("dotenv").config()


const { users,
    sessions,
    seminars,
    activity,
    attendance,
    projects,
    studentCourses,
    allCourses,
    staff,
    students,
    error_logs,
    forms,
    feedbacks,
    applicationDocuments
} = require("./model")

const admin_sync = async (year) => {
    activity(year).sync({ alter: true })
    attendance(year).sync({ alter: true })
    studentCourses(year).sync({ alter: true })
    // forms(year).sync({alter:true})
}

const dev_sync = async (year) => {
    users.sync({ alter: true })
    sessions.sync({ alter: true })
    seminars.sync({ alter: true })
    activity(year).sync({ alter: true })
    attendance(year).sync({ alter: true })
    projects.sync({ alter: true })
    studentCourses(year).sync({ alter: true })
    allCourses.sync({ alter: true })
    staff.sync({ alter: true })
    students.sync({ alter: true })
    error_logs.sync({ alter: true })
    forms.sync({ alter: true }),
    feedbacks(year).sync({ alter: true })
    applicationDocuments.sync({alter:true})
}

year = "2021/2022"

if (process.env.ENV != "dev") {
    dev_sync(year)
}

module.exports = {
    admin_sync
}

