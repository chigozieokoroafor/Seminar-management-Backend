const {Router} = require("express");
const { createNewSession } = require("./src/controllers/admincontroller");
const { createAccountStudent } = require("./src/controllers/authController");
const { getStudentDetailFronTrackNetque } = require("./src/helpers/util");

const router = Router();

// for admin
// router.get()
router.post("/admin/session/create", createNewSession)
// router.update()


// for student
router.post("/detail/student", getStudentDetailFronTrackNetque)
router.post("/register", createAccountStudent)


module.exports = {
    router
}