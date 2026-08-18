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
import { SeccionPlatilloMenu } from '@prisma/client';

export class PlatilloMenuDto {
  @IsOptional()
  @IsString()
  id?: string;

  @IsEnum(SeccionPlatilloMenu)
  seccion!: SeccionPlatilloMenu;

  @IsString()
  @MinLength(1)
  nombre!: string;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  orden?: number;
}

export class CreateMenuBanqueteDto {
  @IsString()
  @MinLength(2)
  nombre!: string;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  precioPorPersona?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  precioPorEvento?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  minimoPersonas?: number;

  @IsOptional()
  @IsBoolean()
  incluyeBebidas?: boolean;

  @IsOptional()
  @IsBoolean()
  incluyeMeseros?: boolean;

  @IsOptional()
  @IsString()
  notas?: string;

  @IsOptional()
  @IsBoolean()
  activo?: boolean;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PlatilloMenuDto)
  platillos?: PlatilloMenuDto[];
}

export class UpdateMenuBanqueteDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  nombre?: string;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  precioPorPersona?: number | null;

  @IsOptional()
  @IsNumber()
  @Min(0)
  precioPorEvento?: number | null;

  @IsOptional()
  @IsInt()
  @Min(1)
  minimoPersonas?: number | null;

  @IsOptional()
  @IsBoolean()
  incluyeBebidas?: boolean;

  @IsOptional()
  @IsBoolean()
  incluyeMeseros?: boolean;

  @IsOptional()
  @IsString()
  notas?: string;

  @IsOptional()
  @IsBoolean()
  activo?: boolean;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PlatilloMenuDto)
  platillos?: PlatilloMenuDto[];
}

export class UpdateServicioProveedorDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  nombre?: string;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  precioReferencia?: number | null;

  @IsOptional()
  @IsBoolean()
  activo?: boolean;
}
