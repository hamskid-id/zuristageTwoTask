const Joi = require('joi');

const validateCreateOrganisation = (organisation) => {
    const schema = Joi.object({
        name: Joi.string().required(),
        description: Joi.string().required()
    }).required();

    return schema.validate(organisation);
};

const validateAddUserToOrganisation = (organisation) => {
    const schema = Joi.object({
        userId: Joi.string().required(),
        orgId: Joi.string().required()
    }).required();

    return schema.validate(organisation);
};
module.exports = {validateCreateOrganisation, validateAddUserToOrganisation};