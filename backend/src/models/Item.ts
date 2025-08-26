import mongoose, { Schema } from 'mongoose';
import { IItem } from '../types';

const itemSchema = new Schema<IItem>({
  vendorId: {
    type: String,
    required: true,
    ref: 'Vendor'
  },
  name: {
    type: String,
    required: [true, 'Item name is required'],
    trim: true,
    maxlength: [200, 'Item name cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['food', 'beverages', 'groceries', 'medicines', 'electronics', 'books', 'clothing', 'other']
  },
  image: {
    type: String,
    default: null
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  preparationTime: {
    type: Number,
    required: [true, 'Preparation time is required'],
    min: [0, 'Preparation time cannot be negative']
  },
  weight: {
    type: Number,
    required: [true, 'Weight is required'],
    min: [0, 'Weight cannot be negative']
  },
  dimensions: {
    length: {
      type: Number,
      min: [0, 'Length cannot be negative']
    },
    width: {
      type: Number,
      min: [0, 'Width cannot be negative']
    },
    height: {
      type: Number,
      min: [0, 'Height cannot be negative']
    }
  },
  tags: [{
    type: String,
    trim: true
  }]
}, {
  timestamps: true
});

// Indexes for efficient queries
itemSchema.index({ vendorId: 1, isAvailable: 1 });
itemSchema.index({ category: 1, isAvailable: 1 });
itemSchema.index({ name: 'text', description: 'text', tags: 'text' });
itemSchema.index({ price: 1 });

export default mongoose.model<IItem>('Item', itemSchema);
