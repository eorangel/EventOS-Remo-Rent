import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto, RegisterDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}

  async login(dto: LoginDto) {
    const user = await this.prisma.usuario.findUnique({
      where: { email: dto.email.toLowerCase() },
    });

    if (!user || !user.activo) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    return this.buildAuthResponse(user);
  }

  async register(dto: RegisterDto) {
    const existing = await this.prisma.usuario.findUnique({
      where: { email: dto.email.toLowerCase() },
    });

    if (existing) {
      throw new UnauthorizedException('El correo ya está registrado');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = await this.prisma.usuario.create({
      data: {
        email: dto.email.toLowerCase(),
        passwordHash,
        nombre: dto.nombre,
        rol: dto.rol,
      },
    });

    return this.buildAuthResponse(user);
  }

  async validateUser(userId: string) {
    return this.prisma.usuario.findUnique({
      where: { id: userId, activo: true },
      select: { id: true, email: true, nombre: true, rol: true },
    });
  }

  private buildAuthResponse(user: {
    id: string;
    email: string;
    nombre: string;
    rol: string;
  }) {
    const token = this.jwt.sign({
      sub: user.id,
      email: user.email,
      rol: user.rol,
    });

    return {
      accessToken: token,
      user: {
        id: user.id,
        email: user.email,
        nombre: user.nombre,
        rol: user.rol,
      },
    };
  }
}
