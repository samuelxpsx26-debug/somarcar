import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Iniciando o seed do banco de dados...");

  // 1. Criar ou atualizar o Tenant principal com credenciais do Gateway Próprio
  const tenant = await prisma.tenant.upsert({
    where: { slug: "barbearia-imperial" },
    update: {
      name: "Barbearia Imperial",
      email: "contato@barbeariaimperial.com.br",
      pixKey: "contato@barbeariaimperial.com.br",
      gatewayProvider: "mercadopago",
      gatewayAccessToken: "APP_USR-78219401823901-101521-b3f4e2d1c0a987654321-772910",
      gatewayUserId: "MP-MERCHANT-772910",
      gatewayPublicKey: "APP_USR-92847102-4b2a-4c91-9e81-772910",
    },
    create: {
      name: "Barbearia Imperial",
      email: "contato@barbeariaimperial.com.br",
      slug: "barbearia-imperial",
      pixKey: "contato@barbeariaimperial.com.br",
      gatewayProvider: "mercadopago",
      gatewayAccessToken: "APP_USR-78219401823901-101521-b3f4e2d1c0a987654321-772910",
      gatewayUserId: "MP-MERCHANT-772910",
      gatewayPublicKey: "APP_USR-92847102-4b2a-4c91-9e81-772910",
    },
  });

  console.log(`✅ Tenant criado/verificado: ${tenant.name} (ID: ${tenant.id}) - Gateway: ${tenant.gatewayProvider}`);

  // 2. Limpar serviços anteriores do tenant para manter consistência
  await prisma.service.deleteMany({
    where: { tenantId: tenant.id },
  });

  // 3. Criar os 3 serviços vinculados ao Tenant
  const service1 = await prisma.service.create({
    data: {
      name: "Corte de Cabelo Moderno",
      description: "Degradê, tesoura e acabamento impecável com lavagem e finalização com pomada modeladora.",
      duration: 45,
      price: 55.0,
      badge: "Mais Pedido",
      tenantId: tenant.id,
    },
  });

  const service2 = await prisma.service.create({
    data: {
      name: "Barboterapia Completa",
      description: "Alinhamento com navalha, toalha quente emoliente, esfoliação facial e óleo hidratante.",
      duration: 35,
      price: 45.0,
      tenantId: tenant.id,
    },
  });

  const service3 = await prisma.service.create({
    data: {
      name: "Combo VIP (Corte + Barba + Sobrancelha)",
      description: "Experiência completa de cuidado masculino com tudo incluso e atendimento exclusivo.",
      duration: 75,
      price: 90.0,
      badge: "Melhor Escolha",
      tenantId: tenant.id,
    },
  });

  console.log("✅ 3 Serviços cadastrados com sucesso:");
  console.log(`   - ${service1.name} (R$ ${service1.price.toFixed(2)}, ${service1.duration} min)`);
  console.log(`   - ${service2.name} (R$ ${service2.price.toFixed(2)}, ${service2.duration} min)`);
  console.log(`   - ${service3.name} (R$ ${service3.price.toFixed(2)}, ${service3.duration} min)`);

  // 4. Criar um agendamento de teste para validar a tabela Appointment
  const sampleDate = new Date();
  sampleDate.setHours(14, 0, 0, 0);

  const appointment = await prisma.appointment.create({
    data: {
      customerName: "Lucas Ferreira",
      customerPhone: "(11) 98765-4321",
      date: sampleDate,
      status: "confirmed",
      depositAmount: 30.0,
      tenantId: tenant.id,
      serviceId: service1.id,
    },
  });

  console.log(`✅ Agendamento de teste criado: Cliente ${appointment.customerName} (Sinal R$ ${appointment.depositAmount.toFixed(2)})`);
  console.log("🎉 Seed finalizado com sucesso!");
}

main()
  .catch((e) => {
    console.error("❌ Erro durante o seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
