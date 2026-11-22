
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import cloudinary from "@/lib/cloudinary";

const MAX_FILE_SIZE = 8 * 1024 * 1024;
const MAX_TOTAL_SIZE = 30 * 1024 * 1024;

// Mengambil Public ID dan memvalidasi URL Cloudinary
function getPublicId(imageUrl) {
  if (typeof imageUrl !== "string") {
    throw new Error("URL foto tidak valid.");
  }

  const url = new URL(imageUrl);
  const config = cloudinary.config();

  if (
    url.protocol !== "https:" ||
    url.hostname !== "res.cloudinary.com"
  ) {
    throw new Error("URL foto bukan berasal dari Cloudinary.");
  }

  const parts = url.pathname.split("/").filter(Boolean);

  if (parts[0] !== config.cloud_name || parts[1] !== "image" || parts[2] !== "upload") {
    throw new Error("URL foto Cloudinary tidak valid.");
  }

  let publicIdParts = parts.slice(3);

  // Lewati versi Cloudinary, misalnya v123456789
  if (/^v\d+$/.test(publicIdParts[0] || "")) {
    publicIdParts = publicIdParts.slice(1);
  }

  const publicId = publicIdParts
    .join("/")
    .replace(/\.[^/.]+$/, "");

  // Mendukung folder lama dan folder upload baru
  if (
    publicId !== "donstore" &&
    !publicId.startsWith("donstore/")
  ) {
    throw new Error("Foto tidak berada di folder produk.");
  }

  return publicId;
}

// Validasi ukuran seluruh foto melalui Cloudinary
async function validateImages(images) {
  if (!Array.isArray(images)) {
    throw new Error("Format gambar tidak valid.");
  }

  if (new Set(images).size !== images.length) {
    throw new Error("Terdapat foto duplikat.");
  }

  const sizes = await Promise.all(
    images.map(async (imageUrl) => {
      const publicId = getPublicId(imageUrl);

      const resource = await cloudinary.api.resource(publicId, {
        resource_type: "image",
      });

      if (resource.bytes > MAX_FILE_SIZE) {
        throw new Error("Ukuran setiap foto maksimal 8 MB.");
      }

      return resource.bytes;
    })
  );

  const totalSize = sizes.reduce(
    (total, size) => total + size,
    0
  );

  if (totalSize > MAX_TOTAL_SIZE) {
    throw new Error("Total seluruh foto tidak boleh melebihi 30 MB.");
  }
}

// GET DETAIL PRODUK
export async function GET(request, { params }) {
  try {
    const { id } = await params;

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        series: true,
        accessoriess: true,
      },
    });

    if (!product) {
      return NextResponse.json(
        { success: false, message: "Produk tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: product,
    });
  } catch (error) {
    console.error("API GET Error:", error);

    return NextResponse.json(
      { success: false, message: "Gagal mengambil produk" },
      { status: 500 }
    );
  }
}

// UPDATE PRODUK
export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();

    const oldProduct = await prisma.product.findUnique({
      where: { id },
      include: { accessoriess: true },
    });

    if (!oldProduct) {
      return NextResponse.json(
        { success: false, message: "Produk tidak ditemukan" },
        { status: 404 }
      );
    }

    const {
      name,
      brand,
      seriesId,
      price,
      unitAge,
      manufacturerWarrantyUntil,
      warrantyType,
      batteryTest,
      images,
      defects,
      status,
      condition,
      physicalCondition,
      screenCondition,
      batteryCondition,
      strapCondition,
      accessoriess,
    } = body;

    // Validasi gambar dan ukuran
    try {
      await validateImages(images);
    } catch (error) {
      return NextResponse.json(
        {
          success: false,
          message: error.message || "Validasi foto gagal.",
        },
        { status: 400 }
      );
    }

    // Validasi harga
    const parsedPrice = Number(price);

    if (!Number.isFinite(parsedPrice) || parsedPrice <= 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Harga harus berupa angka yang valid dan lebih dari 0.",
        },
        { status: 400 }
      );
    }

    // Validasi tanggal garansi
    const warrantyDate = manufacturerWarrantyUntil
      ? new Date(manufacturerWarrantyUntil)
      : null;

    if (warrantyDate && Number.isNaN(warrantyDate.getTime())) {
      return NextResponse.json(
        {
          success: false,
          message: "Format tanggal garansi tidak valid.",
        },
        { status: 400 }
      );
    }

    // Data kelengkapan produk
    const accessoryData = accessoriess
      ? {
          charger: Boolean(accessoriess.charger),
          box: Boolean(accessoriess.box),
          manual: Boolean(accessoriess.manual),
          warrantyCard: Boolean(accessoriess.warrantyCard),
          invoice: Boolean(accessoriess.invoice),
          packageContents: accessoriess.packageContents || null,
          additionalAccessories:
            accessoriess.additionalAccessories || null,
        }
      : null;

    // Update database
    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        name,
        brand,
        seriesId: seriesId || null,
        price: parsedPrice,
        unitAge: unitAge || null,
        manufacturerWarrantyUntil: warrantyDate,
        warrantyType: warrantyType || null,
        batteryTest: batteryTest || null,
        images,
        defects: defects || null,
        status,
        condition: condition || null,
        physicalCondition: physicalCondition || null,
        screenCondition: screenCondition || null,
        batteryCondition: batteryCondition || null,
        strapCondition: strapCondition || null,

        ...(accessoryData && {
          accessoriess: {
            upsert: {
              create: accessoryData,
              update: accessoryData,
            },
          },
        }),
      },
      include: {
        series: true,
        accessoriess: true,
      },
    });

    // Cari foto lama yang sudah dihapus dari daftar
    const removedImages = oldProduct.images.filter(
      (oldImage) => !images.includes(oldImage)
    );

    // Hapus foto lama dari Cloudinary
    for (const imageUrl of removedImages) {
      try {
        const publicId = getPublicId(imageUrl);

        await cloudinary.uploader.destroy(publicId, {
          resource_type: "image",
        });
      } catch (error) {
        console.error("Gagal menghapus foto Cloudinary:", error);
      }
    }

    return NextResponse.json({
      success: true,
      message: "Produk berhasil diperbarui",
      data: updatedProduct,
    });
  } catch (error) {
    console.error("API PUT Error:", error);

    return NextResponse.json(
      {
        success: false,
        message: error.message || "Gagal memperbarui produk",
      },
      { status: 500 }
    );
  }
}

// DELETE PRODUK
export async function DELETE(request, { params }) {
  try {
    const { id } = await params;

    const product = await prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      return NextResponse.json(
        { success: false, message: "Produk tidak ditemukan" },
        { status: 404 }
      );
    }

    // Hapus produk dari database
    await prisma.product.delete({
      where: { id },
    });

    // Hapus gambar dari Cloudinary
    if (product.images?.length) {
      await Promise.all(
        product.images.map(async (imageUrl) => {
          try {
            const publicId = getPublicId(imageUrl);

            await cloudinary.uploader.destroy(publicId, {
              resource_type: "image",
            });
          } catch (error) {
            console.error("Gagal menghapus gambar:", error);
          }
        })
      );
    }

    return NextResponse.json({
      success: true,
      message: "Produk berhasil dihapus",
    });
  } catch (error) {
    console.error("DELETE PRODUCT ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Gagal menghapus produk",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
