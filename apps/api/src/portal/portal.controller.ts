import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { RolUsuario, EstadoOrdenCobro, EstadoCotizacion } from '@prisma/client';
import type { Request, Response } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { getAuthUser } from '../common/utils/request-user';
import { requireProveedorUser } from '../common/utils/user-context';
import { CatalogoProveedorService } from '../proveedores/catalogo-proveedor.service';
import {
  CreateProductoProveedorDto,
  UpdateProductoProveedorDto,
} from '../proveedores/dto/catalogo.dto';
import {
  CreateClienteProveedorDto,
  CreateEventoClienteDto,
  CreateOrdenCobroDto,
  CreateSeguimientoDto,
  UpdateClienteProveedorDto,
  UpdateEventoClienteDto,
  UpdateOrdenCobroDto,
  UpdateSeguimientoDto,
} from './dto/portal.dto';
import { UpdatePerfilEmpresaDto } from './dto/empresa.dto';
import {
  CreateCotizacionProveedorDto,
  UpdateCotizacionProveedorDto,
} from './dto/cotizacion-proveedor.dto';
import { PortalService } from './portal.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RolUsuario.ADMIN_PROVEEDOR, RolUsuario.OPERADOR_PROVEEDOR)
@Controller('portal')
export class PortalController {
  constructor(
    private portalService: PortalService,
    private catalogoService: CatalogoProveedorService,
  ) {}

  @Get('dashboard')
  dashboard(@Req() req: Request) {
    return this.portalService.getDashboard(getAuthUser(req));
  }

  @Get('reportes')
  reportes(@Req() req: Request) {
    return this.portalService.getReportes(getAuthUser(req));
  }

  @Get('clientes')
  listClientes(@Req() req: Request, @Query('search') search?: string) {
    return this.portalService.listClientes(getAuthUser(req), search);
  }

  @Post('clientes')
  createCliente(@Req() req: Request, @Body() dto: CreateClienteProveedorDto) {
    return this.portalService.createCliente(getAuthUser(req), dto);
  }

  @Get('clientes/:id/historial')
  clienteHistorial(@Req() req: Request, @Param('id') id: string) {
    return this.portalService.getClienteHistorial(getAuthUser(req), id);
  }

  @Get('clientes/:id')
  getCliente(@Req() req: Request, @Param('id') id: string) {
    return this.portalService.getCliente(getAuthUser(req), id);
  }

  @Patch('clientes/:id')
  updateCliente(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() dto: UpdateClienteProveedorDto,
  ) {
    return this.portalService.updateCliente(getAuthUser(req), id, dto);
  }

  @Get('cobros')
  listCobros(@Req() req: Request, @Query('estado') estado?: EstadoOrdenCobro) {
    return this.portalService.listCobros(getAuthUser(req), estado);
  }

  @Post('cobros')
  createCobro(@Req() req: Request, @Body() dto: CreateOrdenCobroDto) {
    return this.portalService.createCobro(getAuthUser(req), dto);
  }

  @Patch('cobros/:id')
  updateCobro(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() dto: UpdateOrdenCobroDto,
  ) {
    return this.portalService.updateCobro(getAuthUser(req), id, dto);
  }

  @Post('cobros/:id/marcar-pagado')
  marcarPagado(
    @Req() req: Request,
    @Param('id') id: string,
    @Body('referencia') referencia?: string,
  ) {
    return this.portalService.marcarCobroPagado(getAuthUser(req), id, referencia);
  }

  @Get('empresa')
  getPerfilEmpresa(@Req() req: Request) {
    return this.portalService.getPerfilEmpresa(getAuthUser(req));
  }

  @Patch('empresa')
  updatePerfilEmpresa(@Req() req: Request, @Body() dto: UpdatePerfilEmpresaDto) {
    return this.portalService.updatePerfilEmpresa(getAuthUser(req), dto);
  }

  @Get('cotizaciones')
  listCotizaciones(
    @Req() req: Request,
    @Query('clienteId') clienteId?: string,
    @Query('estado') estado?: EstadoCotizacion,
  ) {
    return this.portalService.listCotizaciones(getAuthUser(req), clienteId, estado);
  }

  @Post('cotizaciones')
  createCotizacion(@Req() req: Request, @Body() dto: CreateCotizacionProveedorDto) {
    return this.portalService.createCotizacion(getAuthUser(req), dto);
  }

  @Get('cotizaciones/:id')
  getCotizacion(@Req() req: Request, @Param('id') id: string) {
    return this.portalService.getCotizacion(getAuthUser(req), id);
  }

  @Patch('cotizaciones/:id')
  updateCotizacion(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() dto: UpdateCotizacionProveedorDto,
  ) {
    return this.portalService.updateCotizacion(getAuthUser(req), id, dto);
  }

  @Post('cotizaciones/:id/pdf')
  generarPdfCotizacion(@Req() req: Request, @Param('id') id: string) {
    return this.portalService.generarPdfCotizacion(getAuthUser(req), id);
  }

  @Get('calendario')
  calendario(
    @Req() req: Request,
    @Query('desde') desde: string,
    @Query('hasta') hasta: string,
  ) {
    return this.portalService.getCalendario(getAuthUser(req), desde, hasta);
  }

  @Get('agenda')
  agenda(@Req() req: Request, @Query('fecha') fecha: string) {
    const day = fecha ?? new Date().toISOString().slice(0, 10);
    return this.portalService.getAgenda(getAuthUser(req), day);
  }

  @Get('eventos')
  listEventos(@Req() req: Request, @Query('clienteId') clienteId?: string) {
    return this.portalService.listEventos(getAuthUser(req), clienteId);
  }

  @Post('eventos')
  createEvento(@Req() req: Request, @Body() dto: CreateEventoClienteDto) {
    return this.portalService.createEvento(getAuthUser(req), dto);
  }

  @Patch('eventos/:id')
  updateEvento(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() dto: UpdateEventoClienteDto,
  ) {
    return this.portalService.updateEvento(getAuthUser(req), id, dto);
  }

  @Get('seguimientos')
  listSeguimientos(
    @Req() req: Request,
    @Query('clienteId') clienteId?: string,
    @Query('pendientes') pendientes?: string,
  ) {
    return this.portalService.listSeguimientos(
      getAuthUser(req),
      clienteId,
      pendientes === 'true',
    );
  }

  @Post('seguimientos')
  createSeguimiento(@Req() req: Request, @Body() dto: CreateSeguimientoDto) {
    return this.portalService.createSeguimiento(getAuthUser(req), dto);
  }

  @Patch('seguimientos/:id')
  updateSeguimiento(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() dto: UpdateSeguimientoDto,
  ) {
    return this.portalService.updateSeguimiento(getAuthUser(req), id, dto);
  }

  @Post('seguimientos/:id/completar')
  completarSeguimiento(@Req() req: Request, @Param('id') id: string) {
    return this.portalService.completarSeguimiento(getAuthUser(req), id);
  }

  @Get('productos')
  listProductos(
    @Req() req: Request,
    @Query('categoria') categoria?: string,
    @Query('search') search?: string,
  ) {
    const proveedorId = requireProveedorUser(getAuthUser(req));
    return this.catalogoService.listProductos(proveedorId, { categoria, search });
  }

  @Get('productos/plantilla-excel')
  descargarPlantilla(@Res({ passthrough: false }) res: Response) {
    const buffer = this.catalogoService.getPlantillaExcelProductos();
    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename="plantilla-inventario-proveedor.xlsx"',
    });
    res.send(buffer);
  }

  @Post('productos/importar-excel')
  @UseInterceptors(
    FileInterceptor('archivo', {
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  importarProductosExcel(
    @Req() req: Request,
    @UploadedFile() file: Express.Multer.File,
    @Query('vistaPrevia') vistaPrevia?: string,
  ) {
    if (!file?.buffer?.length) {
      throw new BadRequestException('Debe enviar un archivo Excel (.xlsx o .xls)');
    }

    const nombre = file.originalname?.toLowerCase() ?? '';
    if (!nombre.endsWith('.xlsx') && !nombre.endsWith('.xls') && !nombre.endsWith('.csv')) {
      throw new BadRequestException('Formato no soportado. Use .xlsx, .xls o .csv');
    }

    const proveedorId = requireProveedorUser(getAuthUser(req));

    try {
      if (vistaPrevia === 'true') {
        return this.catalogoService.previewImportProductosExcel(file.buffer);
      }
      return this.catalogoService.importProductosExcel(proveedorId, file.buffer);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al procesar el archivo';
      throw new BadRequestException(message);
    }
  }

  @Post('productos')
  createProducto(@Req() req: Request, @Body() dto: CreateProductoProveedorDto) {
    const proveedorId = requireProveedorUser(getAuthUser(req));
    return this.catalogoService.createProducto(proveedorId, dto);
  }

  @Get('productos/disponibilidad')
  listProductosDisponibilidad(
    @Req() req: Request,
    @Query('fechaInicio') fechaInicio: string,
    @Query('fechaFin') fechaFin: string,
    @Query('excludeCotizacionId') excludeCotizacionId?: string,
    @Query('categoria') categoria?: string,
    @Query('search') search?: string,
  ) {
    const proveedorId = requireProveedorUser(getAuthUser(req));
    if (!fechaInicio || !fechaFin) {
      throw new BadRequestException('fechaInicio y fechaFin son requeridos');
    }
    return this.catalogoService.listarConDisponibilidad(
      proveedorId,
      fechaInicio,
      fechaFin,
      excludeCotizacionId,
      { categoria, search },
    );
  }

  @Get('productos/:id/disponibilidad')
  getProductoDisponibilidad(
    @Req() req: Request,
    @Param('id') id: string,
    @Query('fechaInicio') fechaInicio: string,
    @Query('fechaFin') fechaFin: string,
    @Query('excludeCotizacionId') excludeCotizacionId?: string,
  ) {
    const proveedorId = requireProveedorUser(getAuthUser(req));
    if (!fechaInicio || !fechaFin) {
      throw new BadRequestException('fechaInicio y fechaFin son requeridos');
    }
    return this.catalogoService.getDisponibilidad(
      proveedorId,
      id,
      fechaInicio,
      fechaFin,
      excludeCotizacionId,
    );
  }

  @Patch('productos/:id')
  updateProducto(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() dto: UpdateProductoProveedorDto,
  ) {
    const proveedorId = requireProveedorUser(getAuthUser(req));
    return this.catalogoService.updateProducto(proveedorId, id, dto);
  }
}
