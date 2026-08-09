import { RemoMark } from '@/components/RemoMark';

type RemoLogoProps = {
  variant?: 'full' | 'header' | 'compact' | 'footer' | 'mark';
  className?: string;
  priority?: boolean;
};

function Wordmark({
  size = 'md',
  subtitle = false,
}: {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  subtitle?: boolean;
}) {
  const textSize = {
    sm: 'text-base',
    md: 'text-lg sm:text-xl',
    lg: 'text-xl sm:text-2xl',
    xl: 'text-2xl sm:text-3xl',
  }[size];

  return (
    <div className="min-w-0">
      <p className={`font-bold tracking-[0.22em] text-white ${textSize}`}>REMO</p>
      {subtitle ? (
        <p className="mt-0.5 text-[9px] font-medium uppercase tracking-[0.34em] text-brand-300 sm:text-[10px]">
          Event Operating System
        </p>
      ) : null}
    </div>
  );
}

function LogoChip({
  children,
  className = '',
  large = false,
}: {
  children: React.ReactNode;
  className?: string;
  large?: boolean;
}) {
  return (
    <div
      className={`inline-flex items-center bg-brand-950 shadow-[0_10px_30px_-14px_rgba(5,11,23,0.75)] ${
        large
          ? 'gap-4 rounded-[1.75rem] rounded-tl-[2.25rem] px-8 py-7 sm:px-10 sm:py-8'
          : 'gap-2.5 rounded-2xl rounded-tl-[1.35rem] px-3.5 py-2 sm:gap-3 sm:px-4 sm:py-2.5'
      } ${className}`}
    >
      {children}
    </div>
  );
}

export function RemoLogo({
  variant = 'compact',
  className = '',
  priority: _priority = false,
}: RemoLogoProps) {
  if (variant === 'mark') {
    return <RemoMark className={`h-10 w-10 ${className}`} />;
  }

  if (variant === 'footer') {
    return (
      <div className={`inline-flex items-center gap-3 sm:gap-3.5 ${className}`}>
        <RemoMark className="h-11 w-11 shrink-0 sm:h-12 sm:w-12" />
        <Wordmark size="lg" subtitle />
      </div>
    );
  }

  if (variant === 'full') {
    return (
      <LogoChip large className={`flex-col items-start ${className}`}>
        <div className="flex items-center gap-3 sm:gap-4">
          <RemoMark className="h-12 w-12 shrink-0 sm:h-14 sm:w-14" />
          <Wordmark size="xl" subtitle />
        </div>
        <p className="w-full border-t border-white/10 pt-4 text-sm leading-relaxed text-slate-300">
          Conecta. Organiza. Potencia cada evento.
        </p>
      </LogoChip>
    );
  }

  const isHeader = variant === 'header';

  return (
    <LogoChip className={className}>
      <RemoMark
        className={isHeader ? 'h-8 w-8 shrink-0 sm:h-9 sm:w-9' : 'h-7 w-7 shrink-0'}
      />
      <Wordmark size={isHeader ? 'md' : 'sm'} />
    </LogoChip>
  );
}
