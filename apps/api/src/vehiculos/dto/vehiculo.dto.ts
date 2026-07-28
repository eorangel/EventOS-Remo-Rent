import { IsBoolean, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateVehiculoDto {
  @IsString()
  @MinLength(2)
  nombre!: string;

  @IsString()
  @MinLength(5)
  placa!: string;

  @IsOptional()
  @IsString()
  capacidad?: string;

  @IsOptional()
  @IsBoolean()
  activo?: boolean;
}

export class UpdateVehiculoDto {
  @IsOptional()
  @IsString()
  nombre?: string;

  @IsOptional()
  @IsString()
  placa?: string;

  @IsOptional()
  @IsString()
  capacidad?: string;

  @IsOptional()
  @IsBoolean()
  activo?: boolean;
}
