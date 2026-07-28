import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { LogisticaService } from './logistica.service';
import { UpsertLogisticaDto, UpdateLogisticaDto } from './dto/logistica.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('logistica')
export class LogisticaController {
  constructor(private logisticaService: LogisticaService) {}

  @Get()
  findAll() {
    return this.logisticaService.findAll();
  }

  @Get('evento/:eventoId')
  findByEvento(@Param('eventoId') eventoId: string) {
    return this.logisticaService.findByEvento(eventoId);
  }

  @Post()
  upsert(@Body() dto: UpsertLogisticaDto) {
    return this.logisticaService.upsert(dto);
  }

  @Patch('checklist/:itemId/toggle')
  toggleChecklist(@Param('itemId') itemId: string) {
    return this.logisticaService.toggleChecklistItem(itemId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateLogisticaDto) {
    return this.logisticaService.update(id, dto);
  }
}
