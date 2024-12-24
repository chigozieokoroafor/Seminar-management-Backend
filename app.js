require("dotenv").config()

const express = require("express");
const { router } = require("./routes");
const cors  = require("cors")

const app = express()
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ "extended": true }))
app.use(router)


const port = process.env.PORT

app.listen(port, () => {
    console.log(`running on port ${port}`)
})


