import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { EstadoCotizacion } from '@prisma/client';

export class CreateCotizacionItemDto {
  @IsOptional()
  @IsString()
  productoId?: string;

  @IsOptional()
  @IsString()
  proveedorId?: string;

  @IsString()
  descripcion!: string;

  @IsInt()
  @Min(1)
  cantidad!: number;

  @IsNumber()
  @Min(0)
  costoUnitario!: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  margenPorcentaje?: number;

  @IsOptional()
  @IsBoolean()
  esSubarrendo?: boolean;
}

export class CreateCotizacionDto {
  @IsString()
  eventoId!: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  margenGlobal?: number;

  @IsOptional()
  @IsString()
  notas?: string;

  @IsOptional()
  @IsDateString()
  validoHasta?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateCotizacionItemDto)
  items?: CreateCotizacionItemDto[];
}

export class UpdateCotizacionDto {
  @IsOptional()
  @IsEnum(EstadoCotizacion)
  estado?: EstadoCotizacion;

  @IsOptional()
  @IsNumber()
  @Min(0)
  margenGlobal?: number;

  @IsOptional()
  @IsString()
  notas?: string;

  @IsOptional()
  @IsDateString()
  validoHasta?: string;
}

export class AddCotizacionItemDto extends CreateCotizacionItemDto {}
