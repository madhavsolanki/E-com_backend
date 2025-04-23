import multer from 'multer';

// Store uploaded files in memory as buffer
const profileImageStorage = multer.memoryStorage();

// Accept only specific image types
const profileImageFileFilter = (req, file, cb) => {
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only JPEG, PNG, JPG, and WEBP files are allowed'), false);
  }
};

export const profileImageUpload = multer({
  storage: profileImageStorage,
  fileFilter: profileImageFileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
});
