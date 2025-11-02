import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import { Service } from "../models/service.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";

export const getAdminDashboardStats = asyncHandler(async (req, res) => {
  const [
    totalUsers,
    totalConsumers,
    totalProviders,
    totalServices,
    approvedServices,
    pendingApprovalServices,
    activeServices,
    inactiveServices,
  ] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ role: "consumer" }),
    User.countDocuments({ role: "provider" }),
    Service.countDocuments(),
    Service.countDocuments({ isApproved: true }),
    Service.countDocuments({ isApproved: false }),
    Service.countDocuments({ isActive: true }),
    Service.countDocuments({ isActive: false }),
  ]);

  res.status(200).json(
    new ApiResponse(200, {
      users: {
        total: totalUsers,
        consumers: totalConsumers,
        providers: totalProviders,
      },
      services: {
        total: totalServices,
        approved: approvedServices,
        pending: pendingApprovalServices,
        active: activeServices,
        inactive: inactiveServices,
      },
    }, "Admin dashboard stats")
  );
});
