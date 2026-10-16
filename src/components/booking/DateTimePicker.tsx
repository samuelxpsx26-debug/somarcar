"use client";

import React, { useMemo } from "react";
import { Service } from "@/types/booking";
import { Calendar, Clock, ChevronRight, ArrowLeft, Sun, Sunset, Moon } from "lucide-react";

interface DateTimePickerProps {
  selectedService: Service | null;
  selectedDate: string;
  selectedTime: string;
  onSelectDate: (date: string) => void;
  onSelectTime: (time: string) => void;
  onContinue: () => void;
  onBack: () => void;
}

interface TimeSlot {
  time: string;
  period: "morning" | "afternoon" | "evening";
  available: boolean;
}

export default function DateTimePicker({
  selectedService,
  selectedDate,
  selectedTime,
  onSelectDate,
  onSelectTime,
  onContinue,
  onBack,
}: DateTimePickerProps) {
  // Generate next 14 days
  const daysList = useMemo(() => {
    const list = [];
    const today = new Date();

    for (let i = 0; i < 14; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);

      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      const dateString = `${year}-${month}-${day}`;

      const weekDayShort = d
        .toLocaleDateString("pt-BR", { weekday: "short" })
        .replace(".", "")
        .toUpperCase();
      
      const monthShort = d
        .toLocaleDateString("pt-BR", { month: "short" })
        .replace(".", "")
        .toUpperCase();

      let label = weekDayShort;
      if (i === 0) label = "Hoje";
      else if (i === 1) label = "Amanhã";

      list.push({
        dateString,
        dayNum: day,
        label,
        monthShort,
        isWeekend: d.getDay() === 0, // Sunday
      });
    }
    return list;
  }, []);

  // Set default selected date if none
  React.useEffect(() => {
    if (!selectedDate && daysList.length > 0) {
      // If today is Sunday or past hours, pick today or tomorrow
      onSelectDate(daysList[0].dateString);
    }
  }, [selectedDate, daysList, onSelectDate]);

  // Available slots for demo
  const slots: TimeSlot[] = useMemo(() => {
    return [
      { time: "09:00", period: "morning", available: true },
      { time: "09:45", period: "morning", available: true },
      { time: "10:30", period: "morning", available: false }, // busy
      { time: "11:15", period: "morning", available: true },
      { time: "13:30", period: "afternoon", available: true },
      { time: "14:15", period: "afternoon", available: true },
      { time: "15:00", period: "afternoon", available: false }, // busy
      { time: "16:00", period: "afternoon", available: true },
      { time: "17:00", period: "afternoon", available: true },
      { time: "18:00", period: "evening", available: true },
      { time: "18:45", period: "evening", available: true },
      { time: "19:30", period: "evening", available: true },
    ];
  }, []);

  const morningSlots = slots.filter((s) => s.period === "morning");
  const afternoonSlots = slots.filter((s) => s.period === "afternoon");
  const eveningSlots = slots.filter((s) => s.period === "evening");

  const formattedSelectedDate = useMemo(() => {
    if (!selectedDate) return "";
    const [y, m, d] = selectedDate.split("-");
    const dateObj = new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
    return dateObj.toLocaleDateString("pt-BR", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });
  }, [selectedDate]);

  return (
    <div className="space-y-5">
      {/* Step Header & Back Button */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white transition-colors cursor-pointer py-1 px-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Voltar aos serviços</span>
        </button>

        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
          Passo 2 de 4
        </span>
      </div>

      <div>
        <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
          Data e Horário
        </h2>
        {selectedService && (
          <p className="text-xs text-amber-600 dark:text-amber-400 font-medium mt-0.5">
            Para: {selectedService.name} ({selectedService.durationLabel})
          </p>
        )}
      </div>

      {/* Horizontal Date Selector (Link-in-bio mobile optimized) */}
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5 uppercase tracking-wider">
            <Calendar className="w-3.5 h-3.5 text-amber-500" />
            <span>Selecione o Dia</span>
          </label>
          <span className="text-[11px] text-zinc-400">Arraste para o lado</span>
        </div>

        <div className="flex gap-2.5 overflow-x-auto pb-2 pt-1 no-scrollbar -mx-1 px-1 scroll-smooth">
          {daysList.map((day) => {
            const isSelected = selectedDate === day.dateString;
            return (
              <button
                key={day.dateString}
                type="button"
                onClick={() => onSelectDate(day.dateString)}
                className={`shrink-0 flex flex-col items-center justify-center w-16 py-3 px-2 rounded-2xl border transition-all cursor-pointer ${
                  isSelected
                    ? "bg-zinc-900 text-white dark:bg-amber-500 dark:text-zinc-950 border-zinc-900 dark:border-amber-500 shadow-md scale-[1.03]"
                    : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:border-zinc-400 dark:hover:border-zinc-700"
                }`}
              >
                <span
                  className={`text-[11px] font-semibold tracking-tight ${
                    isSelected
                      ? "text-zinc-300 dark:text-zinc-900"
                      : "text-zinc-400 dark:text-zinc-500"
                  }`}
                >
                  {day.label}
                </span>
                <span className="text-xl font-bold my-0.5 leading-none">
                  {day.dayNum}
                </span>
                <span
                  className={`text-[10px] uppercase font-semibold ${
                    isSelected
                      ? "text-zinc-300 dark:text-zinc-900"
                      : "text-zinc-400 dark:text-zinc-500"
                  }`}
                >
                  {day.monthShort}
                </span>
              </button>
            );
          })}
        </div>

        {formattedSelectedDate && (
          <p className="text-xs text-zinc-500 dark:text-zinc-400 capitalize mt-2 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
            {formattedSelectedDate}
          </p>
        )}
      </div>

      {/* Available Time Slots grouped by period */}
      <div className="space-y-3 pt-1">
        <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5 uppercase tracking-wider">
          <Clock className="w-3.5 h-3.5 text-amber-500" />
          <span>Horários Disponíveis</span>
        </label>

        {/* Morning */}
        <div className="bg-zinc-50/70 dark:bg-zinc-900/60 p-3 rounded-2xl border border-zinc-200/60 dark:border-zinc-800/80 space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-500 dark:text-zinc-400">
            <Sun className="w-3.5 h-3.5 text-amber-500" />
            <span>Manhã</span>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {morningSlots.map((slot) => renderSlotButton(slot))}
          </div>
        </div>

        {/* Afternoon */}
        <div className="bg-zinc-50/70 dark:bg-zinc-900/60 p-3 rounded-2xl border border-zinc-200/60 dark:border-zinc-800/80 space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-500 dark:text-zinc-400">
            <Sunset className="w-3.5 h-3.5 text-orange-500" />
            <span>Tarde</span>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {afternoonSlots.map((slot) => renderSlotButton(slot))}
          </div>
        </div>

        {/* Evening */}
        <div className="bg-zinc-50/70 dark:bg-zinc-900/60 p-3 rounded-2xl border border-zinc-200/60 dark:border-zinc-800/80 space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-500 dark:text-zinc-400">
            <Moon className="w-3.5 h-3.5 text-indigo-400" />
            <span>Noite</span>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {eveningSlots.map((slot) => renderSlotButton(slot))}
          </div>
        </div>
      </div>

      {/* Floating or fixed mobile action button */}
      <div className="pt-2 sticky bottom-3 z-10 flex gap-2">
        <button
          type="button"
          onClick={onBack}
          className="py-3.5 px-4 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-200 font-semibold text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
        >
          Voltar
        </button>

        <button
          type="button"
          onClick={onContinue}
          disabled={!selectedTime}
          className={`flex-1 py-3.5 px-6 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 shadow-lg ${
            selectedTime
              ? "bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-amber-500 dark:hover:bg-amber-400 dark:text-zinc-950 active:scale-[0.99] shadow-zinc-900/10 cursor-pointer"
              : "bg-zinc-200 text-zinc-400 dark:bg-zinc-800 dark:text-zinc-600 cursor-not-allowed shadow-none"
          }`}
        >
          <span>{selectedTime ? `Confirmar horário (${selectedTime})` : "Selecione um horário"}</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );

  function renderSlotButton(slot: TimeSlot) {
    const isSelected = selectedTime === slot.time;

    if (!slot.available) {
      return (
        <button
          key={slot.time}
          type="button"
          disabled
          className="py-2.5 px-2 text-xs font-medium rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800 text-zinc-300 dark:text-zinc-700 bg-zinc-100/50 dark:bg-zinc-900/30 line-through cursor-not-allowed"
          title="Horário indisponível"
        >
          {slot.time}
        </button>
      );
    }

    return (
      <button
        key={slot.time}
        type="button"
        onClick={() => onSelectTime(slot.time)}
        className={`py-2.5 px-2 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
          isSelected
            ? "bg-amber-500 text-white dark:text-zinc-950 border-amber-500 ring-2 ring-amber-500/20 shadow-md scale-[1.02]"
            : "bg-white dark:bg-zinc-800/90 text-zinc-800 dark:text-zinc-200 border-zinc-200 dark:border-zinc-700 hover:border-amber-400"
        }`}
      >
        {slot.time}
      </button>
    );
  }
}
