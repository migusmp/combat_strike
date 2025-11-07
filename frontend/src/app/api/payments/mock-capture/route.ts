import { NextResponse } from "next/server";

export async function POST(request: Request) {
  let orderId = "TEST-ORDER";
  let courseId: number | undefined;
  try {
    const body = await request.json();
    if (typeof body?.orderId === "string") {
      orderId = body.orderId;
    }
    if (typeof body?.courseId === "number") {
      courseId = body.courseId;
    }
  } catch {
    // Ignore parsing issues in mock mode
  }

  return NextResponse.json({
    id: orderId,
    status: "COMPLETED",
    test: true,
    courseId,
    captureTime: new Date().toISOString(),
    message: "Captura simulada localmente. Usa backend real en producción.",
  });
}
