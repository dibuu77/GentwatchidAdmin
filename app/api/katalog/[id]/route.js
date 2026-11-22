
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import cloudinary from "@/lib/cloudinary";

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

    if (!Array.isArray(images)) {
      return NextResponse.json(
        { success: false, message: "Format gambar tidak valid" },
        { status: 400 }
      );
    }

    // Data kelengkapan tanpa id dan productId
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
        price: Number(price),
        unitAge: unitAge || null,
        manufacturerWarrantyUntil:
          manufacturerWarrantyUntil
            ? new Date(manufacturerWarrantyUntil)
            : null,
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
        if (!imageUrl.includes("res.cloudinary.com")) continue;

        const publicId =
          cloudinary.utils.extractPublicId(imageUrl);

        if (publicId) {
          const result = await cloudinary.uploader.destroy(
            publicId,
            { resource_type: "image" }
          );

          console.log("Cloudinary delete:", publicId, result.result);
        }
      } catch (error) {
        console.error(
          "Gagal menghapus foto Cloudinary:",
          error
        );
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

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;

    // Cari produk terlebih dahulu
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
            if (!imageUrl.includes("res.cloudinary.com")) return;

            const publicId =
              cloudinary.utils.extractPublicId(imageUrl);

            if (publicId) {
              await cloudinary.uploader.destroy(publicId, {
                resource_type: "image",
              });
            }
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