const { Readable } = require('stream');

const cloudinary = require('../config/cloudinary');

function uploadBufferToCloudinary(buffer, options = {}) {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(options, (error, result) => {
      if (error) {
        return reject(error);
      }

      return resolve(result);
    });

    Readable.from(buffer).pipe(uploadStream);
  });
}

async function uploadEventImage(file) {
  if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    throw new Error('Cloudinary environment variables are missing');
  }

  if (!file || !file.buffer) {
    throw new Error('Image file is missing');
  }

  const result = await uploadBufferToCloudinary(file.buffer, {
    folder: 'events',
    resource_type: 'image',
  });

  return {
    imageUrl: result.secure_url,
    imagePublicId: result.public_id,
  };
}

module.exports = {
  uploadEventImage,
};
