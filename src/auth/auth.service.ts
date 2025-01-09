import { HttpException, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '@/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { AuthTimeExpires } from '@/constants/auth.constants';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtAuthService: JwtService,
  ) {}

  async login(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user) throw new HttpException('USER_NOT_FOUND', 404);

    if (!(await bcrypt.compare(password, user.password))) {
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

  async refreshToken(refreshToken: string, id: Prisma.UserWhereUniqueInput) {
    const user = await this.prisma.user.findUnique({ where: id });

    if (!user) throw new HttpException('USER_NOT_FOUND', 404);

    const decoded = this.jwtAuthService.verify(refreshToken);

    if (decoded.userId !== user.id) {
      throw new HttpException('INVALID_REFRESH_TOKEN', 401);
    }

    return this.jwtAuthService.sign(
      { userId: user.id, name: user.name },
      { expiresIn: AuthTimeExpires.JWT },
    );
  }

  async logout(id: Prisma.UserWhereUniqueInput) {
    return this.prisma.user.update({
      where: id,
      data: { refreshToken: null },
    });
  }

  async changePassword(
    id: Prisma.UserWhereUniqueInput,
    password: string,
    newPassword: string,
  ) {
    const user = await this.prisma.user.findUnique({ where: id });

    if (!user) throw new HttpException('USER_NOT_FOUND', 404);

    if (!(await bcrypt.compare(password, user.password))) {
      throw new HttpException('PASSWORD_INCORRECT', 403);
    }

    return this.prisma.user.update({
      where: id,
      data: { password: await bcrypt.hash(newPassword, 10) },
    });
  }
}
