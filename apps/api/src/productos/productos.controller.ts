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
import { ProductosService } from './productos.service';
import { CreateProductoDto, UpdateProductoDto } from './dto/producto.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('productos')
export class ProductosController {
  constructor(private productosService: ProductosService) {}

  @Get()
  findAll(
    @Query('search') search?: string,
    @Query('categoria') categoria?: string,
    @Query('activo') activo?: string,
  ) {
    return this.productosService.findAll({
      search,
      categoria,
      activo: activo === undefined ? undefined : activo === 'true',
    });
  }

  @Get('disponibilidad')
  listarConDisponibilidad(
    @Query('fechaInicio') fechaInicio: string,
    @Query('fechaFin') fechaFin: string,
    @Query('excludeEventoId') excludeEventoId?: string,
  ) {
    return this.productosService.listarConDisponibilidad(
      fechaInicio,
      fechaFin,
      excludeEventoId,
    );
  }

  @Get(':id/disponibilidad')
  getDisponibilidad(
    @Param('id') id: string,
    @Query('fechaInicio') fechaInicio: string,
    @Query('fechaFin') fechaFin: string,
    @Query('excludeEventoId') excludeEventoId?: string,
  ) {
    return this.productosService.getDisponibilidad(
      id,
      fechaInicio,
      fechaFin,
      excludeEventoId,
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productosService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateProductoDto) {
    return this.productosService.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateProductoDto) {
    return this.productosService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productosService.remove(id);
  }
}
