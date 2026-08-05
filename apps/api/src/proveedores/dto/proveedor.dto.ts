import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  Min,
  MinLength,
} from 'class-validator';
import {
  EstadoVerificacionProveedor,
  OrigenCapturaProveedor,
  TipoProveedor,
} from '@prisma/client';

export class CreateProveedorDto {
  @IsString()
  @MinLength(2)
  nombre!: string;

  @IsOptional()
  @IsString()
  razonSocial?: string;

  @IsOptional()
  @IsString()
  rfc?: string;

  @IsOptional()
  @IsString()
  contacto?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  telefono?: string;

  @IsOptional()
  @IsString()
  sitioWeb?: string;

  @IsOptional()
  @IsString()
  direccion?: string;

  @IsOptional()
  @IsString()
  ciudad?: string;

  @IsOptional()
  @IsString()
  entidadFederativa?: string;

  @IsOptional()
  @IsString()
  alcaldia?: string;

  @IsOptional()
  @IsNumber()
  latitud?: number;

  @IsOptional()
  @IsNumber()
  longitud?: number;

  @IsOptional()
  @IsEnum(TipoProveedor)
  tipo?: TipoProveedor;

  @IsOptional()
  @IsEnum(EstadoVerificacionProveedor)
  estadoVerificacion?: EstadoVerificacionProveedor;

  @IsOptional()
  @IsEnum(OrigenCapturaProveedor)
  origenCaptura?: OrigenCapturaProveedor;

  @IsOptional()
  @IsInt()
  @Min(0)
  eventosSimultaneosMax?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  unidadesMaxEntrega?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  radioCoberturaKm?: number;

  @IsOptional()
  @IsString()
  notas?: string;

  @IsOptional()
  @IsBoolean()
  activo?: boolean;
}

export class UpdateProveedorDto extends CreateProveedorDto {}
