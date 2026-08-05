import { Card } from '@/components/ui';

export default function PagoPublicoPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <Card className="max-w-md text-center">
        <h1 className="text-lg font-semibold text-slate-900">Pago en línea no disponible</h1>
        <p className="mt-2 text-sm text-slate-600">
          El cobro en línea con pasarela de pago estará disponible en el plan Pro. Por ahora,
          contacta a tu proveedor para realizar el pago por transferencia u otro método acordado.
        </p>
      </Card>
    </div>
  );
}
