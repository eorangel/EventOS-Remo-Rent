import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  MinLength,
} from 'class-validator';
import { EstadoSubarrendo } from '@prisma/client';

export class CreateSubarrendoDto {
  @IsString()
  eventoId!: string;

  @IsString()
  proveedorId!: string;

  @IsOptional()
  @IsString()
  cotizacionItemId?: string;

  @IsString()
  @MinLength(2)
  descripcion!: string;

  @IsInt()
  @Min(1)
  cantidad!: number;

  @IsNumber()
  @Min(0)
  costo!: number;

  @IsOptional()
  @IsDateString()
  fechaEntrega?: string;

  @IsOptional()
  @IsString()
  notas?: string;
}

export class UpdateSubarrendoDto {
  @IsOptional()
  @IsEnum(EstadoSubarrendo)
  estado?: EstadoSubarrendo;

  @IsOptional()
  @IsDateString()
  fechaEntrega?: string;

  @IsOptional()
  @IsString()
  notas?: string;
}
