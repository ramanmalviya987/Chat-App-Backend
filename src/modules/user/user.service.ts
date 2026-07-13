import { PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { s3Client } from "../../config/aws.js";
import { env } from "../../config/env.js";
import { prisma } from "../../lib/prisma.js";
import crypto from "crypto";
import sharp from "sharp";

export const userService = {
  async getAllUsers(currentUserId: string) {
    const users = await prisma.user.findMany({
      where: {
        id: {
          not: currentUserId,
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    return users;
  },
  async updateAvatar(userId: string, file: Express.Multer.File) {
    const existingUser = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        avatarUrl: true,
      },
    });

    const fileExtension = file.originalname.split(".").pop();
    const compressedImage = await sharp(file.buffer)
      .resize(300, 300, {
        fit: "cover",
      })
      .webp({
        quality: 80,
      })
      .toBuffer();
    ;

    const fileName = `avatars/${userId}/${crypto.randomUUID()}.${fileExtension}`;
    await s3Client.send(
      new PutObjectCommand({
        Bucket: env.AWS_BUCKET_NAME,
        Key: fileName,
        Body: compressedImage,
        ContentType: file.mimetype,
      }),
    );
    console.log("Original size:", file.size);

    console.log("Compressed size:", compressedImage.length);

    // const avatarUrl = `https://${env.AWS_BUCKET_NAME}.s3.${env.AWS_REGION}.amazonaws.com/${fileName}`;
    const avatarKey = fileName;

    const user = await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        avatarUrl: avatarKey,
      },
      select: {
        id: true,
        name: true,
        email: true,
        avatarUrl: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    if (existingUser?.avatarUrl) {
      await s3Client.send(
        new DeleteObjectCommand({
          Bucket: env.AWS_BUCKET_NAME,
          Key: existingUser.avatarUrl,
        }),
      );
    }

    return user;
  },
};
