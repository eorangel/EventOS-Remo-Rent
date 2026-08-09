export function CrmPreview() {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-slate-100 shadow-2xl shadow-slate-400/30 ring-1 ring-slate-900/5">
      {/* Browser chrome */}
      <div className="flex items-center gap-2 border-b border-slate-200 bg-white px-4 py-3">
        <div className="flex gap-1.5">
          <span className="h-3 w-3 rounded-full bg-red-400" />
          <span className="h-3 w-3 rounded-full bg-amber-400" />
          <span className="h-3 w-3 rounded-full bg-emerald-400" />
        </div>
        <div className="mx-auto flex h-7 max-w-xs flex-1 items-center justify-center rounded-md bg-slate-100 px-3 text-[10px] text-slate-500">
          app.eventos.remorent.mx
        </div>
      </div>

      <div className="flex min-h-[300px] sm:min-h-[440px]">
        <aside className="hidden w-52 shrink-0 border-r border-slate-200 bg-white sm:block">
          <div className="border-b border-slate-200 px-4 py-4">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-xs font-bold text-white">
                E
              </span>
              <div>
                <p className="text-xs font-bold text-slate-900">EventOS</p>
                <p className="text-[10px] text-slate-500">Remo&Rent</p>
              </div>
            </div>
          </div>
          <nav className="space-y-0.5 p-2">
            {[
              { label: 'Inicio', active: false },
              { label: 'Clientes', active: false },
              { label: 'Eventos', active: true },
              { label: 'Calendario', active: false },
              { label: 'Cobros', active: false },
            ].map((item) => (
              <div
                key={item.label}
                className={`rounded-lg px-3 py-2.5 text-xs font-medium ${
                  item.active
                    ? 'bg-brand-600 text-white shadow-sm shadow-brand-600/30'
                    : 'text-slate-600'
                }`}
              >
                {item.label}
              </div>
            ))}
          </nav>
        </aside>

        <div className="min-w-0 flex-1 bg-slate-100 p-4 lg:p-5">
          <div className="mb-4">
            <h3 className="text-base font-bold text-slate-900">Eventos</h3>
            <p className="text-xs text-slate-500">Registro unificado del CRM</p>
          </div>

          <div className="mb-4 overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-brand-900 p-4 text-white shadow-lg">
            <p className="text-[10px] font-medium uppercase tracking-wider text-brand-200/90">
              Registro central · CRM
            </p>
            <div className="mt-3 grid grid-cols-3 gap-2">
              {[
                { label: 'Total', value: '12' },
                { label: 'Próximos', value: '5' },
                { label: 'Completados', value: '4' },
              ].map((kpi) => (
                <div
                  key={kpi.label}
                  className="rounded-xl border border-white/10 bg-white/5 px-2 py-2.5 text-center backdrop-blur-sm"
                >
                  <p className="text-[9px] text-slate-300">{kpi.label}</p>
                  <p className="text-xl font-bold">{kpi.value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <table className="w-full text-left text-[11px]">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="px-3 py-2.5 font-semibold">Evento</th>
                  <th className="hidden px-3 py-2.5 font-semibold md:table-cell">Cliente</th>
                  <th className="px-3 py-2.5 font-semibold">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {[
                  {
                    evento: 'Boda González-Ruiz',
                    cliente: 'María González',
                    estado: 'Cotización',
                    color: 'bg-amber-100 text-amber-800',
                  },
                  {
                    evento: 'Congreso WTC',
                    cliente: 'Roberto Sánchez',
                    estado: 'Completado',
                    color: 'bg-emerald-100 text-emerald-800',
                  },
                  {
                    evento: 'Boda Méndez',
                    cliente: 'Laura Méndez',
                    estado: 'Confirmado',
                    color: 'bg-blue-100 text-blue-800',
                  },
                ].map((row) => (
                  <tr key={row.evento} className="hover:bg-slate-50/80">
                    <td className="px-3 py-3 font-medium text-brand-700">{row.evento}</td>
                    <td className="hidden px-3 py-3 md:table-cell">{row.cliente}</td>
                    <td className="px-3 py-3">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${row.color}`}
                      >
                        {row.estado}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
