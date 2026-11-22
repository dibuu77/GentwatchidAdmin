import { NextResponse } from "next/server";
import cloudinary from "@/lib/cloudinary";

export const runtime = "nodejs";

function getPublicId(imageUrl) {
  const url = new URL(imageUrl);

  if (
    url.protocol !== "https:" ||
    url.hostname !== "res.cloudinary.com"
  ) {
    throw new Error("URL foto tidak valid.");
  }

  const parts = url.pathname.split("/");
  const uploadIndex = parts.indexOf("upload");

  if (uploadIndex === -1) {
    throw new Error("URL Cloudinary tidak valid.");
  }

  let publicIdParts = parts.slice(uploadIndex + 1);

  const versionIndex = publicIdParts.findIndex((part) =>
    /^v\d+$/.test(part)
  );

  if (versionIndex !== -1) {
    publicIdParts = publicIdParts.slice(versionIndex + 1);
  }

  const publicId = publicIdParts.join("/").replace(/\.[^/.]+$/, "");

  if (!publicId) {
    throw new Error("Public ID tidak ditemukan.");
  }

  return publicId;
}

export async function POST(request) {
  try {
    const { images } = await request.json();

    if (!Array.isArray(images)) {
      return NextResponse.json(
        { success: false, message: "Data foto tidak valid." },
        { status: 400 }
      );
    }

    const sizes = await Promise.all(
      images.map(async (url) => {
        const publicId = getPublicId(url);

        const result = await cloudinary.api.resource(publicId, {
          resource_type: "image",
        });

        return {
          url,
          size: result.bytes,
        };
      })
    );

    return NextResponse.json({
      success: true,
      images: sizes,
      totalSize: sizes.reduce((total, image) => total + image.size, 0),
    });
  } catch (error) {
    console.error("Cloudinary usage error:", error);

    return NextResponse.json(
      {
        success: false,
        message: error.message || "Gagal membaca ukuran foto.",
      },
      { status: 500 }
    );
  }
}