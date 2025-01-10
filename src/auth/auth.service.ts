import { HttpException, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '@/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { AuthTimeExpires } from '@/constants/auth.constants';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtAuthService: JwtService,
  ) {}

  async login(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user) {
      throw new HttpException('USER_NOT_FOUND', 404);
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new HttpException('PASSWORD_INCORRECT', 403);
    }

    const [token, refreshToken] = await Promise.all([
      this.jwtAuthService.signAsync(
        { userId: user.id, name: user.name },
        { expiresIn: AuthTimeExpires.JWT },
      ),
      this.jwtAuthService.signAsync(
        { userId: user.id },
        { expiresIn: AuthTimeExpires.REFRESH_TOKEN },
      ),
    ]);

    const { password: _, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      token,
      refreshToken,
    };
  }

  async refreshToken(refreshToken: string) {
    try {
      const decoded = this.jwtAuthService.verify(refreshToken);

      const user = await this.prisma.user.findUnique({
        where: { id: decoded.userId },
      });

      if (!user) {
        throw new HttpException('USER_NOT_FOUND', 404);
      }

      const newToken = this.jwtAuthService.sign(
        { userId: user.id, name: user.name },
        { expiresIn: AuthTimeExpires.JWT },
      );

      return { token: newToken };
    } catch (error) {
      console.log(error);
      throw new HttpException('INVALID_REFRESH_TOKEN', 401);
    }
  }

  async logout(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user) {
      throw new HttpException('USER_NOT_FOUND', 404);
    }

    await this.prisma.user.update({
      where: { email },
      data: { refreshToken: null },
    });

    return { message: 'Successfully logged out' };
  }

  async changePassword(email: string, password: string, newPassword: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user) {
      throw new HttpException('USER_NOT_FOUND', 404);
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new HttpException('PASSWORD_INCORRECT', 403);
    }

    await this.prisma.user.update({
      where: { email },
      data: { password: await bcrypt.hash(newPassword, 10) },
    });

    return { message: 'Password successfully changed' };
  }
}
