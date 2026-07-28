import {
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { EstadoEvento } from '@prisma/client';

export class CreateEventoDto {
  @IsString()
  @MinLength(3)
  titulo!: string;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsDateString()
  fechaEvento!: string;

  @IsOptional()
  @IsDateString()
  fechaMontaje?: string;

  @IsOptional()
  @IsDateString()
  fechaDesmontaje?: string;

  @IsOptional()
  @IsString()
  lugar?: string;

  @IsOptional()
  @IsEnum(EstadoEvento)
  estado?: EstadoEvento;

  @IsOptional()
  @IsString()
  notas?: string;

  @IsString()
  clienteId!: string;
}

export class UpdateEventoDto {
  @IsOptional()
  @IsString()
  @MinLength(3)
  titulo?: string;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsOptional()
  @IsDateString()
  fechaEvento?: string;

  @IsOptional()
  @IsDateString()
  fechaMontaje?: string;

  @IsOptional()
  @IsDateString()
  fechaDesmontaje?: string;

  @IsOptional()
  @IsString()
  lugar?: string;

  @IsOptional()
  @IsEnum(EstadoEvento)
  estado?: EstadoEvento;

  @IsOptional()
  @IsString()
  notas?: string;

  @IsOptional()
  @IsString()
  clienteId?: string;
}
