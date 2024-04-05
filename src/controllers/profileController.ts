import cloudinary from 'cloudinary';
import { v4 as uuidv4 } from 'uuid';
import { Request, Response } from 'express';
import asyncHandler from '../util/catchAsync';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const updateProfilePic = asyncHandler(
  async (req: Request, res: Response) => {
    const { userId } = req.params;
    const uploadStream = cloudinary.v2.uploader.upload_stream(
      {
        folder: 'profile-pics', // Optional folder in Cloudinary
      },
      async (error, result) => {
        if (error) {
          console.error('Error uploading image to Cloudinary:', error);
          return res.status(500).json({ error: 'Internal server error' });
        }

        try {
          const updatedProfile = await prisma.profile.update({
            where: { userId: userId },
            data: { profilePic: result.secure_url },
          });
          res.status(200).json(updatedProfile);
        } catch (error) {
          console.error('Error updating profile pic in database:', error);
          res.status(500).json({ error: 'Internal server error' });
        }
      }
    );

    req.pipe(uploadStream);
  }
);
