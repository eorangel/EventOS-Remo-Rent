import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { EstadoCotizacion } from '@prisma/client';
import { CreateClienteProveedorDto } from './portal.dto';

export class CotizacionProveedorItemDto {
  @IsOptional()
  @IsString()
  productoProveedorId?: string;

  @IsString()
  @MinLength(1)
  descripcion!: string;

  @IsNumber()
  @Min(1)
  cantidad!: number;

  @IsNumber()
  @Min(0)
  precioUnitario!: number;
}

export class CreateCotizacionProveedorDto {
  @IsOptional()
  @IsString()
  clienteProveedorId?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => CreateClienteProveedorDto)
  cliente?: CreateClienteProveedorDto;

  @IsOptional()
  @IsString()
  titulo?: string;

  @IsOptional()
  @IsEnum(EstadoCotizacion)
  estado?: EstadoCotizacion;

  @IsOptional()
  @IsDateString()
  fechaEvento?: string;

  @IsOptional()
  @IsString()
  lugarEntrega?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  costoEnvio?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  descuentoPorcentaje?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  ivaPorcentaje?: number;

  @IsOptional()
  @IsBoolean()
  ivaIncluido?: boolean;

  @IsOptional()
  @IsDateString()
  validoHasta?: string;

  @IsOptional()
  @IsString()
  notas?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CotizacionProveedorItemDto)
  items!: CotizacionProveedorItemDto[];
}

export class UpdateCotizacionProveedorDto {
  @IsOptional()
  @IsString()
  titulo?: string;

  @IsOptional()
  @IsEnum(EstadoCotizacion)
  estado?: EstadoCotizacion;

  @IsOptional()
  @IsDateString()
  fechaEvento?: string;

  @IsOptional()
  @IsString()
  lugarEntrega?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  costoEnvio?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  descuentoPorcentaje?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  ivaPorcentaje?: number;

  @IsOptional()
  @IsBoolean()
  ivaIncluido?: boolean;

  @IsOptional()
  @IsDateString()
  validoHasta?: string;

  @IsOptional()
  @IsString()
  notas?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CotizacionProveedorItemDto)
  items?: CotizacionProveedorItemDto[];
}
