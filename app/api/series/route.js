import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET: Ambil daftar seri (opsional filter by brand)
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const brand = searchParams.get('brand');

    const where = brand ? { brand: brand.toUpperCase() } : {};

    const seriesList = await prisma.productSeries.findMany({
      where,
      orderBy: { name: 'asc' },
    });

    return NextResponse.json({ success: true, data: seriesList });
  } catch (error) {
    console.error('API Error GET Series:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal mengambil data seri' },
      { status: 500 }
    );
  }
}

// POST: Tambah seri baru
export async function POST(request) {
  try {
    const body = await request.json();
    const { brand, name, defaultDesc } = body;

    if (!brand || !name || !defaultDesc) {
      return NextResponse.json(
        { success: false, message: 'Semua field wajib diisi' },
        { status: 400 }
      );
    }

    const newSeries = await prisma.productSeries.create({
      data: {
        brand: brand.toUpperCase(),
        name: name.trim(),
        defaultDesc: defaultDesc.trim(),
      },
    });

    return NextResponse.json({ success: true, data: newSeries });
  } catch (error) {
    console.error('API Error POST Series:', error);

    // Handling unique constraint error (brand + name duplikat)
    if (error.code === 'P2002') {
      return NextResponse.json(
        { success: false, message: 'Seri dengan brand ini sudah ada di database' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, message: 'Gagal menyimpan master seri' },
      { status: 500 }
    );
  }
}