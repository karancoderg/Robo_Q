import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';

export const validate = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        error: {
          code: 'VALIDATION_ERROR',
          details: error.details.map(detail => ({
            field: detail.path.join('.'),
            message: detail.message
          }))
        }
      });
    }
    
    next();
  };
};

// Common validation schemas
export const schemas = {
  register: Joi.object({
    name: Joi.string().min(2).max(100).required(),
    email: Joi.string().email().required(),
    phone: Joi.string().pattern(/^\+?[\d\s-()]+$/).optional(),
    password: Joi.string().min(6).required(),
    role: Joi.string().valid('user', 'vendor').default('user'),
    address: Joi.object({
      street: Joi.string().required(),
      city: Joi.string().required(),
      state: Joi.string().required(),
      zipCode: Joi.string().required(),
      coordinates: Joi.object({
        lat: Joi.number().min(-90).max(90).required(),
        lng: Joi.number().min(-180).max(180).required()
      }).optional()
    }).optional()
  }),

  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  }),

  verifyOTP: Joi.object({
    otp: Joi.string().length(6).required(),
    type: Joi.string().valid('email_verification', 'phone_verification', 'delivery_confirmation', 'login').required(),
    orderId: Joi.string().optional()
  }),

  verifyLoginOTP: Joi.object({
    userId: Joi.string().required(),
    otp: Joi.string().length(6).required()
  }),

  createVendor: Joi.object({
    businessName: Joi.string().min(2).max(200).required(),
    description: Joi.string().max(1000).required(),
    category: Joi.string().valid('restaurant', 'grocery', 'pharmacy', 'electronics', 'books', 'clothing', 'other').required(),
    address: Joi.object({
      street: Joi.string().required(),
      city: Joi.string().required(),
      state: Joi.string().required(),
      zipCode: Joi.string().required(),
      coordinates: Joi.object({
        lat: Joi.number().min(-90).max(90).required(),
        lng: Joi.number().min(-180).max(180).required()
      }).required()
    }).required(),
    contactInfo: Joi.object({
      phone: Joi.string().pattern(/^\+?[\d\s-()]+$/).required(),
      email: Joi.string().email().required()
    }).required(),
    operatingHours: Joi.object({
      open: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).required(),
      close: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).required(),
      days: Joi.array().items(
        Joi.string().valid('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday')
      ).min(1).required()
    }).required()
  }),

  createItem: Joi.object({
    name: Joi.string().min(2).max(200).required(),
    description: Joi.string().max(1000).required(),
    price: Joi.number().min(0).required(),
    category: Joi.string().valid('food', 'beverages', 'groceries', 'medicines', 'electronics', 'books', 'clothing', 'other').required(),
    preparationTime: Joi.number().min(0).required(),
    weight: Joi.number().min(0).required(),
    dimensions: Joi.object({
      length: Joi.number().min(0).optional(),
      width: Joi.number().min(0).optional(),
      height: Joi.number().min(0).optional()
    }).optional(),
    tags: Joi.array().items(Joi.string()).optional()
  }),

  createOrder: Joi.object({
    vendorId: Joi.string().required(),
    items: Joi.array().items(
      Joi.object({
        itemId: Joi.string().required(),
        quantity: Joi.number().min(1).required()
      })
    ).min(1).required(),
    deliveryAddress: Joi.object({
      street: Joi.string().required(),
      city: Joi.string().required(),
      state: Joi.string().required(),
      zipCode: Joi.string().required(),
      coordinates: Joi.object({
        lat: Joi.number().min(-90).max(90).required(),
        lng: Joi.number().min(-180).max(180).required()
      }).required()
    }).required(),
    notes: Joi.string().max(500).optional()
  }),

  updateOrderStatus: Joi.object({
    status: Joi.string().valid('vendor_approved', 'vendor_rejected', 'cancelled').required(),
    notes: Joi.string().max(500).optional()
  }),

  confirmDelivery: Joi.object({
    otp: Joi.string().length(6).required()
  })
};
