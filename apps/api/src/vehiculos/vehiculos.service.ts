import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateVehiculoDto, UpdateVehiculoDto } from './dto/vehiculo.dto';

@Injectable()
export class VehiculosService {
  constructor(private prisma: PrismaService) {}

  findAll(activo?: boolean) {
    return this.prisma.vehiculo.findMany({
      where: activo !== undefined ? { activo } : undefined,
      orderBy: { nombre: 'asc' },
    });
  }

  async findOne(id: string) {
    const v = await this.prisma.vehiculo.findUnique({ where: { id } });
    if (!v) throw new NotFoundException('Vehículo no encontrado');
    return v;
  }

  create(dto: CreateVehiculoDto) {
    return this.prisma.vehiculo.create({ data: dto });
  }

  async update(id: string, dto: UpdateVehiculoDto) {
    await this.findOne(id);
    return this.prisma.vehiculo.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.vehiculo.delete({ where: { id } });
  }
}
