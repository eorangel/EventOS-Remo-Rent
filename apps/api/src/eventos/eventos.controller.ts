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

  @Get('crm/resumen')
  crmResumen() {
    return this.eventosService.getCrmResumen();
  }

  @Get('crm')
  findAllCrm(
    @Query('search') search?: string,
    @Query('origen') origen?: 'PLATAFORMA' | 'PROVEEDOR',
    @Query('estado') estado?: string,
  ) {
    return this.eventosService.findAllCrm({ search, origen, estado });
  }

  @Get('crm/cotizacion/:id')
  findOneCrmCotizacion(@Param('id') id: string) {
    return this.eventosService.findOneCrmCotizacion(id);
  }

  @Get('crm/proveedor/:id')
  findOneCrmProveedor(@Param('id') id: string) {
    return this.eventosService.findOneCrmProveedor(id);
  }

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
