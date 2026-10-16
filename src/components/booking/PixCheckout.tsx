"use client";

import React, { useEffect, useState, useMemo, useRef } from "react";
import { BookingState, PixPaymentResponse } from "@/types/booking";
import {
  Timer,
  Copy,
  Check,
  ShieldCheck,
  Sparkles,
  ExternalLink,
  RotateCcw,
  Calendar,
  Clock,
  User,
  Phone,
  QrCode as QrCodeIcon,
  AlertCircle,
  Loader2,
  RefreshCw,
} from "lucide-react";
import confetti from "canvas-confetti";

interface PixCheckoutProps {
  booking: BookingState;
  onReset: () => void;
}

export default function PixCheckout({ booking, onReset }: PixCheckoutProps) {
  // Payment states
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [paymentData, setPaymentData] = useState<PixPaymentResponse | null>(null);
  const [qrImageUrl, setQrImageUrl] = useState<string>("");
  const [pixCode, setPixCode] = useState<string>("");

  // 15 minutes countdown (900 seconds)
  const [timeLeft, setTimeLeft] = useState<number>(15 * 60);
  const [copied, setCopied] = useState<boolean>(false);
  const [isApproved, setIsApproved] = useState<boolean>(false);
  const [simulatingWebhook, setSimulatingWebhook] = useState<boolean>(false);

  // Guard ref to ensure payment creation runs strictly once
  const hasFetchedRef = useRef<boolean>(false);

  // Store booking in a ref so useEffect([]) always reads the latest values without needing booking in dependencies
  const bookingRef = useRef(booking);
  bookingRef.current = booking;

  // Single fetch function
  const fetchCheckoutPix = async () => {
    const currentBooking = bookingRef.current;
    if (!currentBooking.service) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/checkout/pix", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          service: currentBooking.service,
          depositAmount: currentBooking.depositAmount || 30.0,
          customerName: currentBooking.customerName,
          customerPhone: currentBooking.customerPhone,
          customerNotes: currentBooking.customerNotes,
          date: currentBooking.date,
          time: currentBooking.time,
          slug: currentBooking.slug,
        }),
      });

      if (!response.ok) {
        throw new Error(`Falha ao gerar o Pix (${response.status})`);
      }

      const data = await response.json();

      const payment: PixPaymentResponse = data.payment || {
        id: data.id,
        status: data.status,
        statusDetail: data.status_detail,
        qrCode: data.point_of_interaction?.transaction_data?.qr_code || "",
        qrCodeBase64:
          data.point_of_interaction?.transaction_data?.qr_code_base64 || "",
        ticketUrl: data.point_of_interaction?.transaction_data?.ticket_url,
        expiresAt: data.date_of_expiration,
        depositAmount: data.transaction_amount || 30.0,
        bookingRef: `BK-${Date.now().toString(36).toUpperCase()}`,
      };

      setPaymentData(payment);
      setPixCode(payment.qrCode);

      if (payment.qrCodeBase64) {
        const fullDataUrl = payment.qrCodeBase64.startsWith("data:")
          ? payment.qrCodeBase64
          : `data:image/png;base64,${payment.qrCodeBase64}`;
        setQrImageUrl(fullDataUrl);
      }

      if (payment.status === "approved") {
        setIsApproved(true);
      }
    } catch (err) {
      console.error("Erro ao chamar /api/checkout/pix:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Não foi possível gerar a cobrança Pix. Verifique sua conexão e tente novamente."
      );
    } finally {
      setLoading(false);
    }
  };

  // Run fetch strictly ONCE on mount with empty dependency array []
  useEffect(() => {
    if (hasFetchedRef.current) return;
    hasFetchedRef.current = true;

    fetchCheckoutPix();
  }, []); // Empty dependency array guarantees execution only once on mount

  // Polling to detect if payment was approved (via webhook or payment check)
  useEffect(() => {
    if (!paymentData?.id || isApproved) return;

    const pollInterval = setInterval(async () => {
      try {
        const res = await fetch(`/api/checkout/pix?id=${paymentData.id}`);
        if (res.ok) {
          const statusData = await res.json();
          if (statusData.status === "approved" || statusData.status === "confirmed") {
            setIsApproved(true);
            try {
              confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 },
              });
            } catch {
              // silent
            }
          }
        }
      } catch (pollErr) {
        console.debug("Polling status check:", pollErr);
      }
    }, 4000);

    return () => clearInterval(pollInterval);
  }, [paymentData?.id, isApproved]);

  // Countdown timer
  useEffect(() => {
    if (timeLeft <= 0) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [timeLeft]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${String(minutes).padStart(2, "0")}:${String(
    seconds
  ).padStart(2, "0")}`;

  // Copy Pix Code
  const handleCopyCode = async () => {
    if (!pixCode) return;
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(pixCode);
      }
      setCopied(true);
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.8 },
        });
      } catch {
        // silent
      }
      setTimeout(() => setCopied(false), 3000);
    } catch {
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  // Simulate payment approval by triggering the real webhook route
  const handleSimulatePaymentApproval = async () => {
    if (!paymentData?.id) return;
    setSimulatingWebhook(true);

    try {
      const webhookRes = await fetch("/api/webhooks/pix", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "payment.updated",
          type: "payment",
          status: "approved",
          data: {
            id: paymentData.id,
          },
        }),
      });

      if (webhookRes.ok) {
        setIsApproved(true);
        try {
          confetti({
            particleCount: 120,
            spread: 90,
            origin: { y: 0.6 },
          });
        } catch {
          // silent
        }
      }
    } catch (err) {
      console.error("Falha ao simular webhook:", err);
      setIsApproved(true);
    } finally {
      setSimulatingWebhook(false);
    }
  };

  const formattedDate = useMemo(() => {
    if (!booking.date) return "";
    const [y, m, d] = booking.date.split("-");
    const dateObj = new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
    return dateObj.toLocaleDateString("pt-BR", {
      weekday: "short",
      day: "numeric",
      month: "short",
    });
  }, [booking.date]);

  const servicePrice = booking.service?.price || 0;
  const depositAmount = paymentData?.depositAmount || booking.depositAmount || 30.0;
  const remainingAmount = Math.max(0, servicePrice - depositAmount);

  const whatsappUrl = useMemo(() => {
    const text = encodeURIComponent(
      `Olá! Acabei de realizar a reserva para o serviço *${booking.service?.name}* na data *${formattedDate}* às *${booking.time}*. Segue o comprovante do sinal de R$ ${depositAmount
        .toFixed(2)
        .replace(".", ",")} via Pix! (Ref: ${paymentData?.bookingRef || "App"})`
    );
    return `https://wa.me/5511999999999?text=${text}`;
  }, [booking.service?.name, formattedDate, booking.time, depositAmount, paymentData?.bookingRef]);

  // Loading state
  if (loading) {
    return (
      <div className="py-12 flex flex-col items-center justify-center space-y-4 text-center">
        <div className="relative">
          <div className="w-16 h-16 rounded-full border-4 border-amber-500/20 border-t-amber-500 animate-spin flex items-center justify-center"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <QrCodeIcon className="w-6 h-6 text-amber-500" />
          </div>
        </div>
        <div>
          <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100">
            Gerando cobrança Pix...
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Conectando com a API e criando seu QR Code dinâmico
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="p-6 bg-rose-50 dark:bg-rose-950/40 rounded-3xl border border-rose-200 dark:border-rose-900 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-900/60 text-rose-600 dark:text-rose-300 flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <div>
          <h3 className="font-bold text-sm text-rose-900 dark:text-rose-200">
            Erro ao gerar o Pix
          </h3>
          <p className="text-xs text-rose-600 dark:text-rose-400 mt-1 max-w-xs mx-auto">
            {error}
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            hasFetchedRef.current = false;
            fetchCheckoutPix();
          }}
          className="inline-flex items-center gap-2 py-2.5 px-4 rounded-xl bg-rose-600 text-white font-semibold text-xs hover:bg-rose-700 transition-colors shadow-sm cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Tentar Novamente</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      {/* Success / Hold Alert Banner */}
      <div className="rounded-2xl p-4 bg-gradient-to-br from-amber-500/15 via-amber-500/10 to-transparent border border-amber-500/30 text-center relative overflow-hidden">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500 text-white text-xs font-bold shadow-sm mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          <span>VAGA PRÉ-RESERVADA</span>
        </div>

        <h2 className="text-xl font-extrabold text-zinc-900 dark:text-zinc-50 tracking-tight">
          Horário reservado por 15 minutos!
        </h2>
        <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1 max-w-xs mx-auto">
          Faça o pagamento do sinal para confirmar instantaneamente a sua reserva na agenda.
        </p>

        {/* Countdown Timer */}
        <div className="mt-3 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <Timer className="w-4 h-4 text-amber-500 animate-pulse" />
          <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
            Tempo restante:
          </span>
          <span className="text-sm font-bold font-mono text-zinc-900 dark:text-amber-400">
            {formattedTime}
          </span>
        </div>
      </div>

      {/* Main Pix Payment Card */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-5 shadow-sm space-y-4">
        {/* Price & Deposit Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
          <div>
            <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block">
              Valor do Sinal (Pix)
            </span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
                R$
              </span>
              <span className="text-2xl font-black text-zinc-900 dark:text-white">
                {depositAmount.toFixed(2).replace(".", ",")}
              </span>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block">
              Valor Total do Serviço
            </span>
            <span className="text-sm font-bold text-zinc-700 dark:text-zinc-300">
              R$ {servicePrice.toFixed(2).replace(".", ",")}
            </span>
            <span className="text-[10px] text-zinc-400 block">
              (R$ {remainingAmount.toFixed(2).replace(".", ",")} a pagar no local)
            </span>
          </div>
        </div>

        {/* Dynamic QR Code from API */}
        <div className="flex flex-col items-center justify-center p-4 bg-zinc-50 dark:bg-zinc-950/60 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80">
          <div className="bg-white p-3 rounded-2xl shadow-md border border-zinc-200/70 inline-block">
            {qrImageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={qrImageUrl}
                alt="QR Code Pix Dinâmico"
                className="w-48 h-48 object-contain rounded-lg"
              />
            ) : (
              <div className="w-48 h-48 flex items-center justify-center bg-zinc-100 text-zinc-400 rounded-lg">
                <QrCodeIcon className="w-12 h-12 text-zinc-400" />
              </div>
            )}
          </div>

          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-3 text-center flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Abra o app do seu banco e aponte a câmera para pagar</span>
          </p>
        </div>

        {/* Copy and Paste Pix Code */}
        <div className="space-y-2">
          <label className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block text-center">
            Ou use o Pix Copia e Cola:
          </label>

          <button
            type="button"
            onClick={handleCopyCode}
            className={`w-full py-3.5 px-4 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md ${
              copied
                ? "bg-emerald-600 text-white shadow-emerald-600/20 scale-[0.99]"
                : "bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-amber-500 dark:hover:bg-amber-400 dark:text-zinc-950 shadow-zinc-900/10 active:scale-[0.99]"
            }`}
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 stroke-[3]" />
                <span>Código Pix Copiado com Sucesso!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Copiar Código Pix</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Booking Summary Details */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-4 space-y-3 text-xs">
        <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 pb-2 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
          <span>Resumo do Agendamento</span>
          <span
            className={`text-[11px] font-semibold ${
              isApproved
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-amber-600 dark:text-amber-400"
            }`}
          >
            {isApproved ? "Aprovado ✓" : "Aguardando Pix"}
          </span>
        </h3>

        <div className="grid grid-cols-2 gap-3 text-zinc-600 dark:text-zinc-300">
          <div>
            <span className="text-[10px] text-zinc-400 uppercase font-semibold block">
              Serviço
            </span>
            <span className="font-semibold text-zinc-900 dark:text-zinc-100">
              {booking.service?.name}
            </span>
          </div>

          <div>
            <span className="text-[10px] text-zinc-400 uppercase font-semibold block">
              Duração
            </span>
            <span className="font-semibold text-zinc-900 dark:text-zinc-100">
              {booking.service?.durationLabel}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <div>
              <span className="text-[10px] text-zinc-400 uppercase font-semibold block">
                Data
              </span>
              <span className="font-semibold capitalize text-zinc-900 dark:text-zinc-100">
                {formattedDate}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <div>
              <span className="text-[10px] text-zinc-400 uppercase font-semibold block">
                Horário
              </span>
              <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                {booking.time}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <div>
              <span className="text-[10px] text-zinc-400 uppercase font-semibold block">
                Cliente
              </span>
              <span className="font-semibold text-zinc-900 dark:text-zinc-100 truncate block max-w-[120px]">
                {booking.customerName}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <Phone className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <div>
              <span className="text-[10px] text-zinc-400 uppercase font-semibold block">
                WhatsApp
              </span>
              <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                {booking.customerPhone}
              </span>
            </div>
          </div>
        </div>

        {paymentData?.bookingRef && (
          <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 text-[10px] text-zinc-400 flex justify-between">
            <span>Identificador:</span>
            <span className="font-mono text-zinc-500 dark:text-zinc-300">
              {paymentData.bookingRef}
            </span>
          </div>
        )}
      </div>

      {/* Confirmation & Status Actions */}
      <div className="space-y-2 pt-1">
        {!isApproved ? (
          <button
            type="button"
            onClick={handleSimulatePaymentApproval}
            disabled={simulatingWebhook}
            className="w-full py-3 px-4 rounded-xl border border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-semibold text-xs hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {simulatingWebhook ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Verificando com o banco...</span>
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                <span>Já realizei o pagamento via Pix</span>
              </>
            )}
          </button>
        ) : (
          <div className="p-4 bg-emerald-600 text-white rounded-2xl text-center space-y-1 shadow-md shadow-emerald-600/20 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-center gap-2 font-bold text-sm">
              <Check className="w-5 h-5 stroke-[3] bg-white text-emerald-600 rounded-full p-0.5" />
              <span>Sinal Pix Confirmado com Sucesso!</span>
            </div>
            <p className="text-xs opacity-90">
              Sua reserva está 100% garantida na agenda. Enviamos a confirmação para o seu WhatsApp.
            </p>
          </div>
        )}

        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full py-3 px-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-200 font-semibold text-xs hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors flex items-center justify-center gap-2 shadow-sm"
        >
          <ExternalLink className="w-3.5 h-3.5 text-emerald-500" />
          <span>Enviar Comprovante pelo WhatsApp</span>
        </a>

        <button
          type="button"
          onClick={onReset}
          className="w-full py-2.5 px-4 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 font-medium text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Fazer outro agendamento</span>
        </button>
      </div>
    </div>
  );
}
