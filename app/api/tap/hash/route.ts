import { NextRequest, NextResponse } from "next/server";
import CryptoJS from "crypto-js";

export async function POST(request: NextRequest) {
  try {
    // Receive data from frontend
    const body = await request.json();

    const amount = body.amount;

    const secretKey = process.env.TAP_SECRET_KEY!;
    const publicKey = process.env.TAP_PUBLIC_KEY!;
    const merchantId = process.env.TAP_MERCHANT_ID!;

    const currency = "BHD";
    const transactionReference = `txn_${Date.now()}`;

    // Build Tap hash string
    const hashString =
      `x_publickey${publicKey}` +
      `x_amount${amount}` +
      `x_currency${currency}` +
      `x_transaction${transactionReference}`;

    // Generate secure hash
    const hash = CryptoJS.HmacSHA256(hashString, secretKey).toString(
      CryptoJS.enc.Hex,
    );

    return NextResponse.json({
      hash,
      amount,
      currency,
      merchantId,
      transactionReference,
      publicKey,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Failed to generate hash" },
      { status: 500 },
    );
  }
}
