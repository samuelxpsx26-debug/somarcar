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
        { error: "Tenant não encontrado no banco." },
        { status: 404 }
      );
    }

    const services = await prisma.service.findMany({
      where: { tenantId: tenant.id },
      orderBy: { createdAt: "desc" },
    });

    const formattedServices = services.map((s) => {
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
        active: true,
      };
    });

    return NextResponse.json({ services: formattedServices });
  } catch (error) {
    console.error("Erro ao listar serviços no admin:", error);
    return NextResponse.json(
      { error: "Falha ao carregar serviços do SQLite." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.name || !body.price || !body.duration) {
      return NextResponse.json(
        { error: "Campos obrigatórios ausentes (nome, preço, duração)." },
        { status: 400 }
      );
    }

    const tenant =
      (await prisma.tenant.findUnique({
        where: { slug: body.slug || "barbearia-imperial" },
      })) || (await prisma.tenant.findFirst());

    if (!tenant) {
      return NextResponse.json(
        { error: "Tenant não encontrado." },
        { status: 404 }
      );
    }

    const created = await prisma.service.create({
      data: {
        name: body.name,
        description: body.description || "",
        duration: Number(body.duration),
        price: Number(body.price),
        badge: body.badge?.trim() ? body.badge.trim() : null,
        tenantId: tenant.id,
      },
    });

    return NextResponse.json({ success: true, service: created }, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar serviço:", error);
    return NextResponse.json(
      { error: "Falha ao cadastrar serviço no SQLite." },
      { status: 500 }
    );
  }
}
