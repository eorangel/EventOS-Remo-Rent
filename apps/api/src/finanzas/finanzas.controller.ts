import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { FinanzasService } from './finanzas.service';
import { CreateMovimientoDto, UpdateMovimientoDto } from './dto/finanza.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('finanzas')
export class FinanzasController {
  constructor(private finanzasService: FinanzasService) {}

  @Get()
  findAll(
    @Query('eventoId') eventoId?: string,
    @Query('tipo') tipo?: string,
    @Query('estado') estado?: string,
  ) {
    return this.finanzasService.findAll({ eventoId, tipo, estado });
  }

  @Get('resumen')
  resumenGlobal() {
    return this.finanzasService.resumenGlobal();
  }

  @Get('evento/:eventoId/resumen')
  resumenEvento(@Param('eventoId') eventoId: string) {
    return this.finanzasService.resumenEvento(eventoId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.finanzasService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateMovimientoDto) {
    return this.finanzasService.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateMovimientoDto) {
    return this.finanzasService.update(id, dto);
  }
}
