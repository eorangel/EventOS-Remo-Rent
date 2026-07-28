import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  EstadoVerificacionProveedor,
  TipoProveedor,
} from '@prisma/client';
import { ProveedoresService } from './proveedores.service';
import { CreateProveedorDto, UpdateProveedorDto } from './dto/proveedor.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('proveedores')
export class ProveedoresController {
  constructor(private proveedoresService: ProveedoresService) {}

  @Get('metricas/captura')
  metricasCaptura() {
    return this.proveedoresService.metricasCaptura();
  }

  @Get('catalogo/categorias')
  listCategorias() {
    return this.proveedoresService.listCategorias();
  }

  @Get()
  findAll(
    @Query('search') search?: string,
    @Query('tipo') tipo?: TipoProveedor,
    @Query('activo') activo?: string,
    @Query('entidadFederativa') entidadFederativa?: string,
    @Query('ciudad') ciudad?: string,
    @Query('estadoVerificacion') estadoVerificacion?: EstadoVerificacionProveedor,
    @Query('categoria') categoria?: string,
  ) {
    return this.proveedoresService.findAll({
      search,
      tipo,
      activo: activo === undefined ? undefined : activo === 'true',
      entidadFederativa,
      ciudad,
      estadoVerificacion,
      categoria,
    });
  }

  @Get(':id/expediente')
  findExpediente(@Param('id') id: string) {
    return this.proveedoresService.findExpediente(id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.proveedoresService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateProveedorDto) {
    return this.proveedoresService.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateProveedorDto) {
    return this.proveedoresService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.proveedoresService.remove(id);
  }
}
