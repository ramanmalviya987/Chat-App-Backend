import { prisma } from "../../lib/prisma.js";

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
};