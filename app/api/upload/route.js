
import { NextResponse } from "next/server";
import cloudinary from "@/lib/cloudinary";

export const runtime = "nodejs";

export async function POST() {
  try {
    const timestamp = Math.floor(Date.now() / 1000);
    const folder = "donstore/products";

    const paramsToSign = {
      timestamp,
      folder,
    };

    const signature = cloudinary.utils.api_sign_request(
      paramsToSign,
      process.env.CLOUDINARY_API_SECRET
    );

    const config = cloudinary.config();

    return NextResponse.json({
      success: true,
      signature,
      timestamp,
      folder,
      apiKey: config.api_key,
      cloudName: config.cloud_name,
    });
  } catch (error) {
    console.error("Cloudinary signature error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Gagal membuat autentikasi upload.",
      },
      { status: 500 }
    );
  }
}
