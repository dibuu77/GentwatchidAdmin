
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Header from "../../../../components/Header";
import Footer from "../../../../components/Footer";

const initialForm = {
  name: "",
  brand: "",
  price: "",
  description: "",
  images: [],
  status: "AVAILABLE",
  unitAge: "",
  condition: "",
  physicalCondition: "",
  screenCondition: "",
  batteryCondition: "",
  strapCondition: "",
  batteryTest: "",
  warrantyType: "",
  manufacturerWarrantyUntil: "",
  defects: "",
  accessoriess: {
    charger: false,
    box: false,
    manual: false,
    warrantyCard: false,
    invoice: false,
    packageContents: "",
    additionalAccessories: "",
  },
};

const conditionOptions = [
  { value: "BARU", label: "Baru" },
  { value: "BEKAS_SEPERTI_BARU", label: "Bekas Seperti Baru" },
  { value: "BEKAS_BAIK", label: "Bekas Baik" },
  { value: "MINUS", label: "Ada Minus" },
];

export default function EditProdukPage() {
  const { id } = useParams();
  const router = useRouter();

  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchProduct() {
      try {
        const res = await fetch(`/api/katalog/${id}`);
        const result = await res.json();

        if (!res.ok || !result.success) {
          throw new Error(result.message || "Gagal mengambil data produk");
        }

        const product = result.data;

        setForm({
          ...initialForm,
          ...product,
          description: product.series?.defaultDesc || "",
          price: product.price ?? "",
          images: Array.isArray(product.images) ? product.images : [],
          manufacturerWarrantyUntil: product.manufacturerWarrantyUntil
            ? new Date(product.manufacturerWarrantyUntil)
                .toISOString()
                .split("T")[0]
            : "",
          accessoriess: {
            ...initialForm.accessoriess,
            ...(product.accessoriess || {}),
          },
        });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    if (id) fetchProduct();
  }, [id]);

  function handleChange(e) {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function handleAccessoryChange(e) {
    const { name, value, type, checked } = e.target;

    setForm((prev) => ({
      ...prev,
      accessoriess: {
        ...prev.accessoriess,
        [name]: type === "checkbox" ? checked : value,
      },
    }));
  }

  async function handleImageUpload(e) {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    setUploading(true);
    setError("");

    try {
      const formData = new FormData();
      files.forEach((file) => formData.append("images", file));

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const result = await res.json();

      if (!res.ok || !result.success) {
        throw new Error(result.message || "Gagal mengunggah foto");
      }

      setForm((prev) => ({
        ...prev,
        images: [...prev.images, ...result.images],
      }));
    } catch (err) {
      setError(err.message || "Terjadi kesalahan saat upload foto");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  function handleRemoveImage(index) {
    setForm((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    setSaving(true);
    setError("");

    try {
      const payload = {
        ...form,
        price: Number(form.price),
        images: form.images,
        manufacturerWarrantyUntil:
          form.manufacturerWarrantyUntil || null,
      };

      const res = await fetch(`/api/katalog/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (!res.ok || !result.success) {
        throw new Error(result.message || "Gagal memperbarui produk");
      }

      alert("Produk berhasil diperbarui!");
      router.push(`/main/${id}`);
      router.refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  const inputStyle = {
    width: "100%",
    padding: "11px",
    border: "1px solid #ddd",
    borderRadius: "8px",
    marginTop: "6px",
    color: "#222",
    background: "#fff",
  };

  function InputField({ label, name, type = "text" }) {
    return (
      <label style={{ display: "block", marginBottom: "16px" }}>
        {label}
        <input
          type={type}
          name={name}
          value={form[name] ?? ""}
          onChange={handleChange}
          style={inputStyle}
        />
      </label>
    );
  }

  function SelectField({ label, name, options }) {
    return (
      <label style={{ display: "block", marginBottom: "16px" }}>
        {label}
        <select
          name={name}
          value={form[name] ?? ""}
          onChange={handleChange}
          style={inputStyle}
        >
          <option value="">Pilih {label}</option>
          {form[name] &&
            !options.some((option) => option.value === form[name]) && (
              <option value={form[name]}>{form[name]}</option>
            )}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
    );
  }

  if (loading) {
    return (
      <div style={pageWrapperStyle}>
        <Header />
        <main style={{ ...pageMainStyle, padding: "40px", textAlign: "center" }}>
          Memuat data produk...
        </main>
        <Footer />
      </div>
    );
  }

  if (error && !form.name) {
    return (
      <div style={pageWrapperStyle}>
        <Header />
        <main style={{ ...pageMainStyle, padding: "40px" }}>
          <p style={{ color: "red" }}>{error}</p>
          <Link href="/katalog">Kembali ke katalog</Link>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div style={{ ...pageWrapperStyle, background: "#f5f2e9" }}>
      <Header />

      <main
        style={{
          ...pageMainStyle,
          maxWidth: "900px",
          width: "100%",
          margin: "0 auto",
          padding: "40px 20px",
        }}
      >
    
        <h1 style={{ fontSize: "30px", margin: "25px 0" }}>
          Edit Produk
        </h1>

        {error && (
          <p style={{ color: "#b91c1c", marginBottom: "20px" }}>
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit}>
          {/* INFORMASI PRODUK */}
          <section style={sectionStyle}>
            <h2 style={headingStyle}>Informasi Produk</h2>

            <InputField label="Nama Produk" name="name" />
            <InputField label="Brand" name="brand" />
            <InputField label="Harga" name="price" type="number" />

            <label style={labelStyle}>
              Deskripsi Produk
              <textarea
                value={form.description ?? ""}
                readOnly
                rows={5}
                style={{ ...inputStyle, background: "#f3f3f3", color: "#666" }}
              />
              <small style={{ color: "#777" }}>
                Deskripsi berasal dari data seri produk.
              </small>
            </label>

            <div style={labelStyle}>
              <label htmlFor="product-images" style={{ display: "block", marginBottom: "10px" }}>
                Foto Produk
              </label>

              <input
                id="product-images"
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                disabled={uploading || saving}
                style={{ marginBottom: "12px" }}
              />

              {uploading && (
                <p style={{ color: "#777", fontSize: "14px", marginBottom: "12px" }}>
                  Mengunggah foto ke Cloudinary...
                </p>
              )}

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(125px, 1fr))",
                  gap: "12px",
                }}
              >
                {form.images.map((image, index) => (
                  <div
                    key={`${image}-${index}`}
                    style={{
                      position: "relative",
                      height: "130px",
                      borderRadius: "10px",
                      overflow: "hidden",
                      border: "1px solid #ddd",
                      background: "#f3f3f3",
                    }}
                  >
                    <img
                      src={image}
                      alt={`Foto produk ${index + 1}`}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      disabled={saving || uploading}
                      aria-label={`Hapus foto ${index + 1}`}
                      style={{
                        position: "absolute",
                        top: "6px",
                        right: "6px",
                        width: "28px",
                        height: "28px",
                        border: "none",
                        borderRadius: "50%",
                        background: "#dc2626",
                        color: "white",
                        cursor: "pointer",
                        fontSize: "20px",
                        lineHeight: 1,
                      }}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>

              {form.images.length === 0 && (
                <p style={{ color: "#888", fontSize: "14px", marginTop: "10px" }}>
                  Belum ada foto produk.
                </p>
              )}
              <p style={{ fontSize: "13px", color: "#777", marginTop: "10px" }}>
                Kamu bisa memilih beberapa foto sekaligus. Foto yang dihapus baru akan dihapus dari Cloudinary setelah perubahan disimpan.
              </p>
            </div>
          </section>

          {/* STATUS DAN KONDISI */}
          <section style={sectionStyle}>
            <h2 style={headingStyle}>Status dan Kondisi</h2>

            <SelectField
              label="Status Produk"
              name="status"
              options={[
                { value: "AVAILABLE", label: "Tersedia" },
                { value: "RESERVED", label: "Booking" },
                { value: "SOLD", label: "Terjual" },
                { value: "UNAVAILABLE", label: "Tidak Tersedia" },
              ]}
            />

            <InputField label="Umur Unit" name="unitAge" />

            <SelectField
              label="Kondisi Umum"
              name="condition"
              options={conditionOptions}
            />

            <SelectField
              label="Kondisi Fisik"
              name="physicalCondition"
              options={conditionOptions}
            />

            <SelectField
              label="Kondisi Layar"
              name="screenCondition"
              options={conditionOptions}
            />

            <SelectField
              label="Kondisi Baterai"
              name="batteryCondition"
              options={conditionOptions}
            />

            <SelectField
              label="Kondisi Strap"
              name="strapCondition"
              options={conditionOptions}
            />

            <SelectField
              label="Tes Baterai"
              name="batteryTest"
              options={[
                { value: "NORMAL", label: "Normal" },
                { value: "BAIK", label: "Baik" },
                { value: "MENURUN", label: "Menurun" },
                { value: "BELUM_DITES", label: "Belum Dites" },
              ]}
            />

            <SelectField
              label="Tipe Garansi"
              name="warrantyType"
              options={[
                { value: "GARANSI_RESMI", label: "Garansi Resmi" },
                { value: "GARANSI_TOKO", label: "Garansi Toko" },
                { value: "GARANSI_DISTRIBUTOR", label: "Garansi Distributor" },
                { value: "TANPA_GARANSI", label: "Tidak Ada Garansi" },
              ]}
            />
            <InputField
              label="Garansi Pabrik Hingga"
              name="manufacturerWarrantyUntil"
              type="date"
            />

            <label style={labelStyle}>
              Catatan Minus / Defect
              <textarea
                name="defects"
                value={form.defects ?? ""}
                onChange={handleChange}
                rows={4}
                style={inputStyle}
              />
            </label>
          </section>

          {/* KELENGKAPAN */}
          <section style={sectionStyle}>
            <h2 style={headingStyle}>Kelengkapan Produk</h2>

            {[
              ["charger", "Charger"],
              ["box", "Box / Dus"],
              ["manual", "Buku Panduan"],
              ["warrantyCard", "Kartu Garansi"],
              ["invoice", "Nota / Invoice"],
            ].map(([name, label]) => (
              <label
                key={name}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  marginBottom: "14px",
                }}
              >
                <input
                  type="checkbox"
                  name={name}
                  checked={Boolean(form.accessoriess[name])}
                  onChange={handleAccessoryChange}
                />
                {label}
              </label>
            ))}

            <label style={labelStyle}>
              Isi Paket Tambahan
              <textarea
                name="packageContents"
                value={form.accessoriess.packageContents ?? ""}
                onChange={handleAccessoryChange}
                rows={3}
                style={inputStyle}
              />
            </label>

            <label style={labelStyle}>
              Aksesori Tambahan
              <textarea
                name="additionalAccessories"
                value={form.accessoriess.additionalAccessories ?? ""}
                onChange={handleAccessoryChange}
                rows={3}
                style={inputStyle}
              />
            </label>
          </section>

          {/* ACTION */}
          <div
            style={{
              display: "flex",
              gap: "12px",
              justifyContent: "flex-end",
              marginTop: "25px",
            }}
          >
            <Link
              href={`/main/${id}`}
              style={{
                padding: "12px 20px",
                borderRadius: "8px",
                background: "#ddd",
                color: "#222",
                textDecoration: "none",
              }}
            >
              Batal
            </Link>

            <button
              type="submit"
              disabled={saving || uploading}
              style={{
                padding: "12px 24px",
                border: "none",
                borderRadius: "8px",
                background: "#263d30",
                color: "white",
                cursor: "pointer",
              }}
            >
              {uploading
                ? "Mengunggah Foto..."
                : saving
                  ? "Menyimpan..."
                  : "Simpan Perubahan"}
            </button>
          </div>
        </form>
      </main>

      <Footer />
    </div>
  );
}

// Layout halaman: konten mengisi ruang kosong agar footer selalu di bawah.
const pageWrapperStyle = {
  minHeight: "100vh",
  display: "flex",
  flexDirection: "column",
};

const pageMainStyle = {
  flex: 1,
};

const sectionStyle = {
  background: "#fffefa",
  padding: "25px",
  borderRadius: "14px",
  marginBottom: "22px",
  border: "1px solid #e5e1d6",
};

const headingStyle = {
  fontSize: "20px",
  fontWeight: "700",
  marginBottom: "22px",
  color: "#263d30",
};

const labelStyle = {
  display: "block",
  marginBottom: "16px",
};
