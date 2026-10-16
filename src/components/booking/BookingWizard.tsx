"use client";

import React, { useState } from "react";
import {
  BookingStep,
  BookingState,
  Service,
} from "@/types/booking";
import { MOCK_SERVICES, MOCK_PROFILE } from "@/data/mockData";
import ServiceList from "@/components/booking/ServiceList";
import DateTimePicker from "@/components/booking/DateTimePicker";
import CustomerForm from "@/components/booking/CustomerForm";
import PixCheckout from "@/components/booking/PixCheckout";
import {
  Star,
  MapPin,
  CheckCircle2,
  Scissors,
  CalendarDays,
  UserCheck,
  CreditCard,
  Database,
} from "lucide-react";

export interface TenantData {
  id: string;
  name: string;
  slug: string;
  email: string;
  pixKey?: string | null;
  tagline?: string;
  avatarUrl?: string;
  address?: string;
}

interface BookingWizardProps {
  slug: string;
  initialTenant?: TenantData | null;
  initialServices?: Service[];
}

export default function BookingWizard({
  slug,
  initialTenant,
  initialServices = [],
}: BookingWizardProps) {
  // Use database tenant name or fallback to formatted slug
  const businessName =
    initialTenant?.name ||
    (slug === "barbearia-imperial"
      ? MOCK_PROFILE.name
      : slug
          .split("-")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" "));

  // Use real services from SQLite or fallback to defaults
  const servicesList =
    initialServices && initialServices.length > 0
      ? initialServices
      : MOCK_SERVICES;

  // Wizard state
  const [step, setStep] = useState<BookingStep>(1);
  const [booking, setBooking] = useState<BookingState>({
    service: null,
    date: "",
    time: "",
    customerName: "",
    customerPhone: "",
    customerNotes: "",
    depositAmount: 30.0,
    slug,
  });

  // Step 1 handlers
  const handleSelectService = (service: Service) => {
    setBooking((prev) => ({ ...prev, service }));
  };

  const handleContinueFromService = () => {
    if (booking.service) {
      setStep(2);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Step 2 handlers
  const handleSelectDate = (date: string) => {
    setBooking((prev) => ({ ...prev, date }));
  };

  const handleSelectTime = (time: string) => {
    setBooking((prev) => ({ ...prev, time }));
  };

  const handleContinueFromDateTime = () => {
    if (booking.date && booking.time) {
      setStep(3);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Step 3 handlers
  const handleUpdateCustomer = (data: {
    customerName: string;
    customerPhone: string;
    customerNotes?: string;
  }) => {
    setBooking((prev) => ({
      ...prev,
      customerName: data.customerName,
      customerPhone: data.customerPhone,
      customerNotes: data.customerNotes,
    }));
  };

  const handleContinueFromCustomer = () => {
    if (booking.customerName.trim() && booking.customerPhone.trim()) {
      setStep(4);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Reset to step 1
  const handleReset = () => {
    setBooking({
      service: null,
      date: "",
      time: "",
      customerName: "",
      customerPhone: "",
      customerNotes: "",
      depositAmount: 30.0,
    });
    setStep(1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const stepsHeader = [
    { num: 1, label: "Serviço", icon: Scissors },
    { num: 2, label: "Horário", icon: CalendarDays },
    { num: 3, label: "Dados", icon: UserCheck },
    { num: 4, label: "Sinal Pix", icon: CreditCard },
  ];

  const hasDbConnection = !!initialTenant;

  return (
    <main className="min-h-screen bg-zinc-100 dark:bg-zinc-950 py-0 sm:py-6 sm:px-4 flex justify-center">
      {/* Mobile-First link-in-bio container */}
      <div className="w-full max-w-md bg-white dark:bg-zinc-900 sm:rounded-3xl shadow-xl overflow-hidden flex flex-col min-h-screen sm:min-h-[840px] border-x sm:border border-zinc-200/80 dark:border-zinc-800">
        
        {/* Cover Banner */}
        <div className="relative h-28 bg-gradient-to-r from-amber-600 via-amber-700 to-zinc-900 p-4 flex items-end justify-between">
          <div className="absolute top-3 right-3 flex items-center gap-1.5">
            {hasDbConnection && (
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 backdrop-blur-md">
                <Database className="w-2.5 h-2.5" />
                <span>SQLite Conectado</span>
              </span>
            )}
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-black/40 text-white backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Aberto
            </span>
          </div>
        </div>

        {/* Profile Info Header */}
        <div className="px-5 pt-0 pb-4 relative -mt-10">
          <div className="flex items-end gap-3.5">
            {/* Avatar */}
            <div className="w-20 h-20 rounded-2xl border-4 border-white dark:border-zinc-900 bg-zinc-800 shadow-md overflow-hidden shrink-0 relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={MOCK_PROFILE.avatarUrl}
                alt={businessName}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Business info */}
            <div className="pt-9 pb-1">
              <div className="flex items-center gap-1.5">
                <h1 className="font-extrabold text-lg text-zinc-900 dark:text-zinc-50 leading-tight">
                  {businessName}
                </h1>
                <CheckCircle2 className="w-4 h-4 fill-amber-500 text-white shrink-0" />
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                @{slug}
              </p>
            </div>
          </div>

          <p className="text-xs text-zinc-600 dark:text-zinc-300 mt-2.5 leading-relaxed">
            {initialTenant?.tagline || MOCK_PROFILE.tagline}
          </p>

          <div className="flex items-center gap-3 mt-2 pt-2 border-t border-zinc-100 dark:border-zinc-800 text-[11px] text-zinc-500 dark:text-zinc-400">
            <div className="flex items-center gap-1 font-semibold text-zinc-800 dark:text-zinc-200">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>{MOCK_PROFILE.rating}</span>
              <span className="font-normal text-zinc-400">
                ({MOCK_PROFILE.reviewsCount})
              </span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1 truncate">
              <MapPin className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
              <span className="truncate">{initialTenant?.address || MOCK_PROFILE.address}</span>
            </div>
          </div>
        </div>

        {/* Wizard Steps Navigation Bar */}
        <div className="px-5 py-3 bg-zinc-50 dark:bg-zinc-950/50 border-y border-zinc-200/80 dark:border-zinc-800">
          <div className="grid grid-cols-4 gap-1.5">
            {stepsHeader.map((s) => {
              const Icon = s.icon;
              const isActive = step === s.num;
              const isPast = step > s.num;

              return (
                <div
                  key={s.num}
                  className={`flex flex-col items-center py-1.5 px-1 rounded-xl transition-all ${
                    isActive
                      ? "bg-white dark:bg-zinc-800 shadow-sm border border-amber-500/30 text-amber-600 dark:text-amber-400 font-bold"
                      : isPast
                      ? "text-zinc-700 dark:text-zinc-300 font-medium"
                      : "text-zinc-400 dark:text-zinc-600"
                  }`}
                >
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] mb-1 ${
                      isActive
                        ? "bg-amber-500 text-white font-bold shadow-xs"
                        : isPast
                        ? "bg-emerald-500 text-white font-bold"
                        : "bg-zinc-200 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400"
                    }`}
                  >
                    {isPast ? "✓" : s.num}
                  </div>
                  <span className="text-[10px] tracking-tight truncate w-full text-center">
                    {s.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Wizard Step Content */}
        <div className="flex-1 p-5">
          {step === 1 && (
            <ServiceList
              services={servicesList}
              selectedService={booking.service}
              onSelectService={handleSelectService}
              onContinue={handleContinueFromService}
            />
          )}

          {step === 2 && (
            <DateTimePicker
              selectedService={booking.service}
              selectedDate={booking.date}
              selectedTime={booking.time}
              onSelectDate={handleSelectDate}
              onSelectTime={handleSelectTime}
              onContinue={handleContinueFromDateTime}
              onBack={() => setStep(1)}
            />
          )}

          {step === 3 && (
            <CustomerForm
              selectedService={booking.service}
              selectedDate={booking.date}
              selectedTime={booking.time}
              customerName={booking.customerName}
              customerPhone={booking.customerPhone}
              customerNotes={booking.customerNotes}
              onUpdateCustomer={handleUpdateCustomer}
              onContinue={handleContinueFromCustomer}
              onBack={() => setStep(2)}
            />
          )}

          {step === 4 && (
            <PixCheckout booking={booking} onReset={handleReset} />
          )}
        </div>

        {/* Footer */}
        <div className="p-4 text-center border-t border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-950/20 text-[11px] text-zinc-400 dark:text-zinc-500">
          <p className="flex items-center justify-center gap-1 font-medium">
            <span>Powered by</span>
            <strong className="text-zinc-700 dark:text-zinc-300">
              Agendamento SaaS
            </strong>
          </p>
        </div>
      </div>
    </main>
  );
}
