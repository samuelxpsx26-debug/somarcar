"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  CalendarDays,
  DollarSign,
  ShieldCheck,
  TrendingUp,
  Clock,
  Phone,
  MessageCircle,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  ExternalLink,
  Plus,
  Filter,
  User,
  ArrowUpRight,
  Database,
  Loader2,
} from "lucide-react";

interface Appointment {
  id: string;
  customerName: string;
  customerPhone: string;
  serviceName: string;
  durationLabel: string;
  time: string;
  totalPrice: number;
  depositPaid: boolean;
  depositAmount: number;
  status: "confirmed" | "pending_pix" | "completed" | "cancelled";
}

interface DashboardMetrics {
  totalToday: number;
  confirmedToday: number;
  pendingPixToday: number;
  totalPixGuaranteed: number;
  monthlyTotal: number;
  attendanceRate: string;
}

export default function AdminDashboardPage() {
  const [copiedLink, setCopiedLink] = useState(false);
  const [filter, setFilter] = useState<"all" | "confirmed" | "pending_pix">("all");
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalToday: 0,
    confirmedToday: 0,
    pendingPixToday: 0,
    totalPixGuaranteed: 0,
    monthlyTotal: 4850.0,
    attendanceRate: "98.2%",
  });
  const [loading, setLoading] = useState(true);

  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/dashboard?slug=barbearia-imperial");
      if (res.ok) {
        const data = await res.json();
        setAppointments(data.appointments || []);
        if (data.metrics) {
          setMetrics(data.metrics);
        }
      }
    } catch (err) {
      console.error("Erro ao buscar dados do dashboard:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const bioLink = "http://localhost:3000/barbearia-imperial";

  const handleCopyLink = () => {
    navigator.clipboard?.writeText(bioLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleConfirmPix = (id: string) => {
    setAppointments((prev) =>
      prev.map((apt) =>
        apt.id === id
          ? { ...apt, status: "confirmed", depositPaid: true }
          : apt
      )
    );
  };

  const handleCancelApt = (id: string) => {
    setAppointments((prev) =>
      prev.map((apt) =>
        apt.id === id ? { ...apt, status: "cancelled" } : apt
      )
    );
  };

  const filteredAppointments = appointments.filter((apt) => {
    if (filter === "confirmed") return apt.status === "confirmed";
    if (filter === "pending_pix") return apt.status === "pending_pix";
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner / Welcome & Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight">
              Agenda do Dia
            </h1>
            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
              <Database className="w-3 h-3" />
              SQLite Conectado
            </span>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Agendamentos reais e sinais Pix sincronizados diretamente pelo banco de dados
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopyLink}
            className="inline-flex items-center gap-2 py-2 px-3.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-200 text-xs font-semibold hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors cursor-pointer shadow-xs"
          >
            {copiedLink ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-500" />
                <span>Link Copiado!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-zinc-400" />
                <span>Copiar Link da Bio</span>
              </>
            )}
          </button>

          <Link
            href="/admin/services"
            className="inline-flex items-center gap-2 py-2 px-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-bold transition-all shadow-sm shadow-amber-500/20 active:scale-95"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Novo Serviço</span>
          </Link>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Agendamentos Hoje */}
        <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
              Agendamentos
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <CalendarDays className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-zinc-900 dark:text-white">
                {metrics.totalToday}
              </span>
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center">
                <ArrowUpRight className="w-3 h-3" />
                {metrics.confirmedToday} confirmados
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 mt-1">
              {metrics.pendingPixToday} aguardando pagamento Pix
            </p>
          </div>
        </div>

        {/* Card 2: Faturamento do Mês */}
        <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
              Faturamento do Mês
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-zinc-900 dark:text-white">
                R$ {metrics.monthlyTotal.toFixed(2).replace(".", ",")}
              </span>
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center">
                <ArrowUpRight className="w-3 h-3" />
                +18.4%
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 mt-1">
              Meta mensal: R$ 6.000,00
            </p>
          </div>
        </div>

        {/* Card 3: Sinais Pix Garantidos */}
        <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
              Sinais Pix no Banco
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-zinc-900 dark:text-white">
                R$ {metrics.totalPixGuaranteed.toFixed(2).replace(".", ",")}
              </span>
              <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
                100% no seu Pix
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 mt-1">
              Retenção financeira contra faltas (No-Show)
            </p>
          </div>
        </div>

        {/* Card 4: Taxa de Comparecimento */}
        <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
              Taxa de Comparecimento
            </span>
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-zinc-900 dark:text-white">
                {metrics.attendanceRate}
              </span>
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                Anti-No-Show
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 mt-1">
              Redução recorde de desistências
            </p>
          </div>
        </div>
      </div>

      {/* Appointments List / Table Card */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200/80 dark:border-zinc-800 shadow-sm overflow-hidden">
        {/* Table Filter Header */}
        <div className="p-5 border-b border-zinc-100 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              <span>Agendamentos Registrados</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
                {filteredAppointments.length}
              </span>
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              Dados extraídos diretamente da tabela Appointment do SQLite
            </p>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-1.5 bg-zinc-100 dark:bg-zinc-800/80 p-1 rounded-xl text-xs font-semibold self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setFilter("all")}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                filter === "all"
                  ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-xs"
                  : "text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
              }`}
            >
              Todos ({appointments.length})
            </button>
            <button
              type="button"
              onClick={() => setFilter("confirmed")}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                filter === "confirmed"
                  ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-xs"
                  : "text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
              }`}
            >
              Confirmados ({appointments.filter((a) => a.status === "confirmed").length})
            </button>
            <button
              type="button"
              onClick={() => setFilter("pending_pix")}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                filter === "pending_pix"
                  ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-xs"
                  : "text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
              }`}
            >
              Aguardando Pix ({appointments.filter((a) => a.status === "pending_pix").length})
            </button>
          </div>
        </div>

        {/* The Table */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center space-y-3">
              <Loader2 className="w-7 h-7 text-amber-500 animate-spin" />
              <p className="text-xs text-zinc-400">Consultando agendamentos no banco...</p>
            </div>
          ) : filteredAppointments.length === 0 ? (
            <div className="py-12 text-center text-zinc-400 text-xs">
              Nenhum agendamento encontrado no banco com o filtro selecionado.
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-50/70 dark:bg-zinc-950/40 text-[11px] font-bold uppercase tracking-wider text-zinc-400 border-b border-zinc-100 dark:border-zinc-800">
                <tr>
                  <th className="py-3 px-5">Horário</th>
                  <th className="py-3 px-5">Cliente</th>
                  <th className="py-3 px-5">Serviço</th>
                  <th className="py-3 px-5">Valores</th>
                  <th className="py-3 px-5">Status do Sinal</th>
                  <th className="py-3 px-5 text-right">Ações Rápidas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {filteredAppointments.map((apt) => {
                  const whatsappClean = apt.customerPhone.replace(/\D/g, "");
                  const waMessage = encodeURIComponent(
                    `Olá ${apt.customerName}! Confirmando seu horário às ${apt.time} aqui no Studio Barbearia Imperial.`
                  );

                  return (
                    <tr
                      key={apt.id}
                      className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 transition-colors"
                    >
                      {/* Time */}
                      <td className="py-4 px-5 font-bold text-sm text-zinc-900 dark:text-zinc-100 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-amber-500" />
                          <span>{apt.time}</span>
                        </div>
                      </td>

                      {/* Customer Info */}
                      <td className="py-4 px-5 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center font-bold text-zinc-700 dark:text-zinc-300 shrink-0">
                            {apt.customerName.charAt(0)}
                          </div>
                          <div>
                            <p className="font-semibold text-zinc-900 dark:text-zinc-100 text-xs">
                              {apt.customerName}
                            </p>
                            <a
                              href={`https://wa.me/55${whatsappClean}?text=${waMessage}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[11px] text-zinc-400 hover:text-emerald-600 dark:hover:text-emerald-400 flex items-center gap-1 transition-colors"
                            >
                              <Phone className="w-3 h-3" />
                              <span>{apt.customerPhone}</span>
                            </a>
                          </div>
                        </div>
                      </td>

                      {/* Service */}
                      <td className="py-4 px-5 whitespace-nowrap">
                        <p className="font-medium text-zinc-800 dark:text-zinc-200">
                          {apt.serviceName}
                        </p>
                        <p className="text-[11px] text-zinc-400">
                          {apt.durationLabel}
                        </p>
                      </td>

                      {/* Values */}
                      <td className="py-4 px-5 whitespace-nowrap">
                        <p className="font-bold text-zinc-900 dark:text-white">
                          R$ {apt.totalPrice.toFixed(2).replace(".", ",")}
                        </p>
                        <p className="text-[10px] text-zinc-400">
                          Sinal: R$ {apt.depositAmount.toFixed(2).replace(".", ",")}
                        </p>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-5 whitespace-nowrap">
                        {apt.status === "confirmed" ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                            <CheckCircle2 className="w-3.5 h-3.5 fill-emerald-500 text-white" />
                            <span>Sinal R$ 30 Pago</span>
                          </span>
                        ) : apt.status === "pending_pix" ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                            <AlertCircle className="w-3.5 h-3.5" />
                            <span>Aguardando Pix</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                            Cancelado
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <a
                            href={`https://wa.me/55${whatsappClean}?text=${waMessage}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Enviar mensagem no WhatsApp"
                            className="p-1.5 rounded-lg text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors"
                          >
                            <MessageCircle className="w-4 h-4" />
                          </a>

                          {apt.status === "pending_pix" && (
                            <button
                              type="button"
                              onClick={() => handleConfirmPix(apt.id)}
                              title="Confirmar pagamento manualmente"
                              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-[11px] transition-colors cursor-pointer"
                            >
                              Aprovar Pix
                            </button>
                          )}

                          {apt.status !== "cancelled" && (
                            <button
                              type="button"
                              onClick={() => handleCancelApt(apt.id)}
                              title="Cancelar agendamento"
                              className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                            >
                              ✕
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
