import { Injectable } from '@nestjs/common';

import {

  EstadoOrdenCobro,

  EstadoVerificacionProveedor,

  RolUsuario,

} from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';

import { roundMoney, toNumber } from '../common/utils/pricing';



@Injectable()

export class DashboardService {

  constructor(private prisma: PrismaService) {}



  async getResumen() {

    const now = new Date();

    const inicioMes = new Date(now.getFullYear(), now.getMonth(), 1);

    const hace30Dias = new Date(now);

    hace30Dias.setDate(hace30Dias.getDate() - 30);

    const mesesHistorial = 6;



    const inicioHistorial = new Date(now.getFullYear(), now.getMonth() - (mesesHistorial - 1), 1);



    const [

      empresasRegistradas,

      empresasActivas,

      empresasVerificadas,

      usuariosActivos,

      usuariosPlataforma,

      usuariosProveedor,

      eventosPlataforma,

      eventosProveedor,

      cobros,

      cobrosPagadosMes,

      proveedoresRecientes,

      proveedoresDesactivados30d,

      proveedoresConCobroPagado,

      actividad30d,

    ] = await Promise.all([

      this.prisma.proveedor.count(),

      this.prisma.proveedor.count({ where: { activo: true } }),

      this.prisma.proveedor.count({

        where: { estadoVerificacion: EstadoVerificacionProveedor.VERIFICADO },

      }),

      this.prisma.usuario.count({ where: { activo: true } }),

      this.prisma.usuario.count({

        where: {

          activo: true,

          rol: { in: [RolUsuario.ADMIN, RolUsuario.COMERCIAL, RolUsuario.OPERATIVO, RolUsuario.COMPRAS, RolUsuario.FINANZAS] },

        },

      }),

      this.prisma.usuario.count({

        where: {

          activo: true,

          rol: { in: [RolUsuario.ADMIN_PROVEEDOR, RolUsuario.OPERADOR_PROVEEDOR] },

        },

      }),

      this.prisma.evento.count(),

      this.prisma.eventoClienteProveedor.count({

        where: { estado: { not: 'CANCELADO' } },

      }),

      this.prisma.ordenCobro.findMany({

        where: { estado: { notIn: [EstadoOrdenCobro.BORRADOR, EstadoOrdenCobro.CANCELADO] } },

        select: { monto: true, estado: true, pagadoEn: true, createdAt: true, proveedorId: true },

      }),

      this.prisma.ordenCobro.findMany({

        where: {

          estado: EstadoOrdenCobro.PAGADO,

          pagadoEn: { gte: inicioMes },

        },

        select: { monto: true },

      }),

      this.prisma.proveedor.findMany({

        orderBy: { createdAt: 'desc' },

        take: 6,

        select: {

          id: true,

          nombre: true,

          estadoVerificacion: true,

          activo: true,

          createdAt: true,

          ciudad: true,

        },

      }),

      this.prisma.proveedor.count({

        where: {

          activo: false,

          updatedAt: { gte: hace30Dias },

        },

      }),

      this.prisma.ordenCobro.groupBy({

        by: ['proveedorId'],

        where: { estado: EstadoOrdenCobro.PAGADO },

      }),

      this.countActividad30d(hace30Dias),

    ]);



    const cobrosGenerados = cobros.length;

    const montoCobrosGenerados = roundMoney(

      cobros.reduce((s, c) => s + toNumber(c.monto), 0),

    );



    const cobrosPagadosList = cobros.filter((c) => c.estado === EstadoOrdenCobro.PAGADO);

    const cobrosPagados = cobrosPagadosList.length;

    const montoCobrosPagados = roundMoney(

      cobrosPagadosList.reduce((s, c) => s + toNumber(c.monto), 0),

    );



    const mrr = roundMoney(

      cobrosPagadosMes.reduce((s, c) => s + toNumber(c.monto), 0),

    );



    const baseChurn = empresasActivas + proveedoresDesactivados30d;

    const churn =

      baseChurn > 0

        ? Math.round((proveedoresDesactivados30d / baseChurn) * 1000) / 10

        : 0;



    const conversionPruebaPago =

      empresasRegistradas > 0

        ? Math.round((proveedoresConCobroPagado.length / empresasRegistradas) * 1000) / 10

        : 0;



    const tasaCobranza =

      montoCobrosGenerados > 0

        ? Math.round((montoCobrosPagados / montoCobrosGenerados) * 1000) / 10

        : 0;



    const buckets = this.buildMonthBuckets(mesesHistorial, now);



    const [proveedoresPorMes, cobrosHistorial, actividadPorMes] = await Promise.all([

      this.prisma.proveedor.findMany({

        where: { createdAt: { gte: inicioHistorial } },

        select: { createdAt: true },

      }),

      this.prisma.ordenCobro.findMany({

        where: {

          createdAt: { gte: inicioHistorial },

          estado: { notIn: [EstadoOrdenCobro.BORRADOR, EstadoOrdenCobro.CANCELADO] },

        },

        select: { createdAt: true, monto: true, estado: true, pagadoEn: true },

      }),

      this.actividadPorMes(inicioHistorial),

    ]);



    for (const p of proveedoresPorMes) {

      const key = this.monthKey(p.createdAt);

      const bucket = buckets.find((b) => b.mes === key);

      if (bucket) bucket.empresasNuevas += 1;

    }



    for (const c of cobrosHistorial) {

      const key = this.monthKey(c.createdAt);

      const bucket = buckets.find((b) => b.mes === key);

      if (bucket) {

        bucket.cobrosGenerados += 1;

        bucket.montoGenerado += toNumber(c.monto);

        if (c.estado === EstadoOrdenCobro.PAGADO && c.pagadoEn) {

          const payKey = this.monthKey(c.pagadoEn);

          const payBucket = buckets.find((b) => b.mes === payKey);

          if (payBucket) {

            payBucket.cobrosPagados += 1;

            payBucket.montoPagado += toNumber(c.monto);

          }

        }

      }

    }



    for (const row of actividadPorMes) {

      const bucket = buckets.find((b) => b.mes === row.mes);

      if (bucket) bucket.usoSistema = row.actividad;

    }



    return {

      generadoEn: now.toISOString(),

      metricas: {

        empresasRegistradas,

        empresasActivas,

        empresasVerificadas,

        usuariosActivos,

        usuariosPlataforma,

        usuariosProveedor,

        eventosCreados: eventosPlataforma + eventosProveedor,

        eventosPlataforma,

        eventosProveedor,

        cobrosGenerados,

        montoCobrosGenerados,

        cobrosPagados,

        montoCobrosPagados,

        usoSistema: actividad30d,

        mrr,

        churn,

        conversionPruebaPago,

        tasaCobranza,

      },

      tendencias: {

        porMes: buckets.map((b) => ({

          mes: b.mes,

          mesLabel: b.mesLabel,

          empresasNuevas: b.empresasNuevas,

          cobrosGenerados: b.cobrosGenerados,

          cobrosPagados: b.cobrosPagados,

          montoPagado: roundMoney(b.montoPagado),

          usoSistema: b.usoSistema,

        })),

      },

      recientes: {

        empresas: proveedoresRecientes.map((p) => ({

          id: p.id,

          nombre: p.nombre,

          ciudad: p.ciudad,

          estadoVerificacion: p.estadoVerificacion,

          activo: p.activo,

          createdAt: p.createdAt.toISOString(),

        })),

      },

    };

  }



  private monthKey(date: Date) {

    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

  }



  private buildMonthBuckets(count: number, now: Date) {

    const buckets: {

      mes: string;

      mesLabel: string;

      empresasNuevas: number;

      cobrosGenerados: number;

      cobrosPagados: number;

      montoGenerado: number;

      montoPagado: number;

      usoSistema: number;

    }[] = [];



    for (let i = count - 1; i >= 0; i--) {

      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);

      buckets.push({

        mes: this.monthKey(d),

        mesLabel: new Intl.DateTimeFormat('es-MX', {

          month: 'short',

          year: '2-digit',

        }).format(d),

        empresasNuevas: 0,

        cobrosGenerados: 0,

        cobrosPagados: 0,

        montoGenerado: 0,

        montoPagado: 0,

        usoSistema: 0,

      });

    }



    return buckets;

  }



  private async countActividad30d(desde: Date) {

    const [

      nuevasEmpresas,

      nuevosUsuarios,

      nuevosEventos,

      nuevosEventosProv,

      nuevasCotizaciones,

      nuevosCobros,

    ] = await Promise.all([

      this.prisma.proveedor.count({ where: { createdAt: { gte: desde } } }),

      this.prisma.usuario.count({ where: { createdAt: { gte: desde } } }),

      this.prisma.evento.count({ where: { createdAt: { gte: desde } } }),

      this.prisma.eventoClienteProveedor.count({ where: { createdAt: { gte: desde } } }),

      this.prisma.cotizacionProveedor.count({ where: { createdAt: { gte: desde } } }),

      this.prisma.ordenCobro.count({ where: { createdAt: { gte: desde } } }),

    ]);



    return (

      nuevasEmpresas +

      nuevosUsuarios +

      nuevosEventos +

      nuevosEventosProv +

      nuevasCotizaciones +

      nuevosCobros

    );

  }



  private async actividadPorMes(desde: Date) {

    const [empresas, usuarios, eventos, eventosProv, cotizaciones, cobros] =

      await Promise.all([

        this.prisma.proveedor.findMany({

          where: { createdAt: { gte: desde } },

          select: { createdAt: true },

        }),

        this.prisma.usuario.findMany({

          where: { createdAt: { gte: desde } },

          select: { createdAt: true },

        }),

        this.prisma.evento.findMany({

          where: { createdAt: { gte: desde } },

          select: { createdAt: true },

        }),

        this.prisma.eventoClienteProveedor.findMany({

          where: { createdAt: { gte: desde } },

          select: { createdAt: true },

        }),

        this.prisma.cotizacionProveedor.findMany({

          where: { createdAt: { gte: desde } },

          select: { createdAt: true },

        }),

        this.prisma.ordenCobro.findMany({

          where: { createdAt: { gte: desde } },

          select: { createdAt: true },

        }),

      ]);



    const map = new Map<string, number>();

    const add = (date: Date) => {

      const key = this.monthKey(date);

      map.set(key, (map.get(key) ?? 0) + 1);

    };



    for (const rows of [empresas, usuarios, eventos, eventosProv, cotizaciones, cobros]) {

      for (const row of rows) add(row.createdAt);

    }



    return [...map.entries()].map(([mes, actividad]) => ({ mes, actividad }));

  }

}


