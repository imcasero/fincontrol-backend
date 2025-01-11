import { Body, Controller, Post } from '@nestjs/common';
import { UserService } from './user.service';
import { Prisma as PrismaClient } from '@prisma/client';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('register')
  registerUser(@Body() body: PrismaClient.UserCreateInput) {
    return this.userService.createUser(body);
  }
}
