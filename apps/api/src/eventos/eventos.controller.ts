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
  Request,
} from '@nestjs/common';
import { EstadoEvento } from '@prisma/client';
import { EventosService } from './eventos.service';
import { CreateEventoDto, UpdateEventoDto } from './dto/evento.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('eventos')
export class EventosController {
  constructor(private eventosService: EventosService) {}

  @Get()
  findAll(
    @Query('estado') estado?: EstadoEvento,
    @Query('search') search?: string,
  ) {
    return this.eventosService.findAll({ estado, search });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.eventosService.findOne(id);
  }

  @Post()
  create(
    @Body() dto: CreateEventoDto,
    @Request() req: { user: { id: string } },
  ) {
    return this.eventosService.create(dto, req.user.id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateEventoDto) {
    return this.eventosService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.eventosService.remove(id);
  }
}
