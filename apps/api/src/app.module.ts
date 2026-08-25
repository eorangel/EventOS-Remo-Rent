import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { ClientesModule } from './clientes/clientes.module';
import { EventosModule } from './eventos/eventos.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { ProductosModule } from './productos/productos.module';
import { ProveedoresModule } from './proveedores/proveedores.module';
import { CotizacionesModule } from './cotizaciones/cotizaciones.module';
import { AgendaModule } from './agenda/agenda.module';
import { VehiculosModule } from './vehiculos/vehiculos.module';
import { LogisticaModule } from './logistica/logistica.module';
import { SubarrendosModule } from './subarrendos/subarrendos.module';
import { FinanzasModule } from './finanzas/finanzas.module';
import { DocumentosModule } from './documentos/documentos.module';
import { PortalModule } from './portal/portal.module';
import { PasarelaModule } from './pasarela/pasarela.module';
import { PagosModule } from './pagos/pagos.module';
import { WebhooksModule } from './webhooks/webhooks.module';
import { SuscripcionesModule } from './suscripciones/suscripciones.module';
import { MailModule } from './mail/mail.module';
import { RolesGuard } from './common/guards/roles.guard';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    ClientesModule,
    EventosModule,
    DashboardModule,
    ProductosModule,
    ProveedoresModule,
    PortalModule,
    PasarelaModule,
    PagosModule,
    WebhooksModule,
    CotizacionesModule,
    AgendaModule,
    VehiculosModule,
    LogisticaModule,
    SubarrendosModule,
    FinanzasModule,
    DocumentosModule,
    SuscripcionesModule,
    MailModule,
  ],
  providers: [RolesGuard],
})
export class AppModule {}
