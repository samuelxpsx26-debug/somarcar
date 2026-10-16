import { Service, BusinessProfile } from "@/types/booking";

export const MOCK_SERVICES: Service[] = [
  {
    id: "corte-moderno",
    name: "Corte de Cabelo Moderno",
    description: "Degradê, tesoura e acabamento impecável com lavagem e finalização com pomada modeladora.",
    durationMinutes: 45,
    durationLabel: "45 min",
    price: 55.0,
    badge: "Mais Pedido",
  },
  {
    id: "barba-terapia",
    name: "Barboterapia Completa",
    description: "Alinhamento com navalha, toalha quente emoliente, esfoliação facial e óleo hidratante.",
    durationMinutes: 35,
    durationLabel: "35 min",
    price: 45.0,
  },
  {
    id: "combo-vip",
    name: "Combo VIP (Corte + Barba + Sobrancelha)",
    description: "Experiência completa de cuidado masculino com tudo incluso e atendimento exclusivo.",
    durationMinutes: 75,
    durationLabel: "1h 15min",
    price: 90.0,
    badge: "Melhor Escolha",
  },
];

export const MOCK_PROFILE: BusinessProfile = {
  name: "Studio & Barbearia Imperial",
  slug: "barbearia-imperial",
  tagline: "Cortes modernos, barboterapia e atendimento de alta precisão.",
  avatarUrl: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=200&auto=format&fit=crop&q=80",
  coverGradient: "from-amber-600 via-amber-700 to-zinc-900",
  category: "Barbearia & Estética Masculina",
  rating: 4.9,
  reviewsCount: 148,
  address: "Av. Paulista, 1000 - Jardins, São Paulo",
  instagramHandle: "@barbeariaimperial",
  pixKey: "00020126580014BR.GOV.BCB.PIX0136123e4567-e89b-12d3-a456-426614174000520400005303986540530.005802BR5925Studio Barbearia Imperial6009Sao Paulo62070503***6304ABCD",
};
