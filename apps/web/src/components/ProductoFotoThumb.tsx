'use client';

import { useState } from 'react';

type Props = {
  url?: string | null;
  alt: string;
  className?: string;
};

export function ProductoFotoThumb({ url, alt, className = 'h-16 w-16' }: Props) {
  const [broken, setBroken] = useState(false);

  if (!url?.trim() || broken) {
    return (
      <div
        className={`flex shrink-0 items-center justify-center rounded-lg bg-slate-100 px-1 text-center text-[10px] leading-tight text-slate-400 ${className}`}
        title={broken ? 'La URL no muestra una imagen válida' : undefined}
      >
        {broken ? 'No carga' : 'Sin foto'}
      </div>
    );
  }

  return (
    <img
      src={url}
      alt={alt}
      className={`shrink-0 rounded-lg object-cover ${className}`}
      onError={() => setBroken(true)}
    />
  );
}
