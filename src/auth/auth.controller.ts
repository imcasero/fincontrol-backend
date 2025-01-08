import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Prisma } from '@prisma/client';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login') // Public | return jwt and refresh token from user
  loginUser(@Body() body: { email: string; password: string }) {
    const { email, password } = body;
    return this.authService.login(email, password);
  }

  @Post('refresh') // Portect | return new jwt token
  refreshToken(
    @Body() body: { refreshToken: string; id: Prisma.UserWhereUniqueInput },
  ) {
    const { refreshToken, id } = body;
    return this.authService.refreshToken(refreshToken, id);
  }

  @Post('logout') // Portect | remove refresh token from user
  logout() {
    return console.log('logout');
  }

  @Post('change-password') // Portect | change password
  changePassword() {
    console.log('change password');
  }
}
