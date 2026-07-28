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
import { VehiculosService } from './vehiculos.service';
import { CreateVehiculoDto, UpdateVehiculoDto } from './dto/vehiculo.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('vehiculos')
export class VehiculosController {
  constructor(private vehiculosService: VehiculosService) {}

  @Get()
  findAll(@Query('activo') activo?: string) {
    return this.vehiculosService.findAll(
      activo === undefined ? undefined : activo === 'true',
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.vehiculosService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateVehiculoDto) {
    return this.vehiculosService.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateVehiculoDto) {
    return this.vehiculosService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.vehiculosService.remove(id);
  }
}
