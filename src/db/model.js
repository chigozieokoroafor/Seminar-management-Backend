const { conn } = require("./conn");
const { DataTypes } = require("sequelize");
const { DEFAULT_TABLE_NAMES } = require("../helpers/consts")


const users = conn.define(DEFAULT_TABLE_NAMES.users, {
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
    'middleName':{
        type:DataTypes.STRING(100),
        allowNull:false
    },
    "isVerified":{
        type:DataTypes.BOOLEAN,
        defaultValue:false
    },
    "designation": {
        type: DataTypes.STRING(15),
        defaultValue: "Mr"
    },
    "userType": {
        type: DataTypes.INTEGER,
        defaultValue: 0      // 0-students 1-supervisors 2-coordinator 3-admin
    },
    "password": {
        type: DataTypes.STRING(255),
    },
    "email": {
        type: DataTypes.STRING(255),
    },
    phone: {
        type: DataTypes.STRING(14)
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
    matricNo:{
        type:DataTypes.STRING(255),
        allowNull:false,
        unique:true
    },
    topic:{
        type:DataTypes.STRING(255),
        allowNull:true
    },
    supervisor:{
        type:DataTypes.STRING(255),
        allowNull:true
    },
    program: {
        type: DataTypes.STRING(255),
        defaultValue: "MSC"
    },
    programTitle:{
        type: DataTypes.STRING(255)
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
    netqueFormId:{
        type:DataTypes.STRING(100)
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
    isSupervisor: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    isSuperAdmin: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
})

const allCourses = conn.define("allCourses", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        unique: true
    },
    code: {
        type: DataTypes.STRING(10)
    },
    title: {
        type: DataTypes.STRING(255)
    }
})

const studentCourses = (year) => conn.define(DEFAULT_TABLE_NAMES.studentCourses + `_${year}`, {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        unique: true
    },
    sid: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    course: {
        type: DataTypes.JSON
    },
    score: {
        type: DataTypes.INTEGER
    },
    grade: {
        type: DataTypes.STRING(3)
    },
    session: {
        type: DataTypes.STRING(15)
    }
}, {
    tableName: DEFAULT_TABLE_NAMES.seminars + `_${year}`
})

const projects = conn.define("projects", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        unique: true
    },
    "sid": {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    "topic": {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    "session": {
        type: DataTypes.STRING(15)
    },
    "supervisor": {
        type: DataTypes.STRING(255),
        allowNull: false,
    }
})

const seminars = conn.define(DEFAULT_TABLE_NAMES.seminars , {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        unique: true
    },
    sid: { // studentId
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    lid: { //lecturerId
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    title:{
        type:DataTypes.TEXT
    },
    scheduledDate: {
        type: DataTypes.DATE
    },
    seminarType:{ //concept or progress
        type: DataTypes.STRING(20)
    },
    venue: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    session: {
        type: DataTypes.STRING(15)
    },
    isDone: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    isActivated:{
        type: DataTypes.BOOLEAN,
        defaultValue:false
    }
}, {
    tableName: DEFAULT_TABLE_NAMES.seminars 
})

const forms = conn.define(DEFAULT_TABLE_NAMES.forms , {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        unique: true
    },
    sid: { // studentId
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    detail: {
        type: DataTypes.JSON
    },
    isSupervisorPending:{ // for supervisors to check
        type: DataTypes.BOOLEAN,
        defaultValue:true
    },
    isSupervisorApproved: {
        type: DataTypes.BOOLEAN,
        defaultValue:false
    },
    isCoordinatorPending:{ // for coordinators to check
        type: DataTypes.BOOLEAN,
        defaultValue:false
    },
    isCoordinatorApproved: {
        type: DataTypes.BOOLEAN,
        defaultValue:false
    },  
    lid: { //lecturerId
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    seminarType:{ //concept or progress
        type: DataTypes.STRING(20)
    },
    
    session: {
        type: DataTypes.STRING(15)
    },
    status:{
        type: DataTypes.TINYINT,
        defaultValue:0  //statuses - {0:"supervisor pending", 1:"coordinator pending", 2:"approved", 3:"studentPending for feedback"}
    }
    
}, {
    tableName: DEFAULT_TABLE_NAMES.forms
})

const feedbacks = (year) => conn.define(DEFAULT_TABLE_NAMES.feedbacks + `_${year}`,
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            unique: true
        },

        lid: { // lecturerId
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        sid:{ //studentId
            type:DataTypes.STRING(255),
            allowNull:false
        },
        fid:{ // formId
            type: DataTypes.INTEGER
        },
        feedback:{
            type:DataTypes.TEXT
        }


    },
    {
        tableName: DEFAULT_TABLE_NAMES.feedbacks + `_${year}`
    }
)

// const progressT = (year) => conn.define(DEFAULT_TABLE_NAMES.progressT + `_${year}`, {
//     sid: {
//         type: DataTypes.STRING(255)
//     },
//     detail: {
//         type: DataTypes.JSON
//     },
//     isApproved: {
//         type: DataTypes.BOOLEAN
//     },
//     supervisor: {
//         type: DataTypes.STRING(255),
//         allowNull: false,
//     },
//     session: {
//         type: DataTypes.STRING(15)
//     }
// }, {
//     tableName: DEFAULT_TABLE_NAMES.progressT + `_${year}`
// })

const attendance = (year) => conn.define(DEFAULT_TABLE_NAMES.attendance + `_${year}`, {
    sid: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    present: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    token: {
        type: DataTypes.STRING(10)
    },
    seminarId: {
        type: DataTypes.STRING()
    },
    session: {
        type: DataTypes.STRING(15)
    }
}, {
    tableName: DEFAULT_TABLE_NAMES.attendance + `_${year}`
})

const activity = (year) => conn.define(DEFAULT_TABLE_NAMES.activity + `_${year}`, {
    sid: {
        type: DataTypes.STRING(255)
    },
    user: {
        type: DataTypes.STRING(255)
    },
    action: {
        type: DataTypes.STRING(255)
    },
    meta: {
        type: DataTypes.STRING(255)
    }

}, {
    tableName: DEFAULT_TABLE_NAMES.activity + `_${year}`
})

const sessions = conn.define("sessions", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        unique: true
    },
    session: {
        type: DataTypes.STRING(15)
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    tableName: DEFAULT_TABLE_NAMES.sessions
})

const error_logs = conn.define("errs", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        unique: true
    },
    err:{
        type:DataTypes.STRING
    },
    endpoint:{
        type:DataTypes.STRING
    },
    session:{
        type:DataTypes.STRING
    },
    isFixed:{
        type:DataTypes.BOOLEAN
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
    seminars,
    projects,
    studentCourses,
    allCourses,
    staff,
    students,
    error_logs,
    forms,
    feedbacks
}
