"use client";

import React, { useState } from "react";
import { Service } from "@/types/booking";
import { User, Phone, ArrowLeft, ShieldCheck, Calendar, Clock, CreditCard, ChevronRight } from "lucide-react";

interface CustomerFormProps {
  selectedService: Service | null;
  selectedDate: string;
  selectedTime: string;
  customerName: string;
  customerPhone: string;
  customerNotes?: string;
  onUpdateCustomer: (data: {
    customerName: string;
    customerPhone: string;
    customerNotes?: string;
  }) => void;
  onContinue: () => void;
  onBack: () => void;
}

export default function CustomerForm({
  selectedService,
  selectedDate,
  selectedTime,
  customerName,
  customerPhone,
  customerNotes = "",
  onUpdateCustomer,
  onContinue,
  onBack,
}: CustomerFormProps) {
  const [name, setName] = useState(customerName);
  const [phone, setPhone] = useState(customerPhone);
  const [notes, setNotes] = useState(customerNotes);
  const [error, setError] = useState("");

  // WhatsApp mask: (XX) XXXXX-XXXX
  const formatPhone = (val: string) => {
    const raw = val.replace(/\D/g, "").slice(0, 11);
    if (raw.length <= 2) return raw;
    if (raw.length <= 7) return `(${raw.slice(0, 2)}) ${raw.slice(2)}`;
    return `(${raw.slice(0, 2)}) ${raw.slice(2, 7)}-${raw.slice(7, 11)}`;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value);
    setPhone(formatted);
    onUpdateCustomer({
      customerName: name,
      customerPhone: formatted,
      customerNotes: notes,
    });
    if (error) setError("");
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setName(newName);
    onUpdateCustomer({
      customerName: newName,
      customerPhone: phone,
      customerNotes: notes,
    });
    if (error) setError("");
  };

  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newNotes = e.target.value;
    setNotes(newNotes);
    onUpdateCustomer({
      customerName: name,
      customerPhone: phone,
      customerNotes: newNotes,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Por favor, digite seu nome completo.");
      return;
    }
    const cleanPhone = phone.replace(/\D/g, "");
    if (cleanPhone.length < 10) {
      setError("Por favor, informe um WhatsApp válido com DDD.");
      return;
    }

    onContinue();
  };

  const formattedDate = React.useMemo(() => {
    if (!selectedDate) return "";
    const [y, m, d] = selectedDate.split("-");
    const dateObj = new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
    return dateObj.toLocaleDateString("pt-BR", {
      weekday: "short",
      day: "numeric",
      month: "short",
    });
  }, [selectedDate]);

  return (
    <div className="space-y-5">
      {/* Step Header */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white transition-colors cursor-pointer py-1 px-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Alterar data/horário</span>
        </button>

        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
          Passo 3 de 4
        </span>
      </div>

      <div>
        <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
          Seus Dados
        </h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          Informe seu nome e WhatsApp para enviarmos a confirmação
        </p>
      </div>

      {/* Booking Summary Mini-Card */}
      {selectedService && (
        <div className="bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/30 rounded-2xl p-4 text-xs space-y-2">
          <div className="flex items-center justify-between font-semibold text-zinc-900 dark:text-zinc-100">
            <span className="text-sm font-bold text-amber-700 dark:text-amber-400">
              {selectedService.name}
            </span>
            <span className="text-sm font-bold">
              R$ {selectedService.price.toFixed(2).replace(".", ",")}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-zinc-600 dark:text-zinc-300 pt-1 border-t border-amber-500/20">
            <span className="flex items-center gap-1 capitalize">
              <Calendar className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              {formattedDate}
            </span>
            <span className="flex items-center gap-1 font-medium">
              <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              {selectedTime} ({selectedService.durationLabel})
            </span>
          </div>
        </div>
      )}

      {/* The Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name Field */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1.5">
            Seu Nome Completo *
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
              <User className="w-4 h-4" />
            </div>
            <input
              type="text"
              required
              value={name}
              onChange={handleNameChange}
              placeholder="Ex: João da Silva"
              className="w-full pl-10 pr-4 py-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all shadow-sm"
            />
          </div>
        </div>

        {/* WhatsApp Field */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1.5">
            WhatsApp para Notificação *
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
              <Phone className="w-4 h-4" />
            </div>
            <input
              type="tel"
              required
              value={phone}
              onChange={handlePhoneChange}
              placeholder="(11) 98765-4321"
              maxLength={15}
              className="w-full pl-10 pr-4 py-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm text-zinc-900 dark:white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all shadow-sm font-medium tracking-wide"
            />
          </div>
          <span className="text-[11px] text-zinc-400 dark:text-zinc-500 mt-1 block">
            Você receberá o lembrete e detalhes pelo WhatsApp.
          </span>
        </div>

        {/* Optional Notes */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1.5">
            Observações ou Preferências (Opcional)
          </label>
          <textarea
            rows={2}
            value={notes}
            onChange={handleNotesChange}
            placeholder="Ex: Tenho preferência por tesoura nas laterais..."
            className="w-full p-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all shadow-sm resize-none"
          />
        </div>

        {/* Error message if validation fails */}
        {error && (
          <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 rounded-xl text-rose-700 dark:text-rose-300 text-xs">
            {error}
          </div>
        )}

        {/* Deposit Info Notice */}
        <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-zinc-100 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-600 dark:text-zinc-300">
          <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            Para garantir sua vaga na agenda, solicitamos um sinal de{" "}
            <strong className="text-zinc-900 dark:text-white font-semibold">
              R$ 30,00 via Pix
            </strong>
            . O restante será pago presencialmente no dia do atendimento.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 sticky bottom-3 z-10 flex gap-2">
          <button
            type="button"
            onClick={onBack}
            className="py-3.5 px-4 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-200 font-semibold text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
          >
            Voltar
          </button>

          <button
            type="submit"
            className="flex-1 py-3.5 px-6 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 shadow-lg bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-amber-500 dark:hover:bg-amber-400 dark:text-zinc-950 active:scale-[0.99] shadow-zinc-900/10 cursor-pointer"
          >
            <CreditCard className="w-4 h-4" />
            <span>Pagar Sinal via Pix</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
}
