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
    applicationDocuments,
    queue,
    seminarDates
} = require("./model")

const admin_sync = async (year) => {
    activity(year).sync({ alter: true })
    attendance(year).sync({ alter: true })
    studentCourses(year).sync({ alter: true })
    // forms(year).sync({alter:true})
}

const dev_sync = async (year) => {
    // await users.sync({ alter: true })
    // await sessions.sync({ alter: true })
    // await seminars.sync({ alter: true })
    // await activity(year).sync({ alter: true })
    // await attendance(year).sync({ alter: true })
    // await projects.sync({ alter: true })
    // await studentCourses(year).sync({ alter: true })
    // await allCourses.sync({ alter: true })
    // await staff.sync({ alter: true })
    // await students.sync({ alter: true })
    // await error_logs.sync({ alter: true })
    // await forms.sync({ alter: true })
    // await feedbacks(year).sync({ alter: true })
    // await applicationDocuments.sync({alter:true})
    // await queue.sync({alter:true})
    // await seminarDates.sync({alter:true})

}

year = "2021/2022"
// dev_sync(year)
if (process.env.ENV != "dev") {
    dev_sync(year)
}

module.exports = {
    admin_sync
}

