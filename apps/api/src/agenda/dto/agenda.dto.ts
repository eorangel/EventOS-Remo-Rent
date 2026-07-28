import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { TipoActividad } from '@prisma/client';

export class CreateActividadDto {
  @IsString()
  eventoId!: string;

  @IsEnum(TipoActividad)
  tipo!: TipoActividad;

  @IsString()
  @MinLength(2)
  titulo!: string;

  @IsDateString()
  fechaInicio!: string;

  @IsOptional()
  @IsDateString()
  fechaFin?: string;

  @IsOptional()
  @IsString()
  lugar?: string;

  @IsOptional()
  @IsString()
  notas?: string;
}

export class UpdateActividadDto {
  @IsOptional()
  @IsEnum(TipoActividad)
  tipo?: TipoActividad;

  @IsOptional()
  @IsString()
  titulo?: string;

  @IsOptional()
  @IsDateString()
  fechaInicio?: string;

  @IsOptional()
  @IsDateString()
  fechaFin?: string;

  @IsOptional()
  @IsString()
  lugar?: string;

  @IsOptional()
  @IsString()
  notas?: string;

  @IsOptional()
  @IsBoolean()
  completada?: boolean;
}
