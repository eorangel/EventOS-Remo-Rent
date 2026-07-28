import {
  IsBoolean,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  MinLength,
} from 'class-validator';

export class CreateProductoDto {
  @IsString()
  @MinLength(2)
  codigo!: string;

  @IsString()
  @MinLength(2)
  nombre!: string;

  @IsOptional()
  @IsString()
  categoria?: string;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsInt()
  @Min(0)
  cantidadTotal!: number;

  @IsNumber()
  @Min(0)
  costoUnitario!: number;

  @IsNumber()
  @Min(0)
  precioRenta!: number;

  @IsOptional()
  @IsBoolean()
  activo?: boolean;
}

export class UpdateProductoDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  codigo?: string;

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
  cantidadTotal?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  costoUnitario?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  precioRenta?: number;

  @IsOptional()
  @IsBoolean()
  activo?: boolean;
}
