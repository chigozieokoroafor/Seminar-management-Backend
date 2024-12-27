
require("dotenv").config()
const jwt = require("jsonwebtoken")
const { unAuthorized, generalError, expired, invalid, newError } = require("../helpers/statusCodes");
const { fetchUserForMiddleware } = require("../db/query");

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

module.exports = {
    studentAuth,
    adminAuth,
    coordAuth,
    supAuth
}