const {Router} = require("express");
const { createNewSession } = require("./src/controllers/admincontroller");
const { createAccountStudent, getstudentDetailFronNetQue, verify, signin } = require("./src/controllers/authController");
const { getStudentDetailFronTrackNetque } = require("./src/helpers/util");

const router = Router();

// for admin
// router.get()
router.post("/admin/session/create", createNewSession)
// router.update()


// for student
router.post("/auth/detail/student", getstudentDetailFronNetQue)
router.post("/auth/register", createAccountStudent)
router.get("/auth/verify", verify)
router.post("/auth/signin", signin)


module.exports = {
    router
}