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
import { AgendaService } from './agenda.service';
import { CreateActividadDto, UpdateActividadDto } from './dto/agenda.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('agenda')
export class AgendaController {
  constructor(private agendaService: AgendaService) {}

  @Get()
  findByRango(@Query('desde') desde: string, @Query('hasta') hasta: string) {
    return this.agendaService.findByRango(desde, hasta);
  }

  @Get('evento/:eventoId')
  findByEvento(@Param('eventoId') eventoId: string) {
    return this.agendaService.findByEvento(eventoId);
  }

  @Post('evento/:eventoId/sincronizar')
  sincronizar(@Param('eventoId') eventoId: string) {
    return this.agendaService.sincronizarEvento(eventoId);
  }

  @Post()
  create(@Body() dto: CreateActividadDto) {
    return this.agendaService.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateActividadDto) {
    return this.agendaService.update(id, dto);
  }

  @Patch(':id/toggle')
  toggle(@Param('id') id: string) {
    return this.agendaService.toggleCompletada(id);
  }
}
