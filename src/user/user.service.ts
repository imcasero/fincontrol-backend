import { PrismaService } from '@/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { Prisma as PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async createUser(data: PrismaClient.UserCreateInput) {
    const hashedPassword = await bcrypt.hash(data.password, 10);

    return this.prisma.user.create({
      data: {
        ...data,
        password: hashedPassword,
      },
    });
  }

  async updateUser(data: PrismaClient.UserUpdateInput) {
    const { email, name } = data;

    return this.prisma.user.update({
      where: { email: typeof email === 'string' ? email : undefined },
      data: {
        email,
        name,
        updatedAt: new Date(),
      },
    });
  }
}
