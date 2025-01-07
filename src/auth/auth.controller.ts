import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Prisma } from '@prisma/client';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  registerUser(@Body() userObject: Prisma.UserCreateInput) {
    return this.authService.register(userObject);
  }

  @Post('login')
  loginUser(@Body() body: { email: string; password: string }) {
    const userWhereUnique: Prisma.UserWhereUniqueInput = {
      email: body.email,
    };
    return this.authService.login(userWhereUnique, body.password);
  }
}
