const { conn } = require("./conn");
const { DataTypes } = require("sequelize");


const users = conn.define("users", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        unique: true
    },
    "uid": {
        type: DataTypes.STRING(255),
        unique: true,
        allowNull: false
    },
    "firstName": {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    "lastName": {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    "designation": {
        type: DataTypes.STRING(15),
        defaultValue: "Mr"
    },
    "userType": {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    "password": {
        type: DataTypes.STRING(255),
    },
    "email": {
        type: DataTypes.STRING(255),
    },
    phone:{
        type:DataTypes.STRING(14)
    },
    "img": {
        type: DataTypes.BLOB
    },
    flagged: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
})

const students = conn.define("students", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        unique: true
    },
    sid: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true
    },
    program: {
        type: DataTypes.STRING(255),
        defaultValue: "MSC"
    },
    startSession: {
        type: DataTypes.STRING(15),
    },
    startYear: {
        type: DataTypes.STRING(10)
    },
    endSession: {
        type: DataTypes.STRING(15)
    },
    endYear: {
        type: DataTypes.STRING(10)
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
})

const staff = conn.define("staff", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        unique: true
    },
    sid: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true
    },
    isSupervisor:{
        type:DataTypes.BOOLEAN,
        defaultValue:false
    },
    isSuperAdmin:{
        type:DataTypes.BOOLEAN,
        defaultValue:false
    }
})

const allCourses = conn.define("allCourses", {
    code:{
        type: DataTypes.STRING(10)
    },
    title:{
        type:DataTypes.STRING(255)
    }
})

const studentCourses = (year) => conn.define("studentCourses", {
    sid:{
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    course:{
        type:DataTypes.JSON
    },
    score:{
        type:DataTypes.INTEGER
    },
    grade:{
      type:DataTypes.STRING(3)  
    },
    session:{
        type:DataTypes.STRING(15)
    }
    })


const projects = conn.define("projects", {

    "sid":{
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    "topic":{
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    "session":{
        type:DataTypes.STRING(15)
    },
    "supervisor":{
        type: DataTypes.STRING(255),
        allowNull: false,
    }
})

const seminars = conn.define("seminars", {
    scheduledDate:{
        type:DataTypes.DATE
    },
    venue:{
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    session:{
        type:DataTypes.STRING(15)
    },
    isDone:{
        type:DataTypes.BOOLEAN,
        defaultValue:false
        
    }
})

const conceptT = conn.define("conceptT", {
    sid:{
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    detail:{
        type:DataTypes.JSON
    },
    isApproved:{
        type: DataTypes.BOOLEAN
    },
    supervisor:{
        type: DataTypes.STRING(255),
        allowNull: false,
    }
})

const progressT = conn.define("progressT", {
    sid:{
        type:DataTypes.STRING(255)
    },
    detail:{
        type:DataTypes.JSON
    },
    isApproved:{
        type: DataTypes.BOOLEAN
    },
    supervisor:{
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    session:{
        type:DataTypes.STRING(15)
    }
})

const attendance = conn.define("attendance", {
    sid:{
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    present:{
        type:DataTypes.BOOLEAN,
        defaultValue:true
    },
    token:{
        type:DataTypes.STRING(10)
    },
    seminarId:{
        type:DataTypes.STRING()
    },
    session:{
        type:DataTypes.STRING(15)
    }
})

const activity = conn.define("activity", {
    sid:{
      type:DataTypes.STRING(255)  
    },
    user:{
        type: DataTypes.STRING(255)
    },
    action:{
        type: DataTypes.STRING(255)
    },
    meta:{
        type: DataTypes.STRING(255)
    }
    
})

const sessions = conn.define("sessions", {
    session:{
        type:DataTypes.STRING(15)
    },
    isActive:{
        type:DataTypes.BOOLEAN,
        defaultValue:true
    }
})

// const results = conn.define("results", {

// })


module.exports = {
    users,
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
    students
}
