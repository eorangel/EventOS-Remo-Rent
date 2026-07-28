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
import { EstadoCotizacion } from '@prisma/client';
import { CotizacionesService } from './cotizaciones.service';
import {
  AddCotizacionItemDto,
  CreateCotizacionDto,
  UpdateCotizacionDto,
} from './dto/cotizacion.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('cotizaciones')
export class CotizacionesController {
  constructor(private cotizacionesService: CotizacionesService) {}

  @Get()
  findAll(
    @Query('eventoId') eventoId?: string,
    @Query('estado') estado?: EstadoCotizacion,
  ) {
    return this.cotizacionesService.findAll({ eventoId, estado });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.cotizacionesService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateCotizacionDto) {
    return this.cotizacionesService.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateCotizacionDto) {
    return this.cotizacionesService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.cotizacionesService.remove(id);
  }

  @Post(':id/items')
  addItem(@Param('id') id: string, @Body() dto: AddCotizacionItemDto) {
    return this.cotizacionesService.addItem(id, dto);
  }

  @Delete(':id/items/:itemId')
  removeItem(@Param('id') id: string, @Param('itemId') itemId: string) {
    return this.cotizacionesService.removeItem(id, itemId);
  }
}
