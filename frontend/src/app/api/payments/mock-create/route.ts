import { NextResponse } from "next/server";

export async function POST(request: Request) {
  let total = "0.00";
  try {
    const body = await request.json();
    if (typeof body?.total === "string") {
      total = body.total;
    }
  } catch {
    // Ignore body parsing errors for mock runs
  }

  const mockOrderId = `TEST-${Math.random().toString(36).slice(2, 10).toUpperCase()}`;

  return NextResponse.json({
    id: mockOrderId,
    status: "CREATED",
    intent: "CAPTURE",
    amount: total,
    test: true,
    message: "Orden simulada desde el frontend (solo para pruebas locales).",
  });
}
