import {
  IsArray,
  IsEnum,
  IsOptional,
  IsString,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  EstadoPlantillaContrato,
  ModoPlantillaContrato,
  TipoServicioContrato,
} from '@prisma/client';

export class SeccionContratoDto {
  @IsString()
  @MinLength(1)
  id!: string;

  @IsString()
  @MinLength(1)
  titulo!: string;

  @IsString()
  contenido!: string;

  @IsOptional()
  orden?: number;
}

export class CreatePlantillaContratoDto {
  @IsString()
  @MinLength(1)
  nombre!: string;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsOptional()
  @IsEnum(TipoServicioContrato)
  tipoServicio?: TipoServicioContrato;

  @IsOptional()
  @IsString()
  servicioProveedorId?: string;

  @IsOptional()
  @IsString()
  menuBanqueteProveedorId?: string;

  @IsOptional()
  @IsEnum(ModoPlantillaContrato)
  modo?: ModoPlantillaContrato;

  @IsOptional()
  @IsEnum(EstadoPlantillaContrato)
  estado?: EstadoPlantillaContrato;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SeccionContratoDto)
  secciones?: SeccionContratoDto[];
}

export class UpdatePlantillaContratoDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  nombre?: string;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsOptional()
  @IsEnum(TipoServicioContrato)
  tipoServicio?: TipoServicioContrato;

  @IsOptional()
  @IsString()
  servicioProveedorId?: string | null;

  @IsOptional()
  @IsString()
  menuBanqueteProveedorId?: string | null;

  @IsOptional()
  @IsEnum(ModoPlantillaContrato)
  modo?: ModoPlantillaContrato;

  @IsOptional()
  @IsEnum(EstadoPlantillaContrato)
  estado?: EstadoPlantillaContrato;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SeccionContratoDto)
  secciones?: SeccionContratoDto[];
}

export class GenerarPdfContratoDto {
  @IsOptional()
  @IsString()
  clienteNombre?: string;

  @IsOptional()
  @IsString()
  clienteEmpresa?: string;

  @IsOptional()
  @IsString()
  clienteEmail?: string;

  @IsOptional()
  @IsString()
  clienteTelefono?: string;

  @IsOptional()
  @IsString()
  fechaEvento?: string;

  @IsOptional()
  @IsString()
  lugarEvento?: string;

  @IsOptional()
  @IsString()
  montoTotal?: string;

  @IsOptional()
  @IsString()
  servicioNombre?: string;
}

export class SubirArchivoContratoDto {
  @IsString()
  @MinLength(1)
  archivoNombre!: string;

  @IsString()
  @MinLength(1)
  archivoMime!: string;

  @IsString()
  @MinLength(1)
  archivoContenido!: string;
}

export class CrearContratoDesdeCotizacionDto {
  @IsString()
  @MinLength(1)
  plantillaContratoId!: string;
}

export class EnviarContratoEmailDto {
  @IsOptional()
  @IsString()
  emitidoId?: string;

  @IsOptional()
  @IsString()
  destinatario?: string;

  @IsOptional()
  @IsString()
  asunto?: string;

  @IsOptional()
  @IsString()
  mensaje?: string;

  @IsOptional()
  @IsString()
  clienteNombre?: string;

  @IsOptional()
  @IsString()
  clienteEmpresa?: string;

  @IsOptional()
  @IsString()
  clienteEmail?: string;

  @IsOptional()
  @IsString()
  clienteTelefono?: string;

  @IsOptional()
  @IsString()
  fechaEvento?: string;

  @IsOptional()
  @IsString()
  lugarEvento?: string;

  @IsOptional()
  @IsString()
  montoTotal?: string;

  @IsOptional()
  @IsString()
  servicioNombre?: string;
}
