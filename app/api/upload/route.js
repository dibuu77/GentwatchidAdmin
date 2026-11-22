
import { NextResponse } from "next/server";
import cloudinary from "@/lib/cloudinary";

export const runtime = "nodejs";

export async function POST(request) {
  try {
    const formData = await request.formData();
    const files = formData.getAll("images");

    if (!files.length) {
      return NextResponse.json(
        {
          success: false,
          message: "Silakan pilih foto terlebih dahulu.",
        },
        { status: 400 }
      );
    }

    const uploadedImages = [];

    for (const file of files) {
      if (!(file instanceof File) || !file.type.startsWith("image/")) {
        return NextResponse.json(
          {
            success: false,
            message: `File "${file.name || "tidak dikenal"}" bukan gambar. Gunakan format JPG, PNG, atau WEBP.`,
          },
          { status: 400 }
        );
      }

      if (file.size > 5 * 1024 * 1024) {
        return NextResponse.json(
          {
            success: false,
            message: `Foto "${file.name}" melebihi batas 5 MB. Silakan pilih foto dengan ukuran lebih kecil.`,
          },
          { status: 400 }
        );
      }

      const buffer = Buffer.from(await file.arrayBuffer());

      const result = await new Promise((resolve, reject) => {
        cloudinary.uploader
          .upload_stream(
            {
              folder: "donstore/products",
              resource_type: "image",
            },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          )
          .end(buffer);
      });

      uploadedImages.push(result.secure_url);
    }

    return NextResponse.json({
      success: true,
      images: uploadedImages,
    });
  } catch (error) {
    console.error("Upload error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Gagal mengunggah foto. Silakan coba kembali.",
      },
      { status: 500 }
    );
  }
}
