const Joi = require('joi');

const commentSchema = Joi.object({
  content: Joi.string()
    .min(1)
    .max(1000)
    .required()
    .messages({
      'string.min': 'Comment cannot be empty',
      'string.max': 'Comment must not exceed 1000 characters',
      'any.required': 'Comment content is required'
    })
});

module.exports = {
  commentSchema
};