import { Router } from "express";
import {
  getAllServices,
  getServiceById,
  getServicesByCategory,
  createService,
  updateService,
  deleteService,
  getMyServices,
  approveService,
  rejectService,
  getPendingServices,
} from "../controllers/service.controllers.js";
import { verifyJWT, verifyProvider } from "../middlewares/auth.middlewares.js";
import { isAdmin } from "../middlewares/isAdmin.middlewares.js";
import { upload } from "../middlewares/multer.middlewares.js";

const router = Router();

// Public routes
router.route("/").get(getAllServices);
router.route("/:id").get(getServiceById);
router.route("/category/:category").get(getServicesByCategory);

// Provider routes (authentication required)
router.route("/provider/create").post(
  verifyJWT,
  verifyProvider,
  upload.single("image"),
  createService
);

router.route("/provider/my-services").get(
  verifyJWT,
  verifyProvider,
  getMyServices
);

router.route("/provider/:id").patch(
  verifyJWT,
  verifyProvider,
  upload.single("image"),
  updateService
);

router.route("/provider/:id").delete(
  verifyJWT,
  verifyProvider,
  deleteService
);

// Admin routes
router.route("/admin/pending").get(
  verifyJWT,
  isAdmin,
  getPendingServices
);

router.route("/admin/approve/:id").patch(
  verifyJWT,
  isAdmin,
  approveService
);

router.route("/admin/reject/:id").patch(
  verifyJWT,
  isAdmin,
  rejectService
);

export default router;