import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const tenant = await prisma.tenant.findUnique({
      where: { slug },
      include: {
        services: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!tenant) {
      return NextResponse.json(
        { error: "Estabelecimento não encontrado." },
        { status: 404 }
      );
    }

    // Format services for front-end consumption
    const formattedServices = tenant.services.map((s) => {
      let durationLabel = `${s.duration} min`;
      if (s.duration >= 60) {
        const hours = Math.floor(s.duration / 60);
        const mins = s.duration % 60;
        durationLabel = mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
      }

      return {
        id: s.id,
        name: s.name,
        description: s.description || "",
        durationMinutes: s.duration,
        durationLabel,
        price: s.price,
        badge: s.badge || undefined,
      };
    });

    return NextResponse.json({
      tenant: {
        id: tenant.id,
        name: tenant.name,
        slug: tenant.slug,
        email: tenant.email,
        pixKey: tenant.pixKey,
      },
      services: formattedServices,
    });
  } catch (error) {
    console.error("Erro ao buscar Tenant:", error);
    return NextResponse.json(
      { error: "Erro interno no servidor ao consultar o banco de dados." },
      { status: 500 }
    );
  }
}
