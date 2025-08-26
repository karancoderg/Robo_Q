import { Response } from 'express';
import Vendor from '../models/Vendor';
import Item from '../models/Item';
import Order from '../models/Order';
import { asyncHandler, createError } from '../middleware/errorHandler';
import { AuthRequest } from '../types';

export const createVendor = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!._id;
  const vendorData = req.body;

  // Check if user already has a vendor profile
  const existingVendor = await Vendor.findOne({ userId });
  if (existingVendor) {
    throw createError('Vendor profile already exists for this user', 400);
  }

  const vendor = await Vendor.create({
    userId,
    ...vendorData
  });

  res.status(201).json({
    success: true,
    message: 'Vendor profile created successfully',
    data: { vendor }
  });
});

export const getVendorProfile = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!._id;

  const vendor = await Vendor.findOne({ userId }).populate('userId', 'name email');
  if (!vendor) {
    throw createError('Vendor profile not found', 404);
  }

  res.json({
    success: true,
    data: { vendor }
  });
});

export const updateVendorProfile = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!._id;
  const updates = req.body;

  const vendor = await Vendor.findOneAndUpdate(
    { userId },
    updates,
    { new: true, runValidators: true }
  );

  if (!vendor) {
    throw createError('Vendor profile not found', 404);
  }

  res.json({
    success: true,
    message: 'Vendor profile updated successfully',
    data: { vendor }
  });
});

export const getAllVendors = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { category, isActive = true, page = 1, limit = 10 } = req.query;

  const filter: any = { isActive };
  if (category) filter.category = category;

  const vendors = await Vendor.find(filter)
    .populate('userId', 'name email')
    .limit(Number(limit) * 1)
    .skip((Number(page) - 1) * Number(limit))
    .sort({ rating: -1, totalOrders: -1 });

  const total = await Vendor.countDocuments(filter);

  res.json({
    success: true,
    data: {
      vendors,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    }
  });
});

export const getVendorById = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { vendorId } = req.params;

  const vendor = await Vendor.findById(vendorId).populate('userId', 'name email');
  if (!vendor) {
    throw createError('Vendor not found', 404);
  }

  res.json({
    success: true,
    data: { vendor }
  });
});

export const getVendorItems = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { vendorId } = req.params;
  const { category, isAvailable = true, page = 1, limit = 20 } = req.query;

  const filter: any = { vendorId };
  if (category) filter.category = category;
  if (isAvailable !== undefined) filter.isAvailable = isAvailable === 'true';

  const items = await Item.find(filter)
    .limit(Number(limit) * 1)
    .skip((Number(page) - 1) * Number(limit))
    .sort({ createdAt: -1 });

  const total = await Item.countDocuments(filter);

  res.json({
    success: true,
    data: {
      items,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    }
  });
});

export const getVendorOrders = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!._id;
  const { status, page = 1, limit = 10 } = req.query;

  // Get vendor profile
  const vendor = await Vendor.findOne({ userId });
  if (!vendor) {
    throw createError('Vendor profile not found', 404);
  }

  const filter: any = { vendorId: vendor._id };
  if (status) filter.status = status;

  const orders = await Order.find(filter)
    .populate('userId', 'name email phone')
    .populate('items.itemId', 'name price')
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

export const getVendorStats = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!._id;

  const vendor = await Vendor.findOne({ userId });
  if (!vendor) {
    throw createError('Vendor profile not found', 404);
  }

  const [
    totalOrders,
    pendingOrders,
    completedOrders,
    totalRevenue,
    totalItems,
    activeItems
  ] = await Promise.all([
    Order.countDocuments({ vendorId: vendor._id }),
    Order.countDocuments({ vendorId: vendor._id, status: 'pending' }),
    Order.countDocuments({ vendorId: vendor._id, status: 'delivered' }),
    Order.aggregate([
      { $match: { vendorId: vendor._id, status: 'delivered' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]),
    Item.countDocuments({ vendorId: vendor._id }),
    Item.countDocuments({ vendorId: vendor._id, isAvailable: true })
  ]);

  res.json({
    success: true,
    data: {
      stats: {
        totalOrders,
        pendingOrders,
        completedOrders,
        totalRevenue: totalRevenue[0]?.total || 0,
        totalItems,
        activeItems,
        rating: vendor.rating
      }
    }
  });
});
