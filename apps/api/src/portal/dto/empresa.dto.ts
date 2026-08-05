import {
  IsBoolean,
  IsEmail,
  IsObject,
  IsOptional,
  IsString,
  IsUrl,
  MinLength,
} from 'class-validator';

export class HorarioDiaDto {
  @IsString()
  dia!: string;

  @IsOptional()
  @IsString()
  abre?: string;

  @IsOptional()
  @IsString()
  cierra?: string;

  @IsOptional()
  @IsBoolean()
  cerrado?: boolean;
}

export class RedesSocialesDto {
  @IsOptional()
  @IsString()
  facebook?: string;

  @IsOptional()
  @IsString()
  instagram?: string;

  @IsOptional()
  @IsString()
  whatsapp?: string;

  @IsOptional()
  @IsString()
  tiktok?: string;

  @IsOptional()
  @IsString()
  linkedin?: string;

  @IsOptional()
  @IsUrl()
  sitioWeb?: string;
}

export class UpdatePerfilEmpresaDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  nombre?: string;

  @IsOptional()
  @IsString()
  razonSocial?: string;

  @IsOptional()
  @IsString()
  rfc?: string;

  @IsOptional()
  @IsString()
  regimenFiscal?: string;

  @IsOptional()
  @IsString()
  codigoPostal?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  telefono?: string;

  @IsOptional()
  @IsString()
  contacto?: string;

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
  logoUrl?: string;

  @IsOptional()
  @IsObject()
  horario?: { dias: HorarioDiaDto[] };

  @IsOptional()
  @IsObject()
  redesSociales?: RedesSocialesDto;

  @IsOptional()
  @IsString()
  politicasRenta?: string;

  @IsOptional()
  @IsString()
  condicionesCancelacion?: string;

  @IsOptional()
  @IsBoolean()
  ivaIncluido?: boolean;

  @IsOptional()
  @IsString()
  moneda?: string;
}
