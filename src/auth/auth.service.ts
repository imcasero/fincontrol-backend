import { HttpException, Injectable } from '@nestjs/common';
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

  async login(email: Prisma.UserWhereUniqueInput, password: string) {
    const user = await this.prisma.user.findUnique({ where: email });

    if (!user) throw new HttpException('USER_NOT_FOUND', 404);

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) throw new HttpException('PASSWORD_INCORRECT', 403);

    return user;
  }
}
