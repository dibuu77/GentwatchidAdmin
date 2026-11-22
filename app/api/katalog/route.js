import { NextResponse } from 'next/server';
import * as v from "valibot";
import {prisma} from "@/lib/prisma";
import { createProductSchema } from "@/lib/product";
import cloudinary from '@/lib/cloudinary';

export async function GET(request) {
  try {
    const haha = await prisma.product.findMany();
    return NextResponse.json({ success: true, message: 'GET Success', data : haha});
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const formData = await request.formData();

    // 1. Ambil Field Produk Utama
    const name = formData.get('name');
    const brand = formData.get('brand');
    const seriesId = formData.get('seriesId') || null;
    const priceRaw = formData.get('price');
    const unitAge = formData.get('unitAge') || null;
    const warrantyType = formData.get('warrantyType') || null;
    const manufacturerWarrantyUntilRaw = formData.get('manufacturerWarrantyUntil');
    const batteryTest = formData.get('batteryTest') || null;
    const defects = formData.get('defects') || null;
    const status = formData.get('status') || 'AVAILABLE';

    // Enum Kondisi
    const condition = formData.get('condition') || null;
    const physicalCondition = formData.get('physicalCondition') || null;
    const screenCondition = formData.get('screenCondition') || null;
    const batteryCondition = formData.get('batteryCondition') || null;
    const strapCondition = formData.get('strapCondition') || null;

    // 2. Ambil Data Aksesori
    const accessoriessRaw = formData.get('accessoriess');
    let accessoriessData = null;
    if (accessoriessRaw) {
      accessoriessData = JSON.parse(accessoriessRaw);
    }

    // 3. Ambil Semua File Gambar (Multiple Upload)
    const imageFiles = formData.getAll('images');

    // Validasi Field Wajib
    if (!name || !brand || !priceRaw) {
      return NextResponse.json(
        { success: false, message: "Nama, Brand, dan Harga wajib diisi!" },
        { status: 400 }
      );
    }

    const price = parseInt(priceRaw, 10);
    const manufacturerWarrantyUntil = manufacturerWarrantyUntilRaw 
      ? new Date(manufacturerWarrantyUntilRaw) 
      : null;

    // 4. Upload Banyak Gambar ke Cloudinary secara Paralel
    const imageUrls = [];
    if (imageFiles && imageFiles.length > 0) {
      const uploadPromises = imageFiles.map(async (file) => {
        if (file && file.size > 0 && typeof file !== 'string') {
          const arrayBuffer = await file.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);

          return new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
              { folder: 'donstore' },
              (error, result) => {
                if (error) return reject(error);
                resolve(result.secure_url);
              }
            );
            uploadStream.end(buffer);
          });
        }
        return null;
      });

      const results = await Promise.all(uploadPromises);
      imageUrls.push(...results.filter(Boolean)); // Saring jika ada yang null
    }

    // 5. Simpan ke Database via Prisma
    const newProduct = await prisma.product.create({
    data: {
    name,
    brand: brand.toUpperCase(),
    
    // Hubungkan ke ProductSeries menggunakan 'connect'
    series: seriesId ? { connect: { id: seriesId } } : undefined,

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

    images: imageUrls, // Array URL dari Cloudinary

    accessoriess: accessoriessData ? {
      create: {
        charger: accessoriessData.charger || false,
        box: accessoriessData.box || false,
        manual: accessoriessData.manual || false,
        warrantyCard: accessoriessData.warrantyCard || false,
        invoice: accessoriessData.invoice || false,
        packageContents: accessoriessData.packageContents || null,
        additionalAccessories: accessoriessData.additionalAccessories || null,
      }
    } : undefined,
  },
  include: {
    series: true,
    accessoriess: true,
  }
});

    return NextResponse.json({
      success: true,
      message: "Produk berhasil ditambahkan!",
      data: newProduct,
    }, { status: 201 });

  } catch (error) {
    console.error("DETAILED SERVER ERROR:", error);

    return NextResponse.json(
      { 
        success: false, 
        message: error.message || "Gagal memproses data di server." 
      },
      { status: 500 }
    );
  }
}


export async function PUT(request) {
  try {
    const body = await request.json();
    return NextResponse.json({ success: true, data: body });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
export async function PATCH(request) {
  try {
    const body = await request.json();
    return NextResponse.json({ success: true, data: body });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
export async function DELETE(request) {
  try {
    const body = await request.json();
    return NextResponse.json({ success: true, data: body });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}