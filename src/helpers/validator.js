const Joi = require("joi");

exports.studentAccountCreatorValidator = Joi.object(
    {
        formId:Joi.string().required().messages(
            {
                "any.required":"Valid formId required."
            }
        ),
        surname:Joi.string().required().messages(
            {
            "any.required": "Valid surname required."
            }
        )
    }
)

exports.userEditValidator = Joi.object(
    {
        "firstName": Joi.string(),
        "lastName": Joi.string(),
        "middleName": Joi.string(),
        "designation": Joi.string(),
        "userType": Joi.number(),
        "email": Joi.string(),
        "phone": Joi.string()
    }
)

