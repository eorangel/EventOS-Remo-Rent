import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { EstadoSuscripcion, RolUsuario } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { SuscripcionesService } from './suscripciones.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RolUsuario.ADMIN)
@Controller('suscripciones')
export class SuscripcionesController {
  constructor(private suscripcionesService: SuscripcionesService) {}

  @Get('resumen')
  resumen() {
    return this.suscripcionesService.getResumen();
  }

  @Get('planes')
  listPlanes() {
    return this.suscripcionesService.listPlanes();
  }

  @Get()
  findAll(
    @Query('search') search?: string,
    @Query('estado') estado?: EstadoSuscripcion,
    @Query('planId') planId?: string,
  ) {
    return this.suscripcionesService.findAll({ search, estado, planId });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.suscripcionesService.findOne(id);
  }
}
