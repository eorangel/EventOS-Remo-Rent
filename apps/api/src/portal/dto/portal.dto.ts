import {
  IsBoolean,
  IsDateString,
  IsEmail,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  MinLength,
} from 'class-validator';
import { EstadoOrdenCobro, MetodoPago, RolUsuario, EstadoEventoProveedor, TipoSeguimientoCliente, EstadoSeguimientoCliente } from '@prisma/client';

export class CreateClienteProveedorDto {
  @IsString()
  @MinLength(2)
  nombre!: string;

  @IsOptional()
  @IsString()
  empresa?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  telefono?: string;

  @IsOptional()
  @IsString()
  notas?: string;
}

export class UpdateClienteProveedorDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  nombre?: string;

  @IsOptional()
  @IsString()
  empresa?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  telefono?: string;

  @IsOptional()
  @IsString()
  notas?: string;

  @IsOptional()
  @IsBoolean()
  activo?: boolean;
}

export class CreateOrdenCobroDto {
  @IsString()
  clienteProveedorId!: string;

  @IsString()
  @MinLength(3)
  concepto!: string;

  @IsNumber()
  @Min(0.01)
  monto!: number;

  @IsOptional()
  @IsEnum(MetodoPago)
  metodoPago?: MetodoPago;

  @IsOptional()
  @IsDateString()
  fechaVencimiento?: string;

  @IsOptional()
  @IsString()
  notas?: string;
}

export class UpdateOrdenCobroDto {
  @IsOptional()
  @IsEnum(EstadoOrdenCobro)
  estado?: EstadoOrdenCobro;

  @IsOptional()
  @IsEnum(MetodoPago)
  metodoPago?: MetodoPago;

  @IsOptional()
  @IsString()
  referencia?: string;

  @IsOptional()
  @IsDateString()
  fechaVencimiento?: string;

  @IsOptional()
  @IsString()
  notas?: string;
}

export class CreateProveedorUsuarioDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(6)
  password!: string;

  @IsString()
  @MinLength(2)
  nombre!: string;

  @IsEnum(RolUsuario)
  rol!: RolUsuario;
}

export class CreateEventoClienteDto {
  @IsString()
  clienteProveedorId!: string;

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
  fechaFin?: string;

  @IsOptional()
  @IsDateString()
  fechaEntrega?: string;

  @IsOptional()
  @IsDateString()
  fechaRecogida?: string;

  @IsOptional()
  @IsString()
  lugar?: string;

  @IsOptional()
  @IsEnum(EstadoEventoProveedor)
  estado?: EstadoEventoProveedor;

  @IsOptional()
  @IsNumber()
  @Min(0)
  montoEstimado?: number;

  @IsOptional()
  @IsString()
  notas?: string;
}

export class UpdateEventoClienteDto {
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
  fechaFin?: string;

  @IsOptional()
  @IsDateString()
  fechaEntrega?: string;

  @IsOptional()
  @IsDateString()
  fechaRecogida?: string;

  @IsOptional()
  @IsString()
  lugar?: string;

  @IsOptional()
  @IsEnum(EstadoEventoProveedor)
  estado?: EstadoEventoProveedor;

  @IsOptional()
  @IsNumber()
  @Min(0)
  montoEstimado?: number;

  @IsOptional()
  @IsString()
  notas?: string;
}

export class CreateSeguimientoDto {
  @IsString()
  clienteProveedorId!: string;

  @IsEnum(TipoSeguimientoCliente)
  tipo!: TipoSeguimientoCliente;

  @IsString()
  @MinLength(2)
  titulo!: string;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsDateString()
  fechaProgramada!: string;
}

export class UpdateSeguimientoDto {
  @IsOptional()
  @IsEnum(TipoSeguimientoCliente)
  tipo?: TipoSeguimientoCliente;

  @IsOptional()
  @IsString()
  @MinLength(2)
  titulo?: string;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsOptional()
  @IsDateString()
  fechaProgramada?: string;

  @IsOptional()
  @IsEnum(EstadoSeguimientoCliente)
  estado?: EstadoSeguimientoCliente;
}
