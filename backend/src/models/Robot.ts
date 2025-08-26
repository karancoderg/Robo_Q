import mongoose, { Schema } from 'mongoose';
import { IRobot } from '../types';

const robotSchema = new Schema<IRobot>({
  name: {
    type: String,
    required: [true, 'Robot name is required'],
    unique: true,
    trim: true
  },
  status: {
    type: String,
    enum: ['idle', 'assigned', 'picking_up', 'delivering', 'maintenance', 'offline'],
    default: 'idle'
  },
  currentLocation: {
    lat: {
      type: Number,
      required: true
    },
    lng: {
      type: Number,
      required: true
    }
  },
  batteryLevel: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
    default: 100
  },
  capacity: {
    weight: {
      type: Number,
      required: true,
      min: 0
    },
    volume: {
      type: Number,
      required: true,
      min: 0
    }
  },
  currentLoad: {
    weight: {
      type: Number,
      default: 0,
      min: 0
    },
    volume: {
      type: Number,
      default: 0,
      min: 0
    }
  },
  assignedOrderId: {
    type: String,
    ref: 'Order',
    default: null
  },
  lastMaintenance: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes
robotSchema.index({ status: 1 });
robotSchema.index({ currentLocation: '2dsphere' });
robotSchema.index({ assignedOrderId: 1 });

// Virtual for availability
robotSchema.virtual('isAvailable').get(function() {
  return this.status === 'idle' && this.batteryLevel > 20;
});

export default mongoose.model<IRobot>('Robot', robotSchema);
