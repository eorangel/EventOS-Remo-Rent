import {
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  MinLength,
} from 'class-validator';
import {
  EstadoMovimientoFinanciero,
  MetodoPago,
  TipoMovimientoFinanciero,
} from '@prisma/client';

export class CreateMovimientoDto {
  @IsString()
  eventoId!: string;

  @IsEnum(TipoMovimientoFinanciero)
  tipo!: TipoMovimientoFinanciero;

  @IsString()
  @MinLength(2)
  concepto!: string;

  @IsNumber()
  @Min(0)
  monto!: number;

  @IsOptional()
  @IsEnum(MetodoPago)
  metodoPago?: MetodoPago;

  @IsOptional()
  @IsEnum(EstadoMovimientoFinanciero)
  estado?: EstadoMovimientoFinanciero;

  @IsOptional()
  @IsString()
  referencia?: string;

  @IsOptional()
  @IsDateString()
  fecha?: string;

  @IsOptional()
  @IsString()
  notas?: string;
}

export class UpdateMovimientoDto {
  @IsOptional()
  @IsEnum(TipoMovimientoFinanciero)
  tipo?: TipoMovimientoFinanciero;

  @IsOptional()
  @IsString()
  @MinLength(2)
  concepto?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  monto?: number;

  @IsOptional()
  @IsEnum(MetodoPago)
  metodoPago?: MetodoPago;

  @IsOptional()
  @IsEnum(EstadoMovimientoFinanciero)
  estado?: EstadoMovimientoFinanciero;

  @IsOptional()
  @IsString()
  referencia?: string;

  @IsOptional()
  @IsDateString()
  fecha?: string;

  @IsOptional()
  @IsString()
  notas?: string;
}
