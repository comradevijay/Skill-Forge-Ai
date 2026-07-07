import multer from 'multer';
import cloudinary from '../config/cloudinary.js';
import asyncHandler from '../utils/asyncHandler.js';

// Files are held in memory only long enough to stream to Cloudinary - never
// written to disk on the server.
const storage = multer.memoryStorage();

const pdfUpload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') return cb(null, true);
    cb(new Error('Only PDF files are allowed'));
  },
  limits: { fileSize: 15 * 1024 * 1024 }, // 15MB cap
});

const imageUpload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype)) return cb(null, true);
    cb(new Error('Only JPEG, PNG or WEBP images are allowed'));
  },
  limits: { fileSize: 8 * 1024 * 1024 }, // 8MB cap
});

export const uploadPdfMiddleware = pdfUpload.single('file');
export const uploadImageMiddleware = imageUpload.single('file');

const streamUpload = (buffer, options) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(options, (error, result) => {
      if (error) return reject(error);
      resolve(result);
    });
    stream.end(buffer);
  });

// @route   POST /api/uploads/pdf
// @access  Private/Instructor
export const uploadPdf = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error('No file uploaded');
  }

  const result = await streamUpload(req.file.buffer, {
    folder: 'skillforge/resources',
    resource_type: 'raw',
    format: 'pdf',
  });

  res.status(201).json({
    success: true,
    url: result.secure_url,
    publicId: result.public_id,
  });
});

// @route   POST /api/uploads/image
// @access  Private/Instructor
export const uploadImage = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error('No file uploaded');
  }

  const result = await streamUpload(req.file.buffer, {
    folder: 'skillforge/thumbnails',
    resource_type: 'image',
    transformation: [{ width: 800, height: 450, crop: 'fill' }],
  });

  res.status(201).json({
    success: true,
    url: result.secure_url,
    publicId: result.public_id,
  });
});
