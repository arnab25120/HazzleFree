import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Service } from "../models/service.model.js";
import { User } from "../models/user.model.js";
import mongoose from "mongoose";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

// Get all services (public route)
const getAllServices = asyncHandler(async (req, res) => {
  const { page = 1, limit = 12, search = "", category = "", location = "" } = req.query;
  
  // Build search query
  const query = { 
    isApproved: true, 
    isActive: true 
  };

  if (search) {
    query.$or = [
      { title: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
    ];
  }

  if (category && category !== "All") {
    query.category = category;
  }

  if (location) {
    query.location = { $regex: location, $options: "i" };
  }

  const services = await Service.find(query)
    .populate("provider", "name email contactNumber")
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const totalServices = await Service.countDocuments(query);
  const totalPages = Math.ceil(totalServices / limit);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        services,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalServices,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
        filters: {
          currentCategory: category || "All",
          currentLocation: location,
        },
      },
      "Services fetched successfully"
    )
  );
});

// Get service by ID (public route)
const getServiceById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  if (!isValidObjectId(id)) {
    throw new ApiError(400, "Invalid service ID");
  }

  const service = await Service.findOne({ 
    _id: id, 
    isApproved: true, 
    isActive: true 
  }).populate("provider", "name email contactNumber createdAt");

  if (!service) {
    throw new ApiError(404, "Service not found");
  }

  return res.status(200).json(
    new ApiResponse(200, { service }, "Service fetched successfully")
  );
});

// Get services by category (public route)
const getServicesByCategory = asyncHandler(async (req, res) => {
  const { category } = req.params;
  const { page = 1, limit = 12 } = req.query;

  const validCategories = [
    "Plumber",
    "Electrician", 
    "Mechanic",
    "Tutor",
    "Babysitter",
    "Cleaning",
    "Carpenter",
    "Other"
  ];

  if (!validCategories.includes(category)) {
    throw new ApiError(400, "Invalid category");
  }

  const services = await Service.find({
    category,
    isApproved: true,
    isActive: true,
  })
    .populate("provider", "name email contactNumber")
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const totalServices = await Service.countDocuments({
    category,
    isApproved: true,
    isActive: true,
  });

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        services,
        category,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalServices / limit),
          totalServices,
        },
      },
      `${category} services fetched successfully`
    )
  );
});

// Create service (provider only)
const createService = asyncHandler(async (req, res) => {
  const { title, description, category, location, price } = req.body;
  const providerId = req.user._id;
  
  const localImagePath = req.file?.path;

  // Validation
  if (!title || !description || !category || !location || !price) {
    throw new ApiError(400, "All fields are required");
  }

  // Validate category
  const validCategories = [
    "Plumber",
    "Electrician",
    "Mechanic", 
    "Tutor",
    "Babysitter",
    "Cleaning",
    "Carpenter",
    "Other"
  ];
  
  if (!validCategories.includes(category)) {
    throw new ApiError(400, `Invalid category. Must be one of: ${validCategories.join(", ")}`);
  }

  // Validate price
  if (price <= 0 || !Number.isFinite(Number(price))) {
    throw new ApiError(400, "Price must be a positive number");
  }

  let imageUrl = "";
  if (localImagePath) {
    const uploadedImage = await uploadOnCloudinary(localImagePath);
    if (!uploadedImage?.url) {
      throw new ApiError(500, "Image upload failed");
    }
    imageUrl = uploadedImage.url;
  }

  const serviceData = {
    title: title.trim(),
    description: description.trim(),
    category,
    location: location.trim(),
    price: Number(price),
    imageUrl,
    provider: providerId,
  };

  const service = await Service.create(serviceData);

  return res.status(201).json(
    new ApiResponse(201, { service }, "Service created successfully and sent for approval")
  );
});

// Update service (provider only - own services)
const updateService = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { title, description, category, location, price } = req.body;
  const providerId = req.user._id;

  if (!isValidObjectId(id)) {
    throw new ApiError(400, "Invalid service ID");
  }

  // Find service and check ownership
  const service = await Service.findOne({ _id: id, provider: providerId });
  if (!service) {
    throw new ApiError(404, "Service not found or you don't have permission to update it");
  }

  // Prepare update data
  const updateData = {};

  if (title !== undefined) {
    if (!title.trim()) {
      throw new ApiError(400, "Title cannot be empty");
    }
    updateData.title = title.trim();
  }

  if (description !== undefined) {
    if (!description.trim()) {
      throw new ApiError(400, "Description cannot be empty");
    }
    updateData.description = description.trim();
  }

  if (category !== undefined) {
    const validCategories = [
      "Plumber",
      "Electrician",
      "Mechanic",
      "Tutor", 
      "Babysitter",
      "Cleaning",
      "Carpenter",
      "Other"
    ];
    if (!validCategories.includes(category)) {
      throw new ApiError(400, `Invalid category. Must be one of: ${validCategories.join(", ")}`);
    }
    updateData.category = category;
  }

  if (location !== undefined) {
    if (!location.trim()) {
      throw new ApiError(400, "Location cannot be empty");
    }
    updateData.location = location.trim();
  }

  if (price !== undefined) {
    if (price <= 0 || !Number.isFinite(Number(price))) {
      throw new ApiError(400, "Price must be a positive number");
    }
    updateData.price = Number(price);
  }

  // Handle image update
  if (req.file) {
    const uploadResult = await uploadOnCloudinary(req.file.path);
    if (uploadResult) {
      updateData.imageUrl = uploadResult.url;
    }
  }

  // Reset approval status if service content is updated
  if (title || description || category || location || price) {
    updateData.isApproved = false;
  }

  const updatedService = await Service.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  });

  return res.status(200).json(
    new ApiResponse(200, { service: updatedService }, "Service updated successfully")
  );
});

// Delete service (provider only - own services)
const deleteService = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const providerId = req.user._id;

  if (!isValidObjectId(id)) {
    throw new ApiError(400, "Invalid service ID");
  }

  const service = await Service.findOne({ _id: id, provider: providerId });
  if (!service) {
    throw new ApiError(404, "Service not found or you don't have permission to delete it");
  }

  // Soft delete
  await Service.findByIdAndUpdate(id, { isActive: false });

  return res.status(200).json(
    new ApiResponse(200, {}, "Service deleted successfully")
  );
});

// Get provider's own services
const getMyServices = asyncHandler(async (req, res) => {
  const providerId = req.user._id;
  const { page = 1, limit = 10, status = "" } = req.query;

  const query = { provider: providerId, isActive: true };

  // Filter by approval status
  if (status === "approved") {
    query.isApproved = true;
  } else if (status === "pending") {
    query.isApproved = false;
  }

  const services = await Service.find(query)
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const totalServices = await Service.countDocuments(query);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        services,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalServices / limit),
          totalServices,
        },
      },
      "Your services fetched successfully"
    )
  );
});

// Admin routes
const approveService = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    throw new ApiError(400, "Invalid service ID");
  }

  const service = await Service.findByIdAndUpdate(
    id,
    { isApproved: true },
    { new: true }
  );

  if (!service) {
    throw new ApiError(404, "Service not found");
  }

  return res.status(200).json(
    new ApiResponse(200, { service }, "Service approved successfully")
  );
});

const rejectService = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    throw new ApiError(400, "Invalid service ID");
  }

  const service = await Service.findByIdAndUpdate(
    id,
    { isApproved: false },
    { new: true }
  );

  if (!service) {
    throw new ApiError(404, "Service not found");
  }

  return res.status(200).json(
    new ApiResponse(200, { service }, "Service rejected")
  );
});

const getPendingServices = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;

  const services = await Service.find({ 
    isApproved: false, 
    isActive: true 
  })
    .populate("provider", "name email contactNumber")
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const totalServices = await Service.countDocuments({ 
    isApproved: false, 
    isActive: true 
  });

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        services,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalServices / limit),
          totalServices,
        },
      },
      "Pending services fetched successfully"
    )
  );
});

export {
  // Public routes
  getAllServices,
  getServiceById,
  getServicesByCategory,
  
  // Provider routes
  createService,
  updateService,
  deleteService,
  getMyServices,
  
  // Admin routes
  approveService,
  rejectService,
  getPendingServices,
};