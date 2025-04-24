import multer from 'multer';

// --------------------------- User Profile Picture Management -------------------------

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


// ----------------------------- Product Images Management ---------------------------------
// Store uploaded files in memory
const productImageStorage = multer.memoryStorage();

// Allowed only image types
const productImagesFileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];

  if(allowedTypes.includes(file.mimetype)){
    cb(null, true);
  }
  else {
    cb(new Error("Only JPEG, PNG, JPG, and WEBP are allowed"), false);
  }
};

export const productImageUpload = multer({
  storage:productImageStorage,
  fileFilter:productImagesFileFilter,
  limits:{
    fileSize: 10 * 1024 * 1024 , // 5MB per image
    files: 5 ,  // Max 5 images
  },
});

// ------------------------------- Category Image Management -----------------------
const categoryImageStorage = multer.memoryStorage();

const categoryImageFileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if(allowedTypes.includes(file.mimetype)) cb(null, true);
  else cb(new Error("Only jpeg, png, webp are allowed"), false);
};

export const categoryImageUpload = multer ({
  storage:categoryImageStorage,
  fileFilter:categoryImageFileFilter,
  limits:{
    fileSize: 5 * 1024 * 1024, // 5 MB max
  }
});