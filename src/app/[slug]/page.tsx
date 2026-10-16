import { Suspense } from "react";
import BookingWizard from "@/components/booking/BookingWizard";
import prisma from "@/lib/prisma";
import { Service } from "@/types/booking";

interface PageProps {
  params: Promise<{ slug: string }>;
}

async function BookingSlugContent({ params }: PageProps) {
  const { slug } = await params;

  // Direct fetch from SQLite via Prisma
  const tenant = await prisma.tenant.findUnique({
    where: { slug },
    include: {
      services: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  const formattedServices: Service[] = (tenant?.services || []).map((s) => {
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

  return (
    <BookingWizard
      slug={slug}
      initialTenant={
        tenant
          ? {
              id: tenant.id,
              name: tenant.name,
              slug: tenant.slug,
              email: tenant.email,
              pixKey: tenant.pixKey,
            }
          : null
      }
      initialServices={formattedServices}
    />
  );
}

export default function BookingSlugPage({ params }: PageProps) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-zinc-100 dark:bg-zinc-950">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-3 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm font-medium text-zinc-500">
              Carregando agendamento...
            </p>
          </div>
        </div>
      }
    >
      <BookingSlugContent params={params} />
    </Suspense>
  );
}
