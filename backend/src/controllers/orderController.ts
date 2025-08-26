import { Response } from 'express';
import Order from '../models/Order';
import Item from '../models/Item';
import Vendor from '../models/Vendor';
import robotService from '../services/robotService';
import notificationService from '../services/notificationService';
import { asyncHandler, createError } from '../middleware/errorHandler';
import { AuthRequest } from '../types';

export const createOrder = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!._id;
  const { vendorId, items, deliveryAddress, notes } = req.body;

  // Validate vendor
  const vendor = await Vendor.findById(vendorId);
  if (!vendor) {
    throw createError('Vendor not found', 404);
  }

  // Validate and calculate items
  const orderItems = [];
  let totalAmount = 0;

  for (const orderItem of items) {
    const item = await Item.findById(orderItem.itemId);
    if (!item) {
      throw createError(`Item not found: ${orderItem.itemId}`, 404);
    }
    if (!item.isAvailable) {
      throw createError(`Item not available: ${item.name}`, 400);
    }
    if (item.vendorId !== vendorId) {
      throw createError(`Item ${item.name} does not belong to this vendor`, 400);
    }

    const itemTotal = item.price * orderItem.quantity;
    totalAmount += itemTotal;

    orderItems.push({
      itemId: item._id,
      name: item.name,
      price: item.price,
      quantity: orderItem.quantity,
      totalPrice: itemTotal
    });
  }

  // Create order
  const order = await Order.create({
    userId,
    vendorId,
    items: orderItems,
    totalAmount,
    deliveryAddress,
    vendorAddress: vendor.address,
    notes,
    status: 'pending'
  });

  // Populate order for response
  const populatedOrder = await Order.findById(order._id)
    .populate('userId', 'name email phone')
    .populate('vendorId', 'businessName contactInfo')
    .populate('items.itemId', 'name description');

  res.status(201).json({
    success: true,
    message: 'Order created successfully',
    data: { order: populatedOrder }
  });
});

export const getMyOrders = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!._id;
  const { status, page = 1, limit = 10 } = req.query;

  const filter: any = { userId };
  if (status) filter.status = status;

  const orders = await Order.find(filter)
    .populate('vendorId', 'businessName address contactInfo')
    .populate('robotId', 'name status currentLocation')
    .limit(Number(limit) * 1)
    .skip((Number(page) - 1) * Number(limit))
    .sort({ createdAt: -1 });

  const total = await Order.countDocuments(filter);

  res.json({
    success: true,
    data: {
      orders,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    }
  });
});

export const getOrderById = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { orderId } = req.params;
  const userId = req.user!._id;
  const userRole = req.user!.role;

  let order;

  if (userRole === 'vendor') {
    // Vendor can only see orders for their business
    const vendor = await Vendor.findOne({ userId });
    if (!vendor) {
      throw createError('Vendor profile not found', 404);
    }
    order = await Order.findOne({ _id: orderId, vendorId: vendor._id });
  } else {
    // Users can only see their own orders
    order = await Order.findOne({ _id: orderId, userId });
  }

  if (!order) {
    throw createError('Order not found', 404);
  }

  // Populate order details
  const populatedOrder = await Order.findById(order._id)
    .populate('userId', 'name email phone')
    .populate('vendorId', 'businessName address contactInfo')
    .populate('robotId', 'name status currentLocation batteryLevel')
    .populate('items.itemId', 'name description image');

  res.json({
    success: true,
    data: { order: populatedOrder }
  });
});

export const updateOrderStatus = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { orderId } = req.params;
  const { status, notes } = req.body;
  const userId = req.user!._id;

  // Get vendor profile
  const vendor = await Vendor.findOne({ userId });
  if (!vendor) {
    throw createError('Vendor profile not found', 404);
  }

  // Find order belonging to this vendor
  const order = await Order.findOne({ _id: orderId, vendorId: vendor._id });
  if (!order) {
    throw createError('Order not found', 404);
  }

  // Validate status transition
  if (order.status !== 'pending' && status === 'vendor_approved') {
    throw createError('Order can only be approved when status is pending', 400);
  }

  // Update order
  order.status = status;
  if (notes) order.notes = notes;
  await order.save();

  // Send notification
  await notificationService.sendOrderStatusUpdate(
    orderId,
    order.userId,
    status,
    order
  );

  // If approved, try to assign robot
  if (status === 'vendor_approved') {
    setTimeout(async () => {
      await robotService.assignRobotToOrder(orderId);
    }, 1000);
  }

  res.json({
    success: true,
    message: 'Order status updated successfully',
    data: { order }
  });
});

export const cancelOrder = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { orderId } = req.params;
  const userId = req.user!._id;

  const order = await Order.findOne({ _id: orderId, userId });
  if (!order) {
    throw createError('Order not found', 404);
  }

  // Check if order can be cancelled
  if (['robot_delivering', 'delivered'].includes(order.status)) {
    throw createError('Order cannot be cancelled at this stage', 400);
  }

  order.status = 'cancelled';
  await order.save();

  // Send notification
  await notificationService.sendOrderStatusUpdate(
    orderId,
    userId,
    'cancelled',
    order
  );

  res.json({
    success: true,
    message: 'Order cancelled successfully',
    data: { order }
  });
});

export const confirmDelivery = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { orderId } = req.params;
  const { otp } = req.body;
  const userId = req.user!._id;

  const order = await Order.findOne({ _id: orderId, userId });
  if (!order) {
    throw createError('Order not found', 404);
  }

  if (order.status !== 'robot_delivering') {
    throw createError('Order is not ready for delivery confirmation', 400);
  }

  // Confirm delivery using robot service
  const success = await robotService.completeDelivery(orderId, otp);
  if (!success) {
    throw createError('Invalid OTP or delivery confirmation failed', 400);
  }

  // Get updated order
  const updatedOrder = await Order.findById(orderId)
    .populate('vendorId', 'businessName')
    .populate('robotId', 'name');

  res.json({
    success: true,
    message: 'Delivery confirmed successfully',
    data: { order: updatedOrder }
  });
});

export const getOrderTracking = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { orderId } = req.params;
  const userId = req.user!._id;

  const order = await Order.findOne({ _id: orderId, userId })
    .populate('robotId', 'name status currentLocation batteryLevel')
    .populate('vendorId', 'businessName address');

  if (!order) {
    throw createError('Order not found', 404);
  }

  const trackingData = {
    orderId: order._id,
    status: order.status,
    estimatedDeliveryTime: order.estimatedDeliveryTime,
    deliveryAddress: order.deliveryAddress,
    vendorAddress: order.vendorAddress,
    robot: order.robotId ? {
      name: order.robotId.name,
      status: order.robotId.status,
      currentLocation: order.robotId.currentLocation,
      batteryLevel: order.robotId.batteryLevel
    } : null,
    timeline: [
      { status: 'pending', timestamp: order.createdAt, completed: true },
      { status: 'vendor_approved', timestamp: order.updatedAt, completed: ['vendor_approved', 'robot_assigned', 'robot_picking_up', 'robot_delivering', 'delivered'].includes(order.status) },
      { status: 'robot_assigned', timestamp: order.updatedAt, completed: ['robot_assigned', 'robot_picking_up', 'robot_delivering', 'delivered'].includes(order.status) },
      { status: 'robot_picking_up', timestamp: order.updatedAt, completed: ['robot_picking_up', 'robot_delivering', 'delivered'].includes(order.status) },
      { status: 'robot_delivering', timestamp: order.updatedAt, completed: ['robot_delivering', 'delivered'].includes(order.status) },
      { status: 'delivered', timestamp: order.actualDeliveryTime, completed: order.status === 'delivered' }
    ]
  };

  res.json({
    success: true,
    data: { tracking: trackingData }
  });
});
