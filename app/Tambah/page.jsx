
"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Header from "../../components/Header";
import Footer from "../../components/Footer";

const initialForm = {
  name: "",
  brand: "",
  seriesId: "",
  price: "",
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

const brandOptions = ["GARMIN", "AMAZFIT", "COROS", "SUUNTO", "POLAR", "OTHER"];

const inputStyle = {
  width: "100%",
  padding: "11px",
  border: "1px solid #ddd",
  borderRadius: "8px",
  marginTop: "6px",
  color: "#222",
  background: "#fff",
  boxSizing: "border-box",
};

const labelStyle = { display: "block", marginBottom: "16px" };

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

function InputField({
  label,
  name,
  type = "text",
  required = false,
  form,
  onChange,
}) {
  return (
    <label style={labelStyle}>
      {label}
      <input
        type={type}
        name={name}
        value={form[name] ?? ""}
        onChange={onChange}
        required={required}
        style={inputStyle}
      />
    </label>
  );
}

function SelectField({
  label,
  name,
  options,
  required = false,
  form,
  onChange,
}) {
  return (
    <label style={labelStyle}>
      {label}
      <select
        name={name}
        value={form[name] ?? ""}
        onChange={onChange}
        required={required}
        style={inputStyle}
      >
        <option value="">Pilih {label}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export default function TambahProdukPage() {
  const router = useRouter();

  const [form, setForm] = useState(initialForm);
  const [images, setImages] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [seriesList, setSeriesList] = useState([]);
  const [loadingSeries, setLoadingSeries] = useState(false);

  // Ambil daftar seri
  useEffect(() => {
    async function fetchSeries() {
      setLoadingSeries(true);

      try {
        const res = await fetch("/api/series");
        const result = await res.json();

        if (!res.ok || !result.success) {
          throw new Error(result.message || "Gagal mengambil daftar seri");
        }

        setSeriesList(result.data || []);
      } catch (err) {
        setError(err.message || "Gagal mengambil daftar seri");
      } finally {
        setLoadingSeries(false);
      }
    }

    fetchSeries();
  }, []);

  // Filter seri berdasarkan brand
  const filteredSeries = useMemo(
    () => seriesList.filter((series) => series.brand === form.brand),
    [seriesList, form.brand]
  );

  const selectedSeries = seriesList.find(
    (series) => series.id === form.seriesId
  );

  function handleBrandChange(e) {
    const brand = e.target.value;
    setForm((prev) => ({ ...prev, brand, seriesId: "" }));
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
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

  // Validasi foto
  function handleImageChange(e) {
    const selected = Array.from(e.target.files || []);
    e.target.value = "";

    setError("");
    setNotice("");

    if (selected.length === 0) return;

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    const invalidFile = selected.find(
      (file) => !allowedTypes.includes(file.type)
    );

    if (invalidFile) {
      setError(
        `Format foto "${invalidFile.name}" tidak didukung. Gunakan JPG, PNG, atau WEBP.`
      );
      return;
    }

    const oversizedFile = selected.find(
      (file) => file.size > 8 * 1024 * 1024
    );

    if (oversizedFile) {
      setError(
        `Foto "${oversizedFile.name}" melebihi batas 8 MB per file.`
      );
      return;
    }

    const totalSize = [...images, ...selected].reduce(
      (total, file) => total + file.size,
      0
    );

    if (totalSize > 30 * 1024 * 1024) {
  setError("Total ukuran seluruh foto maksimal 30 MB.");
  return;
}

    setImages((prev) => [...prev, ...selected]);
    setNotice("Foto berhasil ditambahkan.");
  }

  function removeImage(index) {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setError("");
    setNotice("Foto berhasil dihapus dari pilihan.");
  }

  // Upload langsung ke Cloudinary
  async function uploadImagesToCloudinary() {
    if (images.length === 0) return [];

    const signatureRes = await fetch("/api/upload", {
      method: "POST",
    });

    const signatureData = await signatureRes.json();

    if (!signatureRes.ok || !signatureData.success) {
      throw new Error(
        signatureData.message || "Gagal membuat autentikasi upload."
      );
    }

    const uploadedImages = [];

    for (const file of images) {
      const uploadData = new FormData();

      uploadData.append("file", file);
      uploadData.append("api_key", signatureData.apiKey);
      uploadData.append("timestamp", signatureData.timestamp);
      uploadData.append("signature", signatureData.signature);
      uploadData.append("folder", signatureData.folder);

      const uploadRes = await fetch(
        `https://api.cloudinary.com/v1_1/${signatureData.cloudName}/image/upload`,
        {
          method: "POST",
          body: uploadData,
        }
      );

      const result = await uploadRes.json();

      if (!uploadRes.ok || !result.secure_url) {
        throw new Error(
          result.error?.message || `Gagal mengunggah foto ${file.name}.`
        );
      }

      uploadedImages.push(result.secure_url);
    }

    return uploadedImages;
  }

  // Simpan produk
  async function handleSubmit(e) {
    e.preventDefault();

    setSaving(true);
    setError("");
    setNotice("");

    try {
      const uploadedImages = await uploadImagesToCloudinary();

      if (uploadedImages.length > 0) {
        setNotice("Foto berhasil diunggah. Menyimpan produk...");
      }

      const formData = new FormData();

      Object.entries(form).forEach(([key, value]) => {
        if (key === "accessoriess") {
          formData.append("accessoriess", JSON.stringify(value));
        } else {
          formData.append(key, value ?? "");
        }
      });

      // Kirim URL foto, bukan file gambar
      formData.append("images", JSON.stringify(uploadedImages));

      const res = await fetch("/api/katalog", {
        method: "POST",
        body: formData,
      });

      const result = await res.json();

      if (!res.ok || !result.success) {
        throw new Error(
          result.message || "Gagal menambahkan produk."
        );
      }

      alert("Produk berhasil ditambahkan!");

      router.push(
        result.data?.id ? `/main/${result.data.id}` : "/katalog"
      );

      router.refresh();
    } catch (err) {
      setError(
        err.message || "Terjadi kesalahan saat menambahkan produk."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        background: "#f5f2e9",
      }}
    >
      <Header />

      <main
        style={{
          flex: 1,
          width: "100%",
          maxWidth: "900px",
          margin: "0 auto",
          padding: "40px 20px",
          boxSizing: "border-box",
        }}
      >
        <h1 style={{ fontSize: "30px", margin: "25px 0" }}>
          Tambah Produk
        </h1>

        {error && (
          <p
            style={{
              color: "#b91c1c",
              background: "#fee2e2",
              padding: "12px",
              borderRadius: "8px",
              marginBottom: "20px",
            }}
          >
            {error}
          </p>
        )}

        {notice && (
          <p
            style={{
              color: "#166534",
              background: "#dcfce7",
              padding: "12px",
              borderRadius: "8px",
              marginBottom: "20px",
            }}
          >
            {notice}
          </p>
        )}

        <form onSubmit={handleSubmit}>
          <section style={sectionStyle}>
            <h2 style={headingStyle}>Informasi Produk</h2>

            <InputField
              form={form}
              onChange={handleChange}
              label="Nama Produk"
              name="name"
              required
            />

            <label style={labelStyle}>
              Brand
              <select
                name="brand"
                value={form.brand}
                onChange={handleBrandChange}
                required
                style={inputStyle}
              >
                <option value="">Pilih Brand</option>
                {brandOptions.map((brand) => (
                  <option key={brand} value={brand}>
                    {brand}
                  </option>
                ))}
              </select>
            </label>

            <label style={labelStyle}>
              Series
              <select
                name="seriesId"
                value={form.seriesId}
                onChange={handleChange}
                disabled={
                  !form.brand ||
                  loadingSeries ||
                  filteredSeries.length === 0
                }
                style={inputStyle}
              >
                <option value="">
                  {!form.brand
                    ? "Pilih brand terlebih dahulu"
                    : loadingSeries
                      ? "Memuat series..."
                      : filteredSeries.length === 0
                        ? "Series untuk brand ini belum tersedia"
                        : "Pilih Series"}
                </option>

                {filteredSeries.map((series) => (
                  <option key={series.id} value={series.id}>
                    {series.name}
                  </option>
                ))}
              </select>
            </label>

            <label style={labelStyle}>
              Deskripsi
              <textarea
                value={selectedSeries?.defaultDesc || ""}
                readOnly
                rows={5}
                placeholder="Deskripsi akan terisi otomatis setelah series dipilih"
                style={{
                  ...inputStyle,
                  background: "#f3f3f3",
                  resize: "vertical",
                }}
              />
            </label>

            <InputField
              form={form}
              onChange={handleChange}
              label="Harga"
              name="price"
              type="number"
              required
            />

            <InputField
              form={form}
              onChange={handleChange}
              label="Umur Unit"
              name="unitAge"
            />

            <label style={labelStyle}>
              Foto Produk
              <input
                type="file"
                accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                multiple
                onChange={handleImageChange}
                disabled={saving}
                style={{
                  ...inputStyle,
                  border: "none",
                  paddingLeft: 0,
                }}
              />
            </label>

            {images.length > 0 && (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(auto-fill, minmax(125px, 1fr))",
                  gap: "12px",
                }}
              >
                {images.map((file, index) => (
                  <div
                    key={`${file.name}-${index}`}
                    style={{
                      position: "relative",
                      padding: "10px",
                      border: "1px solid #ddd",
                      borderRadius: "8px",
                      background: "#fff",
                    }}
                  >
                    <p
                      style={{
                        fontSize: "12px",
                        overflowWrap: "anywhere",
                      }}
                    >
                      {file.name}
                    </p>

                    <p style={{ fontSize: "11px", color: "#777" }}>
                      {(file.size / (1024 * 1024)).toFixed(2)} MB
                    </p>

                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      disabled={saving}
                      style={{
                        marginTop: "8px",
                        color: "#b91c1c",
                      }}
                    >
                      Hapus
                    </button>
                  </div>
                ))}
              </div>
            )}

            <small style={{ color: "#777" }}>
              Format JPG, PNG, atau WEBP. Maksimal 8 MB per foto
              dan 30 MB untuk seluruh foto.
            </small>
          </section>

          <section style={sectionStyle}>
            <h2 style={headingStyle}>Status dan Kondisi</h2>

            <SelectField
              form={form}
              onChange={handleChange}
              label="Status Produk"
              name="status"
              options={[
                { value: "AVAILABLE", label: "Tersedia" },
                { value: "RESERVED", label: "Booking" },
                { value: "SOLD", label: "Terjual" },
                { value: "UNAVAILABLE", label: "Tidak Tersedia" },
              ]}
            />

            <SelectField
              form={form}
              onChange={handleChange}
              label="Kondisi Umum"
              name="condition"
              options={conditionOptions}
            />

            <SelectField
              form={form}
              onChange={handleChange}
              label="Kondisi Fisik"
              name="physicalCondition"
              options={conditionOptions}
            />

            <SelectField
              form={form}
              onChange={handleChange}
              label="Kondisi Layar"
              name="screenCondition"
              options={conditionOptions}
            />

            <SelectField
              form={form}
              onChange={handleChange}
              label="Kondisi Baterai"
              name="batteryCondition"
              options={conditionOptions}
            />

            <SelectField
              form={form}
              onChange={handleChange}
              label="Kondisi Strap"
              name="strapCondition"
              options={conditionOptions}
            />

            <SelectField
              form={form}
              onChange={handleChange}
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
              form={form}
              onChange={handleChange}
              label="Tipe Garansi"
              name="warrantyType"
              options={[
                { value: "GARANSI_RESMI", label: "Garansi Resmi" },
                { value: "GARANSI_TOKO", label: "Garansi Toko" },
                {
                  value: "GARANSI_DISTRIBUTOR",
                  label: "Garansi Distributor",
                },
                { value: "TANPA_GARANSI", label: "Tidak Ada Garansi" },
              ]}
            />

            <InputField
              form={form}
              onChange={handleChange}
              label="Garansi Pabrik Hingga"
              name="manufacturerWarrantyUntil"
              type="date"
            />

            <label style={labelStyle}>
              Catatan Minus / Defect
              <textarea
                name="defects"
                value={form.defects}
                onChange={handleChange}
                rows={4}
                style={inputStyle}
              />
            </label>
          </section>

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
                  checked={form.accessoriess[name]}
                  onChange={handleAccessoryChange}
                />
                {label}
              </label>
            ))}

            <label style={labelStyle}>
              Isi Paket Tambahan
              <textarea
                name="packageContents"
                value={form.accessoriess.packageContents}
                onChange={handleAccessoryChange}
                rows={3}
                style={inputStyle}
              />
            </label>

            <label style={labelStyle}>
              Aksesori Tambahan
              <textarea
                name="additionalAccessories"
                value={form.accessoriess.additionalAccessories}
                onChange={handleAccessoryChange}
                rows={3}
                style={inputStyle}
              />
            </label>
          </section>

          <div
            style={{
              display: "flex",
              gap: "12px",
              justifyContent: "flex-end",
              marginTop: "25px",
            }}
          >
            <Link
              href="/katalog"
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
              disabled={saving}
              style={{
                padding: "12px 24px",
                border: "none",
                borderRadius: "8px",
                background: "#263d30",
                color: "white",
                cursor: saving ? "not-allowed" : "pointer",
              }}
            >
              {saving ? "Mengunggah / Menyimpan..." : "Simpan Produk"}
            </button>
          </div>
        </form>
      </main>

      <Footer />
    </div>
  );
}
