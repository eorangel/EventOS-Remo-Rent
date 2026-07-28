import { IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { TipoDocumento } from '@prisma/client';

export class CreateDocumentoDto {
  @IsString()
  eventoId!: string;

  @IsEnum(TipoDocumento)
  tipo!: TipoDocumento;

  @IsString()
  @MinLength(2)
  titulo!: string;

  @IsOptional()
  @IsString()
  cotizacionId?: string;

  @IsOptional()
  @IsString()
  contenido?: string;
}

export class GenerarDocumentoDto {
  @IsString()
  eventoId!: string;

  @IsEnum(TipoDocumento)
  tipo!: TipoDocumento;

  @IsOptional()
  @IsString()
  cotizacionId?: string;

  @IsOptional()
  @IsString()
  movimientoId?: string;
}
