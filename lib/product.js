import * as v from "valibot";

export const statusproduk = Object.freeze({
  AVAILABLE: "AVAILABLE",
  SOLD: "SOLD",
  RESERVED: "RESERVED",
  UNAVAILABLE: "UNAVAILABLE",
});

export const ItemConditionEnum = Object.freeze({
  BARU: "BARU",
  BEKAS_SEPERTI_BARU: "BEKAS_SEPERTI_BARU",
  BEKAS_BAIK: "BEKAS_BAIK",
  MINUS: "MINUS",
});

const conditionSchema = v.nullish(
  v.enum(ItemConditionEnum, "Pilihan kondisi tidak valid")
);

export const completenessSchema = v.object({
  charger: v.optional(v.boolean(), false),
  box: v.optional(v.boolean(), false),
  manual: v.optional(v.boolean(), false),
  warrantyCard: v.optional(v.boolean(), false),
  invoice: v.optional(v.boolean(), false),
  additionalAccessories: v.optional(v.nullable(v.string())),
  packageContents: v.optional(v.nullable(v.string())),
});

export const idSchema = v.pipe(
  v.string("ID harus berupa teks"),
  v.trim(),
  v.minLength(1, "ID tidak boleh kosong")
);

// 2. Skema Base Produk (Tabel Database)
export const valiproduct = v.object({
    id: idSchema,
    name : v.pipe(
      v.string("Nama harus berupa teks"),
      v.trim(),
      v.minLength(3, "Nama minimal 3 karakter"),
      v.maxLength(50, "Nama maksimal 50 karakter")
    ),
    brand : v.pipe(
      v.string("brand harus berupa teks"),
      v.trim(),
      v.minLength(3, "brand minimal 3 karakter"),
      v.maxLength(50, "brand maksimal 50 karakter")
    ),
    unitAge : v.nullish(v.pipe(
      v.string("unitAge harus berupa teks"),
      v.trim(),
      v.minLength(3, "unitAge minimal 3 karakter"),
      v.maxLength(50, "unitAge maksimal 50 karakter")
    )),
    price : v.pipe(
    v.number("Harga harus berupa angka"),
    v.minValue(1, "Harga harus lebih dari 0")
    ),
    condition : conditionSchema,
    physicalCondition :conditionSchema,
    screenCondition: conditionSchema,
    batteryCondition : conditionSchema,
    strapCondition  : conditionSchema,
    
    manufacturerWarrantyUntil: v.nullish(
    v.pipe(
      v.string("Format tanggal harus berupa teks"),
      v.transform((val) => (val ? new Date(val) : null))
    )
  ),
    image : v.nullish(v.pipe(
      v.string("image harus berupa teks"),
      v.trim(),
      v.minLength(3, "image minimal 3 karakter"),
      v.maxLength(100, "image maksimal 50 karakter")
    )),
    warrantyType  : v.nullish(v.pipe(
      v.string("warrantyType  harus berupa teks"),
      v.trim(),
      v.minLength(3, "warrantyType minimal 3 karakter"),
      v.maxLength(50, "warrantyType maksimal 50 karakter")
    )),
    defects : v.nullish(v.pipe(
      v.string("defects harus berupa teks"),
      v.trim(),
      v.maxLength(50, "defects maksimal 50 karakter")
    )),
    status : v.optional(v.enum(statusproduk), "AVAILABLE"),
    accessoriess: v.optional(completenessSchema)
  });


export const createProductSchema = v.omit(valiproduct, ["id"]);
export const updateProductSchema = v.partial(createProductSchema);
  