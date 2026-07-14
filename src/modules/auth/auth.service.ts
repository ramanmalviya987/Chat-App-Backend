import bcrypt from "bcrypt";
import { prisma } from "../../lib/prisma.js";
import type { RegisterInput, LoginInput } from "./auth.validation.js";
import { AppError } from "../../errors/app-error.js";
import { generateToken } from "../../utils/jwt.js";
import { generateId } from "../../utils/id.js";
import { s3Client } from "../../config/aws.js";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { env } from "../../config/env.js";

export const authService = {
  async register(data: RegisterInput) {
    const existingUser = await prisma.user.findUnique({
      where: {
        email: data.email,
      },
    });
    if (existingUser) {
      throw new AppError(409, "Email already exists");
    }
    const hashedPassword = await bcrypt.hash(data.password, 10);
    const user = await prisma.user.create({
      data: {
        id: generateId(),
        name: data.name,
        email: data.email,
        password: hashedPassword,
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
    });
    return user;
  },
  async login(data: LoginInput) {
    try {
      const user = await prisma.user.findUnique({
        where: {
          email: data.email,
        },
      });
      if (!user) {
        throw new AppError(401, "Invalid email or password");
      }
      const isPasswordValid = await bcrypt.compare(
        data.password,
        user.password,
      );
      if (!isPasswordValid) {
        throw new AppError(401, "Invalid email or password");
      }
      const token = generateToken(user.id);

      return {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
      };
    } catch (err:any) {
      console.error(
        "=== FULL ERROR ===",
        JSON.stringify(err, Object.getOwnPropertyNames(err), 2),
      );
      console.error(
        "=== DRIVER ADAPTER ERROR ===",
        err?.meta?.driverAdapterError,
      );
      console.error(
        "=== NESTED CAUSE ===",
        err?.meta?.driverAdapterError?.cause,
      );
      throw err;
    }
  },
  async me(userId: string) {
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        updatedAt: true,
        avatarUrl: true,
      },
    });

    if (!user) {
      throw new AppError(404, "User not found");
    }

    let signedAvatarUrl: string | null = null;

    if (user.avatarUrl) {
      signedAvatarUrl = await getSignedUrl(
        s3Client,
        new GetObjectCommand({
          Bucket: env.AWS_BUCKET_NAME,
          Key: user.avatarUrl,
        }),
        {
          expiresIn: 60 * 60, // 1 hour
        },
      );
    }

    return {
      ...user,
      avatarUrl: signedAvatarUrl,
    };
  },
};
