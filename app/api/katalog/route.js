
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import cloudinary from "@/lib/cloudinary";

export async function GET(request) {
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
    // 1. Ambil FormData
    const formData = await request.formData();

    console.log("1. FormData berhasil dibaca");

    // 2. Ambil data produk
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

    console.log("2. Data produk:", {
      name,
      brand,
      seriesId,
      priceRaw,
    });

    // 3. Ambil data aksesori
    const accessoriessRaw = formData.get("accessoriess");
    let accessoriessData = null;

    if (accessoriessRaw) {
      accessoriessData = JSON.parse(accessoriessRaw);
    }

    // 4. Ambil gambar
    const imageFiles = formData.getAll("images");

    // 5. Validasi field wajib
    if (!name || !brand || !priceRaw) {
      return NextResponse.json(
        {
          success: false,
          message: "Nama, Brand, dan Harga wajib diisi!",
        },
        { status: 400 }
      );
    }

    const price = parseInt(priceRaw, 10);

    if (!Number.isFinite(price) || price <= 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Harga harus berupa angka yang valid dan lebih dari 0.",
        },
        { status: 400 }
      );
    }

    // 6. Konversi tanggal garansi
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

    console.log("3. Tanggal garansi:", manufacturerWarrantyUntil);

    // 7. Upload gambar ke Cloudinary
    console.log("4. Mulai upload gambar");

    const imageUrls = [];

    if (imageFiles.length > 0) {
      const uploadPromises = imageFiles.map(async (file) => {
        if (file && file.size > 0 && typeof file !== "string") {
          const buffer = Buffer.from(await file.arrayBuffer());

          return new Promise((resolve, reject) => {
            cloudinary.uploader.upload_stream(
              {
                folder: "donstore",
                resource_type: "image",
              },
              (error, result) => {
                if (error) {
                  reject(error);
                } else {
                  resolve(result.secure_url);
                }
              }
            ).end(buffer);
          });
        }

        return null;
      });

      const results = await Promise.all(uploadPromises);
      imageUrls.push(...results.filter(Boolean));
    }

    console.log("5. Upload gambar berhasil:", imageUrls.length);

    // 8. Simpan produk ke database
    console.log("6. Mulai menyimpan ke database");

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

    console.log("7. Produk berhasil disimpan");

    return NextResponse.json(
      {
        success: true,
        message: "Produk berhasil ditambahkan!",
        data: newProduct,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("DETAILED SERVER ERROR:", error);

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
