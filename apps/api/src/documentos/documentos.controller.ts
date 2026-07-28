import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { DocumentosService } from './documentos.service';
import { CreateDocumentoDto, GenerarDocumentoDto } from './dto/documento.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('documentos')
export class DocumentosController {
  constructor(private documentosService: DocumentosService) {}

  @Get()
  findAll(
    @Query('eventoId') eventoId?: string,
    @Query('tipo') tipo?: string,
  ) {
    return this.documentosService.findAll({ eventoId, tipo });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.documentosService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateDocumentoDto) {
    return this.documentosService.create(dto);
  }

  @Post('generar')
  generar(@Body() dto: GenerarDocumentoDto) {
    return this.documentosService.generar(dto);
  }
}
