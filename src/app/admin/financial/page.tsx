"use client";

import React, { useState } from "react";
import {
  Wallet,
  ArrowUpRight,
  ShieldCheck,
  Download,
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
  DollarSign,
  TrendingUp,
} from "lucide-react";

export default function AdminFinancialPage() {
  const [filterPeriod, setFilterPeriod] = useState<"week" | "month" | "all">("month");

  const transactions = [
    {
      id: "tx-1",
      customer: "Lucas Ferreira",
      service: "Combo VIP",
      depositAmount: 30.0,
      totalAmount: 90.0,
      date: "Hoje, 09:12",
      status: "approved",
      pixKey: "contato@barbeariaimperial.com.br",
    },
    {
      id: "tx-2",
      customer: "Rafael Mendonça",
      service: "Corte Moderno",
      depositAmount: 30.0,
      totalAmount: 55.0,
      date: "Hoje, 08:45",
      status: "approved",
      pixKey: "contato@barbeariaimperial.com.br",
    },
    {
      id: "tx-3",
      customer: "Thiago Barbosa",
      service: "Barboterapia Completa",
      depositAmount: 30.0,
      totalAmount: 45.0,
      date: "Hoje, 10:20",
      status: "pending",
      pixKey: "contato@barbeariaimperial.com.br",
    },
    {
      id: "tx-4",
      customer: "Matheus Andrade",
      service: "Corte Moderno",
      depositAmount: 30.0,
      totalAmount: 55.0,
      date: "Ontem, 16:30",
      status: "approved",
      pixKey: "contato@barbeariaimperial.com.br",
    },
    {
      id: "tx-5",
      customer: "Guilherme Siqueira",
      service: "Combo VIP",
      depositAmount: 30.0,
      totalAmount: 90.0,
      date: "Ontem, 14:10",
      status: "approved",
      pixKey: "contato@barbeariaimperial.com.br",
    },
    {
      id: "tx-6",
      customer: "Bruno Alcantara",
      service: "Corte Moderno",
      depositAmount: 30.0,
      totalAmount: 55.0,
      date: "14/10/2026",
      status: "approved",
      pixKey: "contato@barbeariaimperial.com.br",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <h1 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight">
            Financeiro & Recebimentos Pix
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Extrato de sinais Pix recebidos e repasses em conta
          </p>
        </div>

        <button
          type="button"
          className="inline-flex items-center gap-2 py-2 px-3.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-200 text-xs font-semibold hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors cursor-pointer self-start sm:self-auto shadow-xs"
        >
          <Download className="w-3.5 h-3.5 text-zinc-400" />
          <span>Exportar Relatório</span>
        </button>
      </div>

      {/* Financial Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400">Total em Sinais Pix (Mês)</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-2xl font-black text-zinc-900 dark:text-white">
              R$ 1.620,00
            </span>
            <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1 flex items-center gap-1">
              <ArrowUpRight className="w-3 h-3" />
              54 reservas com sinal garantido
            </p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400">Faturamento Total Realizado</span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-2xl font-black text-zinc-900 dark:text-white">
              R$ 4.850,00
            </span>
            <p className="text-[11px] text-zinc-400 mt-1">
              Inclui pagamentos no local + sinais Pix
            </p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400">Chave Pix Cadastrada</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-sm font-bold text-zinc-900 dark:text-white font-mono truncate block">
              contato@barbeariaimperial.com.br
            </span>
            <p className="text-[11px] text-zinc-400 mt-1">
              Recebimento direto e instantâneo
            </p>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200/80 dark:border-zinc-800 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-zinc-100 dark:border-zinc-800">
          <h2 className="text-base font-bold text-zinc-900 dark:text-white">
            Histórico Recente de Pagamentos
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Todos os sinais e liquidações processados via Pix
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-50/70 dark:bg-zinc-950/40 text-[11px] font-bold uppercase tracking-wider text-zinc-400 border-b border-zinc-100 dark:border-zinc-800">
              <tr>
                <th className="py-3 px-5">Data/Hora</th>
                <th className="py-3 px-5">Cliente</th>
                <th className="py-3 px-5">Serviço</th>
                <th className="py-3 px-5">Sinal Pix</th>
                <th className="py-3 px-5">Valor Total</th>
                <th className="py-3 px-5 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {transactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30">
                  <td className="py-3.5 px-5 font-mono text-zinc-500 whitespace-nowrap">
                    {tx.date}
                  </td>
                  <td className="py-3.5 px-5 font-semibold text-zinc-900 dark:text-white whitespace-nowrap">
                    {tx.customer}
                  </td>
                  <td className="py-3.5 px-5 text-zinc-600 dark:text-zinc-300 whitespace-nowrap">
                    {tx.service}
                  </td>
                  <td className="py-3.5 px-5 font-bold text-amber-600 dark:text-amber-400 whitespace-nowrap">
                    R$ {tx.depositAmount.toFixed(2).replace(".", ",")}
                  </td>
                  <td className="py-3.5 px-5 font-semibold text-zinc-900 dark:text-white whitespace-nowrap">
                    R$ {tx.totalAmount.toFixed(2).replace(".", ",")}
                  </td>
                  <td className="py-3.5 px-5 text-right whitespace-nowrap">
                    {tx.status === "approved" ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full">
                        <CheckCircle2 className="w-3 h-3 fill-emerald-500 text-white" />
                        Creditado
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/60 px-2 py-0.5 rounded-full">
                        <Clock className="w-3 h-3" />
                        Pendente
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
