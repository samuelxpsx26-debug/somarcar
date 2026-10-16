import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

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

    return NextResponse.json({ tenant });
  } catch (error) {
    console.error("Erro ao carregar settings do tenant:", error);
    return NextResponse.json(
      { error: "Falha ao buscar configurações do SQLite." },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();

    const currentSlug = body.currentSlug || "barbearia-imperial";
    const tenant =
      (await prisma.tenant.findUnique({
        where: { slug: currentSlug },
      })) || (await prisma.tenant.findFirst());

    if (!tenant) {
      return NextResponse.json(
        { error: "Tenant não encontrado." },
        { status: 404 }
      );
    }

    const updated = await prisma.tenant.update({
      where: { id: tenant.id },
      data: {
        name: body.name ?? tenant.name,
        slug: body.slug ?? tenant.slug,
        email: body.email ?? tenant.email,
        pixKey: body.pixKey ?? tenant.pixKey,
        gatewayProvider: body.gatewayProvider ?? tenant.gatewayProvider,
        gatewayAccessToken: body.gatewayAccessToken !== undefined ? body.gatewayAccessToken : tenant.gatewayAccessToken,
        gatewayUserId: body.gatewayUserId !== undefined ? body.gatewayUserId : tenant.gatewayUserId,
        gatewayPublicKey: body.gatewayPublicKey !== undefined ? body.gatewayPublicKey : tenant.gatewayPublicKey,
      },
    });

    return NextResponse.json({ success: true, tenant: updated });
  } catch (error) {
    console.error("Erro ao salvar settings no SQLite:", error);
    return NextResponse.json(
      { error: "Falha ao salvar configurações no SQLite." },
      { status: 500 }
    );
  }
}
