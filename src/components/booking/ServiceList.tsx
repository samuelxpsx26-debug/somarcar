"use client";

import React from "react";
import { Service } from "@/types/booking";
import { Clock, CheckCircle2, ChevronRight, Sparkles } from "lucide-react";

interface ServiceListProps {
  services: Service[];
  selectedService: Service | null;
  onSelectService: (service: Service) => void;
  onContinue: () => void;
}

export default function ServiceList({
  services,
  selectedService,
  onSelectService,
  onContinue,
}: ServiceListProps) {
  return (
    <div className="space-y-4">
      <div className="text-center sm:text-left mb-2">
        <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2 justify-center sm:justify-start">
          <span>Escolha o Serviço</span>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
            Passo 1 de 4
          </span>
        </h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          Selecione o procedimento que deseja realizar
        </p>
      </div>

      <div className="space-y-3">
        {services.map((service) => {
          const isSelected = selectedService?.id === service.id;

          return (
            <div
              key={service.id}
              onClick={() => onSelectService(service)}
              className={`relative cursor-pointer transition-all duration-200 rounded-2xl p-4 border text-left flex flex-col gap-2.5 ${
                isSelected
                  ? "bg-amber-500/5 dark:bg-amber-500/10 border-amber-500 ring-2 ring-amber-500/20 shadow-md shadow-amber-500/5"
                  : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 shadow-sm"
              }`}
            >
              {service.badge && (
                <div className="absolute -top-2.5 right-4">
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-500 text-white shadow-sm">
                    <Sparkles className="w-3 h-3" />
                    {service.badge}
                  </span>
                </div>
              )}

              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 pr-2">
                  <h3 className="font-semibold text-base text-zinc-900 dark:text-zinc-100 leading-snug">
                    {service.name}
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 leading-relaxed">
                    {service.description}
                  </p>
                </div>

                <div className="flex flex-col items-end shrink-0 pt-0.5">
                  <span className="text-base font-bold text-zinc-900 dark:text-zinc-50">
                    R$ {service.price.toFixed(2).replace(".", ",")}
                  </span>
                  <span className="text-xs text-zinc-500 dark:text-zinc-400 flex items-center gap-1 mt-1">
                    <Clock className="w-3 h-3 text-zinc-400" />
                    {service.durationLabel}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-zinc-100 dark:border-zinc-800/80 mt-1">
                <span className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                  Sinal Pix: R$ 30,00
                </span>

                <div className="flex items-center gap-1.5 text-xs font-medium">
                  {isSelected ? (
                    <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400 font-semibold">
                      <CheckCircle2 className="w-4 h-4 fill-amber-500 text-white" />
                      Selecionado
                    </span>
                  ) : (
                    <span className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300">
                      Toque para escolher
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Floating or fixed mobile action button */}
      <div className="pt-2 sticky bottom-3 z-10">
        <button
          type="button"
          onClick={onContinue}
          disabled={!selectedService}
          className={`w-full py-3.5 px-6 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 shadow-lg ${
            selectedService
              ? "bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-amber-500 dark:hover:bg-amber-400 dark:text-zinc-950 active:scale-[0.99] shadow-zinc-900/10 cursor-pointer"
              : "bg-zinc-200 text-zinc-400 dark:bg-zinc-800 dark:text-zinc-600 cursor-not-allowed shadow-none"
          }`}
        >
          <span>Continuar com o agendamento</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
