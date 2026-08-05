import { IsBoolean, IsOptional, IsString, MinLength } from 'class-validator';

export class UpdatePasarelaProveedorDto {
  @IsOptional()
  @IsString()
  mercadoPagoAccessToken?: string;

  @IsOptional()
  @IsString()
  mercadoPagoPublicKey?: string;

  @IsOptional()
  @IsBoolean()
  activo?: boolean;
}
