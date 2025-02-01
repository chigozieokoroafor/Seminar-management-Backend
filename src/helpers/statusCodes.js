exports.notFound = (res, msg) => {
    return res.status(404).json({ "msg": msg, success: false })
}

exports.notAcceptable = (res, msg) => {
    return res.status(406).json({ msg, success: false })
}

exports.generalError = (res, msg) => {
    return res.status(400).json({ "msg": msg, success: false })
}

exports.success = (res, d, msg) => {
    
    return res.status(200).json({ success: true, d, "msg": msg ?? "" })
}

exports.created = (res, msg) => {
    return res.status(201).json({ success: true, "msg": msg ?? "" })
}

exports.unAuthorized = (res, msg) => {
    return res.status(401).json({ "msg": msg, success: false })
}

exports.expired = (res, msg) => {
    return res.status(403).json({ "msg": msg, success: false })
}

exports.invalid = (res, msg) => {
    return res.status(498).json({ "msg": msg, success: false })
}

exports.newError = (res, msg, statusC) => {
    return res.status(statusC).json({ "msg": msg, success: false })
}

exports.exists = (res, msg) => {
    return res.status(409).json({ "msg": msg, success: false })
}

exports.internalServerError = (res, msg) => {
    return res.status(500).json({ "msg": msg, success: false })
}

exports.notModifiedError = (res) => {
    return res.status(304).json({ "msg": "Not modified", success: false })
}

exports.redirect = (res, url) =>{
    return res.status(301).redirect(url)
    
}

