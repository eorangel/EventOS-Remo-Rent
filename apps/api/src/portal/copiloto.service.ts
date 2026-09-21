import { Injectable } from '@nestjs/common';
import { EstadoCotizacion } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AuthUser, requireProveedorUser } from '../common/utils/user-context';
import { PortalService } from './portal.service';
import { hoyEnMexico } from './briefing.utils';
import { buildCopilotoInicio, type CopilotoInicio } from './copiloto.utils';

@Injectable()
export class CopilotoService {
  constructor(
    private prisma: PrismaService,
    private portalService: PortalService,
  ) {}

  async getInicio(user: AuthUser): Promise<CopilotoInicio> {
    const proveedorId = requireProveedorUser(user);
    const fecha = hoyEnMexico();

    const hace7Dias = new Date();
    hace7Dias.setDate(hace7Dias.getDate() - 7);

    const [agenda, empresa, cotizacionesSinRespuesta] = await Promise.all([
      this.portalService.buildAgendaForProveedor(proveedorId, fecha),
      this.portalService.buildPerfilEmpresaResponse(proveedorId),
      this.prisma.cotizacionProveedor.count({
        where: {
          proveedorId,
          estado: EstadoCotizacion.ENVIADA,
          updatedAt: { lt: hace7Dias },
        },
      }),
    ]);

    return buildCopilotoInicio({
      nombreUsuario: user.nombre,
      nombreEmpresa: empresa.proveedor.nombre,
      fecha,
      agenda,
      completitudPerfil: empresa.completitudPerfilEmpresa,
      cotizacionesSinRespuesta,
    });
  }
}
