import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

  async register(userObject: Prisma.UserCreateInput) {
    const { email, password } = userObject;

    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new Error('Email already in use');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    userObject = { ...userObject, password: hashedPassword };

    const user = await this.prisma.user.create({
      data: userObject,
    });

    return user;
  }
}
