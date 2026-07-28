import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { UnidadMedidaProducto } from '@prisma/client';

export class FotoProductoDto {
  @IsString()
  url!: string;

  @IsOptional()
  @IsBoolean()
  esPrincipal?: boolean;

  @IsOptional()
  @IsInt()
  orden?: number;
}

export class CreateProductoProveedorDto {
  @IsString()
  @MinLength(2)
  nombre!: string;

  @IsOptional()
  @IsString()
  categoria?: string;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  cantidadDisponible?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  precioReferencia?: number;

  @IsOptional()
  @IsEnum(UnidadMedidaProducto)
  unidadMedida?: UnidadMedidaProducto;

  @IsOptional()
  @IsBoolean()
  activo?: boolean;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FotoProductoDto)
  fotos?: FotoProductoDto[];
}

export class UpdateProductoProveedorDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  nombre?: string;

  @IsOptional()
  @IsString()
  categoria?: string;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  cantidadDisponible?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  precioReferencia?: number;

  @IsOptional()
  @IsEnum(UnidadMedidaProducto)
  unidadMedida?: UnidadMedidaProducto;

  @IsOptional()
  @IsBoolean()
  activo?: boolean;
}

export class CreateCoberturaDto {
  @IsString()
  @MinLength(2)
  entidad!: string;

  @IsOptional()
  @IsString()
  ciudad?: string;

  @IsOptional()
  @IsString()
  notas?: string;
}

export class CreateServicioDto {
  @IsString()
  @MinLength(2)
  nombre!: string;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  precioReferencia?: number;

  @IsOptional()
  @IsBoolean()
  activo?: boolean;
}
