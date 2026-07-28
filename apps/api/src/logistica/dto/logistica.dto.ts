import {
  IsArray,
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { EstadoLogistica } from '@prisma/client';

export class ChecklistItemDto {
  @IsString()
  descripcion!: string;

  @IsOptional()
  orden?: number;
}

export class UpsertLogisticaDto {
  @IsString()
  eventoId!: string;

  @IsOptional()
  @IsString()
  vehiculoId?: string;

  @IsOptional()
  @IsString()
  conductor?: string;

  @IsOptional()
  @IsString()
  equipo?: string;

  @IsOptional()
  @IsDateString()
  fechaSalida?: string;

  @IsOptional()
  @IsDateString()
  fechaRegreso?: string;

  @IsOptional()
  @IsString()
  ruta?: string;

  @IsOptional()
  @IsEnum(EstadoLogistica)
  estado?: EstadoLogistica;

  @IsOptional()
  @IsString()
  notas?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ChecklistItemDto)
  checklist?: ChecklistItemDto[];
}

export class UpdateLogisticaDto {
  @IsOptional()
  @IsString()
  vehiculoId?: string;

  @IsOptional()
  @IsString()
  conductor?: string;

  @IsOptional()
  @IsString()
  equipo?: string;

  @IsOptional()
  @IsDateString()
  fechaSalida?: string;

  @IsOptional()
  @IsDateString()
  fechaRegreso?: string;

  @IsOptional()
  @IsString()
  ruta?: string;

  @IsOptional()
  @IsEnum(EstadoLogistica)
  estado?: EstadoLogistica;

  @IsOptional()
  @IsString()
  notas?: string;
}
