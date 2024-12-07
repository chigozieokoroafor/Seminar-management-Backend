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
    users.sync({alter:true})
    sessions.sync({alter:true})
    seminars.sync({alter:true}) 
    activity.sync({alter:true})
    attendance.sync({alter:true})
    progressT.sync({alter:true}) 
    conceptT.sync({alter:true}) 
    seminars.sync({alter:true}) 
    projects.sync({alter:true}) 
    
    studentCourses.sync({alter:true}) 
    allCourses.sync({alter:true}) 
    staff.sync({alter:true}) 
    students.sync({alter:true})

}