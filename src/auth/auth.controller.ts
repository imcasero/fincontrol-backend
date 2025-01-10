import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtGuard } from './guards/jwt.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async loginUser(@Body() body: { email: string; password: string }) {
    const { email, password } = body;
    return await this.authService.login(email, password);
  }

  @Post('refresh')
  async refreshToken(@Body() body: { refreshToken: string }) {
    const { refreshToken } = body;
    return await this.authService.refreshToken(refreshToken);
  }

  @UseGuards(JwtGuard)
  @Post('logout')
  async logout(@Body() body: { email: string }) {
    const { email } = body;
    return await this.authService.logout(email);
  }

  @UseGuards(JwtGuard)
  @Post('change-password')
  async changePassword(
    @Body()
    body: {
      email: string;
      oldPassword: string;
      newPassword: string;
    },
  ) {
    const { email, oldPassword, newPassword } = body;
    return await this.authService.changePassword(
      email,
      oldPassword,
      newPassword,
    );
  }
}
