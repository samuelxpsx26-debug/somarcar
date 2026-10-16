"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import QRCode from "qrcode";
import {
  Link as LinkIcon,
  Copy,
  Check,
  ExternalLink,
  ShieldCheck,
  QrCode as QrCodeIcon,
  Store,
  CreditCard,
  Save,
  CheckCircle2,
  Database,
  Loader2,
  Eye,
  EyeOff,
  Zap,
  Unlink,
  CheckCircle,
  HelpCircle,
} from "lucide-react";

export default function AdminSettingsPage() {
  // Business Profile State
  const [businessName, setBusinessName] = useState("Barbearia Imperial");
  const [slug, setSlug] = useState("barbearia-imperial");
  const [email, setEmail] = useState("contato@barbeariaimperial.com.br");
  const [address, setAddress] = useState("Av. Paulista, 1000 - Jardins, São Paulo");
  const [phone, setPhone] = useState("(11) 98765-4321");

  // Gateway & Financial Integration State
  const [gatewayProvider, setGatewayProvider] = useState<"mercadopago" | "asaas">("mercadopago");
  const [gatewayAccessToken, setGatewayAccessToken] = useState("");
  const [gatewayUserId, setGatewayUserId] = useState("");
  const [gatewayPublicKey, setGatewayPublicKey] = useState("");
  const [showToken, setShowToken] = useState(false);
  const [connectingOAuth, setConnectingOAuth] = useState(false);

  // Deposit Rules
  const [depositAmount, setDepositAmount] = useState("30.00");
  const [requireDeposit, setRequireDeposit] = useState(true);

  // UI State
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedWebhook, setCopiedWebhook] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>("");

  const publicUrl = `http://localhost:3000/${slug}`;
  const webhookUrl = `http://localhost:3000/api/webhooks/pix`;

  const isGatewayConnected = Boolean(gatewayAccessToken && gatewayAccessToken.trim().length > 10);

  // Load from SQLite via Prisma API
  const loadSettings = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/settings?slug=barbearia-imperial");
      if (res.ok) {
        const data = await res.json();
        if (data.tenant) {
          setBusinessName(data.tenant.name || "Barbearia Imperial");
          setSlug(data.tenant.slug || "barbearia-imperial");
          setEmail(data.tenant.email || "contato@barbeariaimperial.com.br");
          setGatewayProvider(data.tenant.gatewayProvider || "mercadopago");
          setGatewayAccessToken(data.tenant.gatewayAccessToken || "");
          setGatewayUserId(data.tenant.gatewayUserId || "");
          setGatewayPublicKey(data.tenant.gatewayPublicKey || "");
        }
      }
    } catch (err) {
      console.error("Erro ao buscar configurações do banco:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  // Generate QR Code for Bio / Counter
  useEffect(() => {
    QRCode.toDataURL(publicUrl, {
      width: 240,
      margin: 1.5,
      color: {
        dark: "#18181b",
        light: "#ffffff",
      },
    })
      .then((url) => setQrCodeDataUrl(url))
      .catch((err) => console.error(err));
  }, [publicUrl]);

  const handleCopyLink = () => {
    navigator.clipboard?.writeText(publicUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleCopyWebhook = () => {
    navigator.clipboard?.writeText(webhookUrl);
    setCopiedWebhook(true);
    setTimeout(() => setCopiedWebhook(false), 2500);
  };

  // 1-Click Connect Mercado Pago Simulation (OAuth flow)
  const handleConnectMercadoPago = () => {
    setConnectingOAuth(true);
    setTimeout(() => {
      // Simulate successful OAuth callback with realistic merchant credentials
      const randomMerchantId = Math.floor(100000 + Math.random() * 900000);
      setGatewayProvider("mercadopago");
      setGatewayAccessToken(`APP_USR-78219401823901-101521-b3f4e2d1c0a987654321-${randomMerchantId}`);
      setGatewayUserId(`MP-MERCHANT-${randomMerchantId}`);
      setGatewayPublicKey(`APP_USR-92847102-4b2a-4c91-9e81-${randomMerchantId}`);
      setConnectingOAuth(false);
    }, 1200);
  };

  const handleDisconnectGateway = () => {
    setGatewayAccessToken("");
    setGatewayUserId("");
    setGatewayPublicKey("");
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentSlug: "barbearia-imperial",
          name: businessName,
          slug,
          email,
          gatewayProvider,
          gatewayAccessToken,
          gatewayUserId,
          gatewayPublicKey,
          pixKey: email,
        }),
      });

      if (res.ok) {
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 3500);
      }
    } catch (err) {
      console.error("Erro ao salvar no banco:", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight">
              Integração Financeira & Ajustes
            </h1>
            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
              <Database className="w-3 h-3" />
              SQLite Multi-Tenant
            </span>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Conecte sua conta bancária de recebimento e configure o Link na Bio do seu estabelecimento
          </p>
        </div>

        {savedSuccess && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 text-xs font-semibold animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 fill-emerald-500 text-white" />
            <span>Configurações salvas no banco de dados!</span>
          </div>
        )}
      </div>

      {/* Hero Section: Link na Bio & Balcão QR Code */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/30 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-3 flex-1 text-center md:text-left">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full bg-amber-500 text-white shadow-xs">
            <LinkIcon className="w-3.5 h-3.5" />
            <span>SEU LINK NA BIO OFICIAL</span>
          </div>

          <h2 className="text-xl font-black text-zinc-900 dark:text-white">
            Divulgue para seus clientes no WhatsApp e Instagram
          </h2>

          <p className="text-xs text-zinc-600 dark:text-zinc-400 max-w-lg leading-relaxed">
            Seus clientes acessam este link pelo celular, escolhem o serviço e o sinal Pix cai direto na sua conta conectada.
          </p>

          {/* Link Bar */}
          <div className="flex flex-wrap items-center gap-2 pt-1 justify-center md:justify-start">
            <div className="px-3.5 py-2 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs font-mono font-semibold text-zinc-800 dark:text-zinc-200 shadow-xs flex items-center gap-2">
              <span className="text-amber-500">🔗</span>
              <span>{publicUrl}</span>
            </div>

            <button
              type="button"
              onClick={handleCopyLink}
              className="inline-flex items-center gap-1.5 py-2 px-3.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-amber-500 dark:hover:bg-amber-400 dark:text-zinc-950 font-bold text-xs shadow-xs cursor-pointer transition-all active:scale-95"
            >
              {copiedLink ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copiar Link</span>
                </>
              )}
            </button>

            <Link
              href={`/${slug}`}
              target="_blank"
              className="inline-flex items-center gap-1.5 py-2 px-3.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-200 font-semibold text-xs hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors shadow-xs"
            >
              <span>Ver Página</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Counter QR Code Box */}
        <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 text-center shadow-md shrink-0">
          <div className="bg-white p-2 rounded-xl border border-zinc-100 shadow-xs inline-block">
            {qrCodeDataUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={qrCodeDataUrl}
                alt="QR Code do Link"
                className="w-28 h-28 object-contain rounded"
              />
            ) : (
              <div className="w-28 h-28 flex items-center justify-center bg-zinc-100">
                <QrCodeIcon className="w-8 h-8 text-zinc-400" />
              </div>
            )}
          </div>
          <p className="text-[10px] font-bold text-zinc-600 dark:text-zinc-300 mt-2">
            QR Code de Balcão
          </p>
          <p className="text-[9px] text-zinc-400">Imprima para o cliente escanear</p>
        </div>
      </div>

      {loading ? (
        <div className="py-16 flex flex-col items-center justify-center space-y-3">
          <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
          <p className="text-xs text-zinc-400">Carregando configurações do SQLite...</p>
        </div>
      ) : (
        <form onSubmit={handleSave} className="space-y-6">
          {/* Section 1: Financial Integration (Automação Total / Gateway Próprio) */}
          <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-zinc-100 dark:border-zinc-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-bold text-base text-zinc-900 dark:text-white flex items-center gap-2">
                    <span>Integração Financeira (Conta do Profissional)</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300">
                      Caminho 2: Automação Total
                    </span>
                  </h2>
                  <p className="text-xs text-zinc-400">
                    O valor do sinal Pix cai 100% diretamente na sua conta do Mercado Pago, sem intermediários.
                  </p>
                </div>
              </div>

              {/* Live Connection Badge */}
              {isGatewayConnected ? (
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 text-xs font-bold border border-emerald-300 dark:border-emerald-800/60 self-start sm:self-auto">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Conta Conectada & Ativa</span>
                </div>
              ) : (
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 text-xs font-bold border border-amber-300 dark:border-amber-800/60 self-start sm:self-auto">
                  <Zap className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  <span>Aguardando Conexão</span>
                </div>
              )}
            </div>

            {/* Quick 1-Click Connect Button */}
            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/70 dark:border-zinc-700/60 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="space-y-1 text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-2">
                  <span className="font-bold text-sm text-zinc-900 dark:text-white">
                    Conectar com o Mercado Pago
                  </span>
                  <span className="text-[10px] uppercase font-extrabold tracking-wider bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300 px-2 py-0.5 rounded">
                    Recomendado
                  </span>
                </div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-md">
                  Autorize nossa plataforma a gerar cobranças Pix dinâmicas no seu nome. O cliente paga e você recebe na mesma hora.
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {!isGatewayConnected ? (
                  <button
                    type="button"
                    onClick={handleConnectMercadoPago}
                    disabled={connectingOAuth}
                    className="inline-flex items-center gap-2 py-2.5 px-5 rounded-xl bg-[#009ee3] hover:bg-[#0086c2] text-white font-bold text-xs shadow-md shadow-[#009ee3]/20 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {connectingOAuth ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Autorizando Conta...</span>
                      </>
                    ) : (
                      <>
                        <Zap className="w-4 h-4 fill-white" />
                        <span>Conectar Conta Mercado Pago</span>
                      </>
                    )}
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <div className="text-right hidden sm:block">
                      <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 block">
                        Conectado com Sucesso
                      </span>
                      <span className="text-[10px] font-mono text-zinc-400 block">
                        ID: {gatewayUserId || "MP-MERCHANT-772910"}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={handleDisconnectGateway}
                      className="inline-flex items-center gap-1.5 py-2 px-3.5 rounded-xl border border-rose-300 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 font-semibold text-xs hover:bg-rose-100 dark:hover:bg-rose-900/60 transition-colors cursor-pointer"
                    >
                      <Unlink className="w-3.5 h-3.5" />
                      <span>Desconectar</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Manual Credentials Configuration */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                  Credenciais Individuais do Gateway (Tabela Tenant)
                </span>
                <span className="text-[11px] text-zinc-400 flex items-center gap-1">
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>Obtido em Mercado Pago &gt; Credenciais de Produção/Teste</span>
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Gateway Provider */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1.5">
                    Provedor de Pagamento *
                  </label>
                  <select
                    value={gatewayProvider}
                    onChange={(e) =>
                      setGatewayProvider(e.target.value as "mercadopago" | "asaas")
                    }
                    className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
                  >
                    <option value="mercadopago">Mercado Pago (Pix Instantâneo)</option>
                    <option value="asaas">Asaas (Gateway Alternativo)</option>
                  </select>
                </div>

                {/* Personal Access Token */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1.5">
                    Access Token Pessoal do Lojista (gatewayAccessToken) *
                  </label>
                  <div className="relative">
                    <input
                      type={showToken ? "text" : "password"}
                      value={gatewayAccessToken}
                      onChange={(e) => setGatewayAccessToken(e.target.value)}
                      placeholder="APP_USR-78219401823901-101521-b3f4e2d1c0a987654321..."
                      className="w-full pl-3.5 pr-10 py-2.5 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowToken(!showToken)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer"
                    >
                      {showToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Account / User ID */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1.5">
                    ID da Conta / User ID (Opcional)
                  </label>
                  <input
                    type="text"
                    value={gatewayUserId}
                    onChange={(e) => setGatewayUserId(e.target.value)}
                    placeholder="MP-MERCHANT-772910"
                    className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono"
                  />
                </div>

                {/* Public Key */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1.5">
                    Public Key do Lojista (Opcional)
                  </label>
                  <input
                    type="text"
                    value={gatewayPublicKey}
                    onChange={(e) => setGatewayPublicKey(e.target.value)}
                    placeholder="APP_USR-92847102-4b2a..."
                    className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono"
                  />
                </div>

                {/* Deposit Value */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1.5">
                    Valor do Sinal Pix (R$) *
                  </label>
                  <input
                    type="number"
                    step="5.00"
                    required
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    placeholder="30.00"
                    className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 font-bold"
                  />
                </div>

                {/* Anti-No-Show Toggle */}
                <div className="sm:col-span-2 lg:col-span-3 flex items-center gap-3 pt-2">
                  <input
                    type="checkbox"
                    id="requireDepositCheck"
                    checked={requireDeposit}
                    onChange={(e) => setRequireDeposit(e.target.checked)}
                    className="w-4 h-4 text-amber-500 rounded border-zinc-300 focus:ring-amber-500 cursor-pointer"
                  />
                  <label
                    htmlFor="requireDepositCheck"
                    className="text-xs text-zinc-700 dark:text-zinc-300 font-medium cursor-pointer"
                  >
                    Exigir pagamento antecipado do sinal de <strong>R$ {depositAmount}</strong> para travar a vaga na agenda (Anti-No-Show)
                  </label>
                </div>
              </div>
            </div>

            {/* Platform Webhook Listener Info */}
            <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-amber-500" />
                  <span>URL do Webhook da Plataforma (Baixa Automática)</span>
                </span>
                <button
                  type="button"
                  onClick={handleCopyWebhook}
                  className="text-[11px] font-semibold text-zinc-600 dark:text-zinc-300 hover:text-amber-600 flex items-center gap-1 cursor-pointer"
                >
                  {copiedWebhook ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-500" />
                      <span className="text-emerald-600">URL Copiada!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copiar URL</span>
                    </>
                  )}
                </button>
              </div>

              <div className="p-2.5 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs font-mono text-zinc-800 dark:text-zinc-200 select-all overflow-x-auto">
                {webhookUrl}
              </div>

              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                Nosso motor de automação escuta as notificações enviadas para este endereço pelo Mercado Pago e confirma o agendamento no seu painel em tempo real.
              </p>
            </div>
          </div>

          {/* Section 2: Business Profile Identity */}
          <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-xs space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-zinc-100 dark:border-zinc-800">
              <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <Store className="w-4 h-4" />
              </div>
              <div>
                <h2 className="font-bold text-sm text-zinc-900 dark:text-white">
                  Identidade do Estabelecimento
                </h2>
                <p className="text-xs text-zinc-400">
                  Informações salvas na tabela Tenant do SQLite
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1.5">
                  Nome do Negócio (Tenant.name) *
                </label>
                <input
                  type="text"
                  required
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="Ex: Barbearia Imperial"
                  className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1.5">
                  Slug Único (Tenant.slug) *
                </label>
                <div className="flex items-center">
                  <span className="px-3 py-2.5 bg-zinc-100 dark:bg-zinc-800 border border-r-0 border-zinc-200 dark:border-zinc-700 rounded-l-xl text-xs text-zinc-400">
                    /
                  </span>
                  <input
                    type="text"
                    required
                    value={slug}
                    onChange={(e) =>
                      setSlug(e.target.value.toLowerCase().replace(/\s+/g, "-"))
                    }
                    placeholder="barbearia-imperial"
                    className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-r-xl text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1.5">
                  E-mail Oficial (Tenant.email) *
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="contato@barbeariaimperial.com.br"
                  className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1.5">
                  WhatsApp de Atendimento *
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="(11) 98765-4321"
                  className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1.5">
                  Endereço Físico de Atendimento
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Av. Paulista, 1000 - Jardins, São Paulo"
                  className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>
          </div>

          {/* Save Bar */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 py-3 px-6 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs shadow-md shadow-amber-500/20 active:scale-95 cursor-pointer transition-all disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Salvando no SQLite...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Salvar Configurações & Credenciais</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
