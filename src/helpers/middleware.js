
require("dotenv").config()
const jwt = require("jsonwebtoken")
const { unAuthorized, generalError, expired, invalid, newError } = require("../helpers/statusCodes");
const { fetchUserForMiddleware } = require("../db/query");
const multer = require("multer");
const { ALL_MIME_TYPES } = require("./consts");

// const { P } = require("../consts");

class Auth {
    secret = process.env.AUTH_SECRET

    constructor(secret) {
        if (secret) {
            this.secret = secret;
        }
    }

    auth = async (req, res, next) => {


        if (!req?.headers?.authorization) {
            return unAuthorized(res, "Request unauthorized");
        }
        const authorization = req?.headers?.authorization;
        if (!authorization.startsWith("Bearer")) {
            return generalError(res, "Bearer authorization required");
        }
        const token = authorization.split("Bearer")[1].trim();

        // if (!req.session?.token){
        //     return unAuthorized(res, "Session expired");
        // }
        // const token = req?.session?.token

        let err;
        let err_status;

        try {
            const payload = jwt.verify(token, this.secret);
            
            const user_data = await fetchUserForMiddleware(payload.payload?.uid, payload.payload?.userType)
            req.user = user_data[0]; // Store the payload in the request
            req.user.session = payload.payload?.session

            return next(); // Call next to proceed if token is valid
        } catch (error) {
            if (error.name === "TokenExpiredError") {
                err = "Session Expired.";
                err_status = 403;
            } else if (error.name === "JsonWebTokenError") {
                err = "Invalid Token";
                err_status = 498;
            }
            // console.log(error)
        }
        req.err = {
            err: err,
            status: err_status
        };
        return next(); // Proceed to next middleware even if there's an error
    }
}

const studentAuth = (req, res, next) => { // auth for students
    new Auth(process.env.STUDENT_AUTH).auth(req, res, () => {
        
        if (req?.err?.err) {
            return newError(res, req.err.err, req.err.status);
        } else if (!req?.user?.uid) {
            return unAuthorized(res, "Unauthorized");
        }
        next();
    });
}

const adminAuth = (req, res, next) =>{ // auth for admin
    new Auth(process.env.ADMIN_AUTH).auth(req, res, () => {
        if (req?.err?.err) {
            return newError(res, req.err.err, req.err.status);
        } else if (!req?.user?.uid) {
            return unAuthorized(res, "Unauthorized");
        }
        next();
    });
}

const coordAuth = (req, res, next) =>{ // auth for coordinators
    new Auth(process.env.COORDINATOR_AUTH).auth(req, res, () => {
        if (req?.err?.err) {
            return newError(res, req.err.err, req.err.status);
        } else if (!req?.user?.uid) {
            return unAuthorized(res, "Unauthorized");
        }
        next();
    });
}

const supAuth = (req, res, next) =>{ // auth for supervisors
    new Auth(process.env.SUPERVISOR_AUTH).auth(req, res, () => {
        if (req?.err?.err) {
            return newError(res, req.err.err, req.err.status);
        } else if (!req?.user?.uid) {
            return unAuthorized(res, "Unauthorized");
        }
        next();
    });
}

const storage = multer.memoryStorage()
const fileFilter = (req, file, cb) =>{
    const allowedFileTypes = [
        ALL_MIME_TYPES.ppt,ALL_MIME_TYPES.pptx, ALL_MIME_TYPES.pdf, ALL_MIME_TYPES.doc, ALL_MIME_TYPES.docx
    ]
    // console.log("tests:::2")
    
    if (allowedFileTypes.includes(file.mimetype)){
        cb(null, true)
    }else{
        // console.log("tests:::4")
        cb(new Error(`Invalid file type. Only PPT, PPTX, PDF, DOC, DOCX files are allowed.`));
    }
}

const upload = multer({storage:storage, fileFilter:fileFilter, limits: {
    fileSize: 5 * 1024 * 1024, // 10MB limit
    files: 1                     // Maximum 5 files per upload
  }})

const uploadMiddleWare = (req, res, next) =>{
    // console.log("tests:::1")
    const uploadF = upload.single("file")
    // console.log("tests:::3")

    uploadF(req, res, (err)=>{
        if (err){
            return generalError(res, err.message)
        }

        // if (!req.file) {
        //     return generalError(res, 'Document required. Please upload a file.');
        //   }

        // console.log("file::::", req?.file)
        next()
    })
}

module.exports = {
    studentAuth,
    adminAuth,
    coordAuth,
    supAuth,
    uploadMiddleWare
}