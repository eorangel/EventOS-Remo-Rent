import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CatalogoProveedorService } from './catalogo-proveedor.service';
import {
  CreateCoberturaDto,
  CreateProductoProveedorDto,
  CreateServicioDto,
  FotoProductoDto,
  UpdateProductoProveedorDto,
} from './dto/catalogo.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('proveedores/:proveedorId')
export class CatalogoProveedorController {
  constructor(private catalogoService: CatalogoProveedorService) {}

  @Get('productos')
  listProductos(
    @Param('proveedorId') proveedorId: string,
    @Query('categoria') categoria?: string,
    @Query('search') search?: string,
  ) {
    return this.catalogoService.listProductos(proveedorId, { categoria, search });
  }

  @Get('productos/:id')
  getProducto(@Param('proveedorId') proveedorId: string, @Param('id') id: string) {
    return this.catalogoService.getProducto(proveedorId, id);
  }

  @Post('productos')
  createProducto(
    @Param('proveedorId') proveedorId: string,
    @Body() dto: CreateProductoProveedorDto,
  ) {
    return this.catalogoService.createProducto(proveedorId, dto);
  }

  @Patch('productos/:id')
  updateProducto(
    @Param('proveedorId') proveedorId: string,
    @Param('id') id: string,
    @Body() dto: UpdateProductoProveedorDto,
  ) {
    return this.catalogoService.updateProducto(proveedorId, id, dto);
  }

  @Delete('productos/:id')
  removeProducto(@Param('proveedorId') proveedorId: string, @Param('id') id: string) {
    return this.catalogoService.removeProducto(proveedorId, id);
  }

  @Post('productos/:productoId/fotos')
  addFoto(
    @Param('proveedorId') proveedorId: string,
    @Param('productoId') productoId: string,
    @Body() dto: FotoProductoDto,
  ) {
    return this.catalogoService.addFoto(proveedorId, productoId, dto);
  }

  @Delete('productos/:productoId/fotos/:fotoId')
  removeFoto(
    @Param('proveedorId') proveedorId: string,
    @Param('productoId') productoId: string,
    @Param('fotoId') fotoId: string,
  ) {
    return this.catalogoService.removeFoto(proveedorId, productoId, fotoId);
  }

  @Get('coberturas')
  listCoberturas(@Param('proveedorId') proveedorId: string) {
    return this.catalogoService.listCoberturas(proveedorId);
  }

  @Post('coberturas')
  createCobertura(
    @Param('proveedorId') proveedorId: string,
    @Body() dto: CreateCoberturaDto,
  ) {
    return this.catalogoService.createCobertura(proveedorId, dto);
  }

  @Delete('coberturas/:id')
  removeCobertura(@Param('proveedorId') proveedorId: string, @Param('id') id: string) {
    return this.catalogoService.removeCobertura(proveedorId, id);
  }

  @Get('servicios')
  listServicios(@Param('proveedorId') proveedorId: string) {
    return this.catalogoService.listServicios(proveedorId);
  }

  @Post('servicios')
  createServicio(
    @Param('proveedorId') proveedorId: string,
    @Body() dto: CreateServicioDto,
  ) {
    return this.catalogoService.createServicio(proveedorId, dto);
  }

  @Delete('servicios/:id')
  removeServicio(@Param('proveedorId') proveedorId: string, @Param('id') id: string) {
    return this.catalogoService.removeServicio(proveedorId, id);
  }
}
