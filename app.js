require("dotenv").config()

const express = require("express");
const { router } = require("./routes");
const cors  = require("cors")
const session = require("express-session")
const MySqlSession = require("express-mysql-session")(session)

const app = express()

// const session_options = {
//     host: process.env.DB_HOST,
//     port: process.env.DB_PORT,
//     user: process.env.DB_USER,
//     password: process.env.DB_PWD,
//     database: process.env.DB_NAME,
// }


// const sessionStore = new MySqlSession(session_options)

// app.use(session(
//     { 
//         store: sessionStore, 
//         secret: process.env.SECRET_KEY,
//         resave: false,
//         saveUninitialized: false,
//         cookie: {
//             maxAge: 1000 * 60 * 60 * 2, // 2 hours
//             httpOnly: false,
//             signed:false
//         }
//     }
// ))

// const corsOptions = {
//     // origin: process.env.NODE_ENV != 'dev' ? ['https://oau-hms.vercel.app/', process.env.MYSQL_ADDON_HOST] : ['http://localhost:3000', "https://oau-hms.vercel.app/"],
//     credentials: true,
//     optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204, 
// };

// app.use(cors(corsOptions));

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ "extended": true }))
app.use(router)


const port = process.env.PORT

app.listen(port, () => {
    console.log(`running on port ${port}`)
})


