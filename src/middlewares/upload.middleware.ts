import multer from "multer";
import { AppError } from "../errors/app-error.js";

const allowedMimeTypes = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

export const upload = multer({
  storage: multer.memoryStorage(),

  limits: {
    fileSize: 5 * 1024 * 1024,
  },

  fileFilter: (_, file, cb) => {
    if (!allowedMimeTypes.includes(file.mimetype)) {
      return cb(
        new AppError(
          400,
          "Only JPEG, PNG and WEBP images are allowed"
        )
      );
    }

    cb(null, true);
  },
});