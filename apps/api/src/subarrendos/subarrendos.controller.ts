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
import { SubarrendosService } from './subarrendos.service';
import { CreateSubarrendoDto, UpdateSubarrendoDto } from './dto/subarrendo.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('subarrendos')
export class SubarrendosController {
  constructor(private subarrendosService: SubarrendosService) {}

  @Get()
  findAll(
    @Query('eventoId') eventoId?: string,
    @Query('estado') estado?: string,
  ) {
    return this.subarrendosService.findAll({ eventoId, estado });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.subarrendosService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateSubarrendoDto) {
    return this.subarrendosService.create(dto);
  }

  @Post('evento/:eventoId/importar-cotizacion')
  importar(@Param('eventoId') eventoId: string) {
    return this.subarrendosService.importarDesdeCotizacion(eventoId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateSubarrendoDto) {
    return this.subarrendosService.update(id, dto);
  }
}
