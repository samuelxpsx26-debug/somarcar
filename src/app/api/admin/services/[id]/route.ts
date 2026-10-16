import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    const updated = await prisma.service.update({
      where: { id },
      data: {
        name: body.name,
        description: body.description,
        duration: Number(body.duration),
        price: Number(body.price),
        badge: body.badge?.trim() ? body.badge.trim() : null,
      },
    });

    return NextResponse.json({ success: true, service: updated });
  } catch (error) {
    console.error("Erro ao atualizar serviço:", error);
    return NextResponse.json(
      { error: "Falha ao atualizar serviço no SQLite." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await prisma.service.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao deletar serviço:", error);
    return NextResponse.json(
      { error: "Falha ao excluir serviço do SQLite." },
      { status: 500 }
    );
  }
}
