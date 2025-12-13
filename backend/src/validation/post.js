const Joi = require('joi');

const createPostSchema = Joi.object({
  title: Joi.string()
    .min(3)
    .max(200)
    .required()
    .messages({
      'string.min': 'Title must be at least 3 characters long',
      'string.max': 'Title must not exceed 200 characters',
      'any.required': 'Title is required'
    }),
  
  content: Joi.string()
    .min(10)
    .required()
    .messages({
      'string.min': 'Content must be at least 10 characters long',
      'any.required': 'Content is required'
    }),
  
  excerpt: Joi.string()
    .max(300)
    .allow('')
    .messages({
      'string.max': 'Excerpt must not exceed 300 characters'
    }),
  
  tags: Joi.array()
    .items(Joi.string().max(20))
    .max(10)
    .messages({
      'array.max': 'Maximum 10 tags allowed',
      'string.max': 'Each tag must not exceed 20 characters'
    })
});

const updatePostSchema = Joi.object({
  title: Joi.string()
    .min(3)
    .max(200)
    .messages({
      'string.min': 'Title must be at least 3 characters long',
      'string.max': 'Title must not exceed 200 characters'
    }),
  
  content: Joi.string()
    .min(10)
    .messages({
      'string.min': 'Content must be at least 10 characters long'
    }),
  
  excerpt: Joi.string()
    .max(300)
    .allow('')
    .messages({
      'string.max': 'Excerpt must not exceed 300 characters'
    }),
  
  tags: Joi.array()
    .items(Joi.string().max(20))
    .max(10)
    .messages({
      'array.max': 'Maximum 10 tags allowed',
      'string.max': 'Each tag must not exceed 20 characters'
    })
});

module.exports = {
  createPostSchema,
  updatePostSchema
};