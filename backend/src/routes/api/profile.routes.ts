import { Router } from "express";
import { body } from "express-validator";
import multer from "multer";
import { protect } from "../../middleware/auth.js";
import { profileController } from "../../controllers/index.js";

const router = Router();

// Configure multer for file upload
const upload = multer({
  storage: multer.diskStorage({}),
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("Only image files are allowed"));
    }
    cb(null, true);
  },
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

router.use(protect);

router.get("/", profileController.getProfile);

router.patch(
  "/",
  [
    body("name")
      .optional()
      .trim()
      .notEmpty()
      .withMessage("Name cannot be empty"),
  ],
  profileController.updateProfile
);

router.post(
  "/upload-picture",
  upload.single("profilePicture"),
  profileController.uploadProfilePicture
);

export default router;
