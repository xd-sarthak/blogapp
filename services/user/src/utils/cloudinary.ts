import { v2 as cloudinary, UploadApiResponse, UploadApiErrorResponse } from 'cloudinary';
import fs from 'fs';

cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

export const uploadOnCloudinary = async (
  localFilePath: string
): Promise<UploadApiResponse | null> => {
  try {
    if (!localFilePath) return null;

    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: 'auto',
    });

    console.log('File uploaded to Cloudinary:', response.url);
    fs.unlinkSync(localFilePath); // remove from local storage

    return response;
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    if (fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
    }
    return null;
  }
};
