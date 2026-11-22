
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// PATCH: Edit template
export async function PATCH(request, { params }) {
  try {
    const { id } = await params;
    const { brand, name, defaultDesc } = await request.json();

    if (!brand || !name?.trim() || !defaultDesc?.trim()) {
      return NextResponse.json(
        { success: false, message: "Semua field wajib diisi" },
        { status: 400 }
      );
    }

    const updatedSeries = await prisma.productSeries.update({
      where: { id },
      data: {
        brand: brand.toUpperCase(),
        name: name.trim(),
        defaultDesc: defaultDesc.trim(),
      },
    });

    return NextResponse.json({
      success: true,
      data: updatedSeries,
    });
  } catch (error) {
    console.error("PATCH Series Error:", error);

    if (error.code === "P2002") {
      return NextResponse.json(
        { success: false, message: "Nama seri sudah digunakan pada brand ini" },
        { status: 400 }
      );
    }

    if (error.code === "P2025") {
      return NextResponse.json(
        { success: false, message: "Template tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: false, message: "Gagal memperbarui template" },
      { status: 500 }
    );
  }
}

// DELETE: Hapus template
export async function DELETE(request, { params }) {
  try {
    const { id } = await params;

    await prisma.productSeries.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Template berhasil dihapus",
    });
  } catch (error) {
    console.error("DELETE Series Error:", error);

    if (error.code === "P2025") {
      return NextResponse.json(
        { success: false, message: "Template tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: "Template gagal dihapus. Pastikan template tidak sedang digunakan produk.",
      },
      { status: 400 }
    );
  }
}
