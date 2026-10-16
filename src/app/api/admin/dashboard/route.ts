import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get("slug") || "barbearia-imperial";

    const tenant =
      (await prisma.tenant.findUnique({
        where: { slug },
      })) || (await prisma.tenant.findFirst());

    if (!tenant) {
      return NextResponse.json(
        { error: "Tenant não encontrado." },
        { status: 404 }
      );
    }

    const appointments = await prisma.appointment.findMany({
      where: { tenantId: tenant.id },
      include: {
        service: true,
      },
      orderBy: { date: "asc" },
    });

    // Format appointments for admin dashboard
    const formattedApts = appointments.map((apt) => {
      const d = new Date(apt.date);
      const hours = String(d.getHours()).padStart(2, "0");
      const minutes = String(d.getMinutes()).padStart(2, "0");
      const timeStr = `${hours}:${minutes}`;

      let durationLabel = `${apt.service?.duration || 45} min`;
      if ((apt.service?.duration || 45) >= 60) {
        const h = Math.floor((apt.service?.duration || 45) / 60);
        const m = (apt.service?.duration || 45) % 60;
        durationLabel = m > 0 ? `${h}h ${m}min` : `${h}h`;
      }

      return {
        id: apt.id,
        customerName: apt.customerName,
        customerPhone: apt.customerPhone,
        serviceName: apt.service?.name || "Serviço",
        durationLabel,
        time: timeStr,
        totalPrice: apt.service?.price || 50.0,
        depositPaid: apt.status === "confirmed",
        depositAmount: apt.depositAmount,
        status: apt.status,
      };
    });

    const totalToday = formattedApts.length;
    const confirmedToday = formattedApts.filter((a) => a.status === "confirmed").length;
    const pendingPixToday = formattedApts.filter((a) => a.status === "pending_pix").length;
    const totalPixGuaranteed = formattedApts
      .filter((a) => a.depositPaid)
      .reduce((acc, curr) => acc + curr.depositAmount, 0);

    return NextResponse.json({
      appointments: formattedApts,
      metrics: {
        totalToday,
        confirmedToday,
        pendingPixToday,
        totalPixGuaranteed,
        monthlyTotal: 4850.0,
        attendanceRate: "98.2%",
      },
    });
  } catch (error) {
    console.error("Erro ao buscar dados do dashboard:", error);
    return NextResponse.json(
      { error: "Falha ao carregar métricas do SQLite." },
      { status: 500 }
    );
  }
}
