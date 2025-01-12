import { Body, Controller, Post, Put, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { Prisma as PrismaClient } from '@prisma/client';
import { JwtGuard } from '@/auth/guards/jwt.guard';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('register')
  registerUser(@Body() body: PrismaClient.UserCreateInput) {
    return this.userService.createUser(body);
  }
  @Put('update')
  @UseGuards(JwtGuard)
  updateUser(@Body() body: PrismaClient.UserUpdateInput) {
    return this.userService.updateUser(body);
  }
}
