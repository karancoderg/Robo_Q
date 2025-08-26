import { Response } from 'express';
import Item from '../models/Item';
import Vendor from '../models/Vendor';
import { asyncHandler, createError } from '../middleware/errorHandler';
import { AuthRequest } from '../types';

export const createItem = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!._id;
  const itemData = req.body;

  // Get vendor profile
  const vendor = await Vendor.findOne({ userId });
  if (!vendor) {
    throw createError('Vendor profile not found. Please create a vendor profile first.', 404);
  }

  const item = await Item.create({
    vendorId: vendor._id,
    ...itemData
  });

  res.status(201).json({
    success: true,
    message: 'Item created successfully',
    data: { item }
  });
});

export const getItems = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { 
    category, 
    vendorId, 
    isAvailable = true, 
    search, 
    minPrice, 
    maxPrice,
    page = 1, 
    limit = 20,
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = req.query;

  const filter: any = {};
  
  if (category) filter.category = category;
  if (vendorId) filter.vendorId = vendorId;
  if (isAvailable !== undefined) filter.isAvailable = isAvailable === 'true';
  
  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = Number(minPrice);
    if (maxPrice) filter.price.$lte = Number(maxPrice);
  }

  if (search) {
    filter.$text = { $search: search };
  }

  const sortOptions: any = {};
  sortOptions[sortBy as string] = sortOrder === 'asc' ? 1 : -1;

  const items = await Item.find(filter)
    .populate('vendorId', 'businessName address rating')
    .limit(Number(limit) * 1)
    .skip((Number(page) - 1) * Number(limit))
    .sort(sortOptions);

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

export const getItemById = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { itemId } = req.params;

  const item = await Item.findById(itemId).populate('vendorId', 'businessName address rating contactInfo operatingHours');
  if (!item) {
    throw createError('Item not found', 404);
  }

  res.json({
    success: true,
    data: { item }
  });
});

export const updateItem = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { itemId } = req.params;
  const userId = req.user!._id;
  const updates = req.body;

  // Get vendor profile
  const vendor = await Vendor.findOne({ userId });
  if (!vendor) {
    throw createError('Vendor profile not found', 404);
  }

  // Check if item belongs to this vendor
  const item = await Item.findOne({ _id: itemId, vendorId: vendor._id });
  if (!item) {
    throw createError('Item not found or you do not have permission to update it', 404);
  }

  const updatedItem = await Item.findByIdAndUpdate(
    itemId,
    updates,
    { new: true, runValidators: true }
  );

  res.json({
    success: true,
    message: 'Item updated successfully',
    data: { item: updatedItem }
  });
});

export const deleteItem = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { itemId } = req.params;
  const userId = req.user!._id;

  // Get vendor profile
  const vendor = await Vendor.findOne({ userId });
  if (!vendor) {
    throw createError('Vendor profile not found', 404);
  }

  // Check if item belongs to this vendor
  const item = await Item.findOne({ _id: itemId, vendorId: vendor._id });
  if (!item) {
    throw createError('Item not found or you do not have permission to delete it', 404);
  }

  await Item.findByIdAndDelete(itemId);

  res.json({
    success: true,
    message: 'Item deleted successfully'
  });
});

export const getMyItems = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!._id;
  const { category, isAvailable, page = 1, limit = 20 } = req.query;

  // Get vendor profile
  const vendor = await Vendor.findOne({ userId });
  if (!vendor) {
    throw createError('Vendor profile not found', 404);
  }

  const filter: any = { vendorId: vendor._id };
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

export const toggleItemAvailability = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { itemId } = req.params;
  const userId = req.user!._id;

  // Get vendor profile
  const vendor = await Vendor.findOne({ userId });
  if (!vendor) {
    throw createError('Vendor profile not found', 404);
  }

  // Check if item belongs to this vendor
  const item = await Item.findOne({ _id: itemId, vendorId: vendor._id });
  if (!item) {
    throw createError('Item not found or you do not have permission to update it', 404);
  }

  item.isAvailable = !item.isAvailable;
  await item.save();

  res.json({
    success: true,
    message: `Item ${item.isAvailable ? 'enabled' : 'disabled'} successfully`,
    data: { item }
  });
});

export const getCategories = asyncHandler(async (req: AuthRequest, res: Response) => {
  const categories = await Item.distinct('category');

  res.json({
    success: true,
    data: { categories }
  });
});
