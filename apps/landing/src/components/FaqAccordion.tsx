'use client';

import { useState } from 'react';
import { faqItems } from '@/lib/config';

export function FaqAccordion() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="card divide-y divide-slate-200 overflow-hidden">
      {faqItems.map((item, index) => {
        const isOpen = open === index;
        return (
          <div key={item.question}>
            <button
              type="button"
              onClick={() => setOpen(isOpen ? null : index)}
              className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left transition hover:bg-slate-50"
              aria-expanded={isOpen}
            >
              <span className="font-semibold text-slate-900">{item.question}</span>
              <span
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-lg leading-none transition ${
                  isOpen
                    ? 'rotate-45 border-brand-200 bg-brand-50 text-brand-700'
                    : 'border-slate-200 bg-white text-slate-500'
                }`}
              >
                +
              </span>
            </button>
            {isOpen && (
              <div className="border-t border-slate-100 bg-slate-50/50 px-6 pb-5 pt-4">
                <p className="text-sm leading-relaxed text-slate-600">{item.answer}</p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
