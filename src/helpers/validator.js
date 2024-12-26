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