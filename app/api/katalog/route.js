
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import cloudinary from "@/lib/cloudinary";

const MAX_FILE_SIZE = 8 * 1024 * 1024;
const MAX_TOTAL_SIZE = 30 * 1024 * 1024;

function getPublicId(imageUrl) {
  const url = new URL(imageUrl);

  if (
    url.protocol !== "https:" ||
    url.hostname !== "res.cloudinary.com"
  ) {
    throw new Error("URL foto bukan berasal dari Cloudinary.");
  }

  const parts = url.pathname.split("/");
  const uploadIndex = parts.indexOf("upload");

  if (uploadIndex === -1) {
    throw new Error("URL foto Cloudinary tidak valid.");
  }

  const imageParts = parts.slice(uploadIndex + 1);
  const versionIndex = imageParts.findIndex((part) =>
    /^v\d+$/.test(part)
  );

  if (versionIndex === -1) {
    throw new Error("Versi foto Cloudinary tidak ditemukan.");
  }

  const publicId = imageParts
    .slice(versionIndex + 1)
    .join("/")
    .replace(/\.[^/.]+$/, "");

  if (!publicId.startsWith("donstore/products/")) {
    throw new Error("Foto tidak berada di folder produk.");
  }

  return publicId;
}

async function validateImages(imageUrls) {
  if (!Array.isArray(imageUrls)) {
    throw new Error("Format data foto tidak valid.");
  }

  const uniqueImages = [...new Set(imageUrls)];

  if (uniqueImages.length !== imageUrls.length) {
    throw new Error("Terdapat foto duplikat.");
  }

  const imageDetails = await Promise.all(
    imageUrls.map(async (url) => {
      if (typeof url !== "string") {
        throw new Error("URL foto tidak valid.");
      }

      const publicId = getPublicId(url);

      const resource = await cloudinary.api.resource(publicId, {
        resource_type: "image",
      });

      if (resource.bytes > MAX_FILE_SIZE) {
        throw new Error("Ukuran setiap foto maksimal 8 MB.");
      }

      return resource.bytes;
    })
  );

  const totalSize = imageDetails.reduce(
    (total, size) => total + size,
    0
  );

  if (totalSize > MAX_TOTAL_SIZE) {
    throw new Error("Total seluruh foto tidak boleh melebihi 30 MB.");
  }
}

export async function GET() {
  try {
    const products = await prisma.product.findMany();

    return NextResponse.json({
      success: true,
      message: "GET Success",
      data: products,
    });
  } catch (error) {
    console.error("GET ERROR:", error);

    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const formData = await request.formData();

    const name = formData.get("name");
    const brand = formData.get("brand");
    const seriesId = formData.get("seriesId") || null;
    const priceRaw = formData.get("price");
    const unitAge = formData.get("unitAge") || null;
    const warrantyType = formData.get("warrantyType") || null;

    const manufacturerWarrantyUntilRaw = formData.get(
      "manufacturerWarrantyUntil"
    );

    const batteryTest = formData.get("batteryTest") || null;
    const defects = formData.get("defects") || null;
    const status = formData.get("status") || "AVAILABLE";

    const condition = formData.get("condition") || null;
    const physicalCondition = formData.get("physicalCondition") || null;
    const screenCondition = formData.get("screenCondition") || null;
    const batteryCondition = formData.get("batteryCondition") || null;
    const strapCondition = formData.get("strapCondition") || null;

    if (!name || !brand || !priceRaw) {
      return NextResponse.json(
        {
          success: false,
          message: "Nama, Brand, dan Harga wajib diisi!",
        },
        { status: 400 }
      );
    }

    const price = Number(priceRaw);

    if (!Number.isFinite(price) || price <= 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Harga harus berupa angka yang valid dan lebih dari 0.",
        },
        { status: 400 }
      );
    }

    // Validasi foto
    const imagesRaw = formData.get("images");
    let imageUrls = [];

    if (imagesRaw) {
      try {
        imageUrls = JSON.parse(imagesRaw);
      } catch {
        return NextResponse.json(
          {
            success: false,
            message: "Data foto tidak valid.",
          },
          { status: 400 }
        );
      }
    }

    try {
      await validateImages(imageUrls);
    } catch (error) {
      return NextResponse.json(
        {
          success: false,
          message: error.message,
        },
        { status: 400 }
      );
    }

    // Validasi aksesori
    const accessoriessRaw = formData.get("accessoriess");
    let accessoriessData = null;

    if (accessoriessRaw) {
      try {
        accessoriessData = JSON.parse(accessoriessRaw);
      } catch {
        return NextResponse.json(
          {
            success: false,
            message: "Data aksesori tidak valid.",
          },
          { status: 400 }
        );
      }
    }

    // Validasi tanggal garansi
    const manufacturerWarrantyUntil = manufacturerWarrantyUntilRaw
      ? new Date(manufacturerWarrantyUntilRaw)
      : null;

    if (
      manufacturerWarrantyUntil &&
      Number.isNaN(manufacturerWarrantyUntil.getTime())
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Format tanggal garansi tidak valid.",
        },
        { status: 400 }
      );
    }

    // Simpan produk
    const newProduct = await prisma.product.create({
      data: {
        name,
        brand: brand.toUpperCase(),

        series: seriesId
          ? { connect: { id: seriesId } }
          : undefined,

        price,
        unitAge,
        warrantyType,
        manufacturerWarrantyUntil,
        batteryTest,
        defects,
        status,

        condition: condition || undefined,
        physicalCondition: physicalCondition || undefined,
        screenCondition: screenCondition || undefined,
        batteryCondition: batteryCondition || undefined,
        strapCondition: strapCondition || undefined,

        images: imageUrls,

        accessoriess: accessoriessData
          ? {
              create: {
                charger: accessoriessData.charger || false,
                box: accessoriessData.box || false,
                manual: accessoriessData.manual || false,
                warrantyCard: accessoriessData.warrantyCard || false,
                invoice: accessoriessData.invoice || false,
                packageContents:
                  accessoriessData.packageContents || null,
                additionalAccessories:
                  accessoriessData.additionalAccessories || null,
              },
            }
          : undefined,
      },
      include: {
        series: true,
        accessoriess: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Produk berhasil ditambahkan!",
        data: newProduct,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST KATALOG ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: error.message || "Gagal memproses data di server.",
      },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    const body = await request.json();

    return NextResponse.json({
      success: true,
      data: body,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

export async function PATCH(request) {
  try {
    const body = await request.json();

    return NextResponse.json({
      success: true,
      data: body,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    const body = await request.json();

    return NextResponse.json({
      success: true,
      data: body,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
