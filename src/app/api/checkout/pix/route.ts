import { NextRequest, NextResponse } from "next/server";
import QRCode from "qrcode";
import { PixCheckoutPayload, PixPaymentResponse } from "@/types/booking";
import { savePayment, getPayment } from "@/lib/paymentsStore";
import prisma from "@/lib/prisma";

/**
 * Helper to compute CRC16 for Pix EMV standard BR Code
 */
function computeCRC16(str: string): string {
  let crc = 0xffff;
  for (let i = 0; i < str.length; i++) {
    crc ^= str.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      if ((crc & 0x8000) !== 0) {
        crc = ((crc << 1) ^ 0x1021) & 0xffff;
      } else {
        crc = (crc << 1) & 0xffff;
      }
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, "0");
}

/**
 * Generate a standard Pix Copia e Cola EMV string
 */
function generatePixBRCode(params: {
  pixKey: string;
  merchantName: string;
  merchantCity: string;
  amount: number;
  txId: string;
}): string {
  const { pixKey, merchantName, merchantCity, amount, txId } = params;

  const formatField = (id: string, value: string) => {
    const len = String(value.length).padStart(2, "0");
    return `${id}${len}${value}`;
  };

  // 26: Merchant Account Information - Pix
  const gui = formatField("00", "br.gov.bcb.pix");
  const key = formatField("01", pixKey);
  const accountInfo = formatField("26", `${gui}${key}`);

  // Base payload
  let payload =
    formatField("00", "01") + // Payload Format Indicator
    accountInfo +
    formatField("52", "0000") + // Merchant Category Code
    formatField("53", "986") + // Transaction Currency (BRL)
    formatField("54", amount.toFixed(2)) + // Amount
    formatField("58", "BR") + // Country Code
    formatField("59", merchantName.slice(0, 25)) + // Merchant Name
    formatField("60", merchantCity.slice(0, 15)) + // Merchant City
    formatField("62", formatField("05", txId.slice(0, 25))); // Additional Data Field (TxID)

  payload += "6304"; // CRC placeholder
  const crc = computeCRC16(payload);
  return `${payload}${crc}`;
}

export async function POST(req: NextRequest) {
  try {
    const body: PixCheckoutPayload = await req.json();

    if (!body || !body.service) {
      return NextResponse.json(
        { error: "Payload inválido. Dados do serviço são obrigatórios." },
        { status: 400 }
      );
    }

    const depositAmount = Number(body.depositAmount) || 30.0;
    const paymentId = `mp_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
    const bookingRef = `BK-${Date.now().toString(36).toUpperCase()}`;
    const expirationDate = new Date(Date.now() + 15 * 60 * 1000).toISOString();

    // 1. Find Tenant in SQLite
    const tenantSlug = body.slug || "barbearia-imperial";
    const tenant =
      (await prisma.tenant.findUnique({
        where: { slug: tenantSlug },
      })) || (await prisma.tenant.findFirst());

    if (!tenant) {
      return NextResponse.json(
        { error: "Estabelecimento não encontrado." },
        { status: 404 }
      );
    }

    const merchantPixKey = tenant.pixKey || "contato@barbeariaimperial.com.br";
    const merchantName = tenant.name || "Barbearia Imperial";

    // Multi-tenant: Priority is the Tenant's individual Gateway Access Token
    const tenantAccessToken = tenant.gatewayAccessToken || process.env.MERCADOPAGO_ACCESS_TOKEN;
    const isDirectTenantAccount = Boolean(tenant.gatewayAccessToken);

    // Platform webhook URL for automatic appointment confirmation
    const reqHost = req.headers.get("x-forwarded-host") || req.headers.get("host") || "localhost:3000";
    const protocol = req.headers.get("x-forwarded-proto") || (reqHost.includes("localhost") ? "http" : "https");
    const webhookUrl = `${protocol}://${reqHost}/api/webhooks/pix`;

    // Prepare appointment date
    let aptDate = new Date();
    if (body.date && body.time) {
      const [y, m, d] = body.date.split("-").map(Number);
      const [hh, mm] = body.time.split(":").map(Number);
      aptDate = new Date(y, m - 1, d, hh, mm);
    }

    // Connect or find service in SQLite
    let serviceRecord = await prisma.service.findFirst({
      where: {
        tenantId: tenant.id,
        OR: [{ id: body.service.id }, { name: body.service.name }],
      },
    });

    if (!serviceRecord) {
      serviceRecord = await prisma.service.create({
        data: {
          name: body.service.name,
          price: body.service.price,
          duration: body.service.durationMinutes || 45,
          tenantId: tenant.id,
        },
      });
    }

    // 2. Call Mercado Pago API with the Tenant's individual credentials if available
    if (tenantAccessToken && !tenantAccessToken.startsWith("SIMULATED-")) {
      try {
        const mpResponse = await fetch("https://api.mercadopago.com/v1/payments", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${tenantAccessToken}`,
            "X-Idempotency-Key": paymentId,
          },
          body: JSON.stringify({
            transaction_amount: depositAmount,
            description: `Sinal Reserva - ${body.service.name} (${body.date} ${body.time})`,
            payment_method_id: "pix",
            notification_url: webhookUrl,
            payer: {
              email: "contato@agendamentosaas.com.br",
              first_name: body.customerName.split(" ")[0] || "Cliente",
              last_name: body.customerName.split(" ").slice(1).join(" ") || "SaaS",
            },
            metadata: {
              tenant_id: tenant.id,
              tenant_slug: tenant.slug,
              tenant_name: tenant.name,
              customer_name: body.customerName,
              customer_phone: body.customerPhone,
              booking_ref: bookingRef,
            },
            date_of_expiration: expirationDate,
          }),
        });

        if (mpResponse.ok) {
          const mpData = await mpResponse.json();
          const qrCode = mpData.point_of_interaction?.transaction_data?.qr_code || "";
          const qrCodeBase64 =
            mpData.point_of_interaction?.transaction_data?.qr_code_base64 || "";
          const livePaymentId = String(mpData.id);

          const paymentResponse: PixPaymentResponse = {
            id: livePaymentId,
            status: mpData.status || "pending",
            statusDetail: mpData.status_detail || "pending_waiting_transfer",
            qrCode,
            qrCodeBase64,
            ticketUrl: mpData.point_of_interaction?.transaction_data?.ticket_url,
            expiresAt: mpData.date_of_expiration || expirationDate,
            depositAmount,
            bookingRef,
          };

          // Save Appointment in SQLite
          await prisma.appointment.create({
            data: {
              id: livePaymentId,
              customerName: body.customerName,
              customerPhone: body.customerPhone,
              date: aptDate,
              status: "pending_pix",
              depositAmount,
              tenantId: tenant.id,
              serviceId: serviceRecord.id,
            },
          });

          savePayment({
            id: livePaymentId,
            payload: body,
            response: paymentResponse,
            status: paymentResponse.status,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });

          return NextResponse.json({
            success: true,
            source: isDirectTenantAccount ? "tenant_gateway_live" : "platform_gateway_live",
            tenant: {
              id: tenant.id,
              name: tenant.name,
              provider: tenant.gatewayProvider,
              isDirectAccount: isDirectTenantAccount,
            },
            payment: paymentResponse,
            point_of_interaction: mpData.point_of_interaction,
          });
        } else {
          const errData = await mpResponse.json().catch(() => ({}));
          console.warn("[Mercado Pago Gateway] API retornou erro, fallback para simulação individual:", errData);
        }
      } catch (mpErr) {
        console.warn("[Mercado Pago Gateway] Exceção na chamada, fallback para simulação individual:", mpErr);
      }
    }

    // 3. Realistic Simulated Mercado Pago Pix Integration with Tenant Account Details
    const pixCopiaECola = generatePixBRCode({
      pixKey: merchantPixKey,
      merchantName,
      merchantCity: "Sao Paulo",
      amount: depositAmount,
      txId: bookingRef,
    });

    // Generate real scannable dynamic QR Code in base64
    const qrDataUrl = await QRCode.toDataURL(pixCopiaECola, {
      width: 320,
      margin: 1.5,
      color: {
        dark: "#18181b",
        light: "#ffffff",
      },
    });

    // Strip prefix for raw base64 standard (as returned by Mercado Pago)
    const base64Pure = qrDataUrl.replace(/^data:image\/png;base64,/, "");

    const simulatedPayment: PixPaymentResponse = {
      id: paymentId,
      status: "pending",
      statusDetail: "pending_waiting_transfer",
      qrCode: pixCopiaECola,
      qrCodeBase64: base64Pure,
      ticketUrl: `https://www.mercadopago.com.br/payments/${paymentId}/ticket`,
      expiresAt: expirationDate,
      depositAmount,
      bookingRef,
    };

    // Store payment in memory
    savePayment({
      id: paymentId,
      payload: body,
      response: simulatedPayment,
      status: "pending",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    // Save Appointment record in Prisma SQLite
    await prisma.appointment.create({
      data: {
        id: paymentId,
        customerName: body.customerName,
        customerPhone: body.customerPhone,
        date: aptDate,
        status: "pending_pix",
        depositAmount,
        tenantId: tenant.id,
        serviceId: serviceRecord.id,
      },
    });

    // Mercado Pago structure simulation for Tenant direct account
    return NextResponse.json({
      success: true,
      source: isDirectTenantAccount ? "tenant_gateway_simulation" : "mercadopago_simulation",
      tenant: {
        id: tenant.id,
        name: tenant.name,
        provider: tenant.gatewayProvider,
        isDirectAccount: isDirectTenantAccount,
        recipient: merchantName,
      },
      id: paymentId,
      status: "pending",
      status_detail: "pending_waiting_transfer",
      date_of_expiration: expirationDate,
      transaction_amount: depositAmount,
      payment: simulatedPayment,
      point_of_interaction: {
        type: "CHECKOUT",
        transaction_data: {
          qr_code: pixCopiaECola,
          qr_code_base64: base64Pure,
          ticket_url: simulatedPayment.ticketUrl,
        },
      },
    });
  } catch (error) {
    console.error("Erro na rota /api/checkout/pix:", error);
    return NextResponse.json(
      { error: "Erro interno ao processar o checkout Pix." },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json(
      { error: "Parâmetro 'id' do pagamento é obrigatório." },
      { status: 400 }
    );
  }

  // Check in SQLite Appointment table first
  try {
    const apt = await prisma.appointment.findUnique({
      where: { id },
    });
    if (apt) {
      return NextResponse.json({
        id: apt.id,
        status: apt.status,
        customerName: apt.customerName,
        depositAmount: apt.depositAmount,
        updatedAt: apt.updatedAt,
      });
    }
  } catch (dbErr) {
    console.debug("Checking memory fallback:", dbErr);
  }

  const payment = getPayment(id);
  if (!payment) {
    return NextResponse.json(
      { error: "Pagamento não encontrado." },
      { status: 404 }
    );
  }

  return NextResponse.json({
    id: payment.id,
    status: payment.status,
    response: payment.response,
    createdAt: payment.createdAt,
    updatedAt: payment.updatedAt,
  });
}
