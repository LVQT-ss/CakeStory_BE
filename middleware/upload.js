import multer from 'multer';

// Configure multer for memory storage
const storage = multer.memoryStorage();

// File filter to accept only image files
const fileFilter = (req, file, cb) => {
    // Accept images only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif|webp)$/)) {
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
};

// Configure multer
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
    }
});

// Middleware to convert uploaded file to Base64
export const convertToBase64 = (req, res, next) => {
    if (!req.file) {
        // Don't return error here, let the controller handle it
        return next();
    }

    try {
        // Convert buffer to Base64
        const base64String = req.file.buffer.toString('base64');

        // Create data URL format
        const mimeType = req.file.mimetype;
        const dataUrl = `data:${mimeType};base64,${base64String}`;

        // Add Base64 string to request body
        req.body.design_image = dataUrl;

        next();
    } catch (error) {
        console.error('Error converting file to Base64:', error);
        res.status(500).json({
            success: false,
            message: 'Error processing uploaded file',
            error: error.message
        });
    }
};

export default upload;