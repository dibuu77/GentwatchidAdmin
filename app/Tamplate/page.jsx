"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import Header from "../../components/Header";
import Footer from "../../components/Footer";

const brandOptions = ["GARMIN", "AMAZFIT", "COROS", "SUUNTO", "POLAR", "OTHER"];

const emptyForm = {
  brand: "",
  name: "",
  defaultDesc: "",
};

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

const labelStyle = {
  display: "block",
  marginBottom: "16px",
  color: "#263d30",
};

export default function TemplatePage() {
  const [templates, setTemplates] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchTemplates = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/series");
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.message || "Gagal mengambil template");
      }
      setTemplates(result.data || []);
    } catch (err) {
      setError(err.message || "Terjadi kesalahan saat mengambil template");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  function resetForm() {
    setForm(emptyForm);
    setEditingId(null);
    setError("");
    setSuccess("");
  }

  function startEdit(template) {
    setEditingId(template.id);
    setForm({
      brand: template.brand || "",
      name: template.name || "",
      defaultDesc: template.defaultDesc || "",
    });
    setError("");
    setSuccess("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const isEditing = Boolean(editingId);
      const response = await fetch(
        isEditing ? `/api/series/${editingId}` : "/api/series",
        {
          method: isEditing ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            brand: form.brand,
            name: form.name.trim(),
            defaultDesc: form.defaultDesc.trim(),
          }),
        }
      );

      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.message || "Gagal menyimpan template");
      }

      setSuccess(isEditing ? "Template berhasil diperbarui." : "Template berhasil ditambahkan.");
      resetForm();
      setSuccess(isEditing ? "Template berhasil diperbarui." : "Template berhasil ditambahkan.");
      await fetchTemplates();
    } catch (err) {
      setError(err.message || "Terjadi kesalahan saat menyimpan template");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(template) {
    const confirmed = window.confirm(
      `Hapus template "${template.name}"? Pastikan template ini tidak sedang digunakan produk.`
    );
    if (!confirmed) return;

    setError("");
    setSuccess("");
    try {
      const response = await fetch(`/api/series/${template.id}`, {
        method: "DELETE",
      });
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Gagal menghapus template");
      }

      setSuccess("Template berhasil dihapus.");
      if (editingId === template.id) resetForm();
      await fetchTemplates();
    } catch (err) {
      setError(err.message || "Terjadi kesalahan saat menghapus template");
    }
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "#f5f2e9" }}>
      <Header />

      <main style={{ flex: 1, width: "100%", maxWidth: "1000px", margin: "0 auto", padding: "40px 20px", boxSizing: "border-box" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px", flexWrap: "wrap", marginBottom: "24px" }}>
          <div>
            <h1 style={{ fontSize: "30px", margin: "18px 0 0", color: "#222" }}>Template Produk</h1>
            <p style={{ color: "#666", marginTop: "8px" }}>Kelola template seri dan deskripsi otomatis produk.</p>
          </div>
        </div>

        {error && <p role="alert" style={{ color: "#b91c1c", background: "#fee2e2", padding: "12px", borderRadius: "8px" }}>{error}</p>}
        {success && <p role="status" style={{ color: "#166534", background: "#dcfce7", padding: "12px", borderRadius: "8px" }}>{success}</p>}

        <section style={{ background: "#fffefa", padding: "25px", borderRadius: "14px", marginBottom: "24px", border: "1px solid #e5e1d6" }}>
          <h2 style={{ fontSize: "20px", fontWeight: "700", margin: "0 0 22px", color: "#263d30" }}>
            {editingId ? "Edit Template" : "Tambah Template"}
          </h2>

          <form onSubmit={handleSubmit}>
            <label style={labelStyle}>
              Brand
              <select name="brand" value={form.brand} onChange={handleChange} required style={inputStyle}>
                <option value="">Pilih Brand</option>
                {brandOptions.map((brand) => <option key={brand} value={brand}>{brand}</option>)}
              </select>
            </label>

            <label style={labelStyle}>
              Nama Series
              <input name="name" value={form.name} onChange={handleChange} required placeholder="Contoh: Forerunner 55" style={inputStyle} />
            </label>

            <label style={labelStyle}>
              Deskripsi Template
              <textarea name="defaultDesc" value={form.defaultDesc} onChange={handleChange} required rows={6} placeholder="Masukkan deskripsi default untuk series ini..." style={{ ...inputStyle, resize: "vertical" }} />
            </label>

            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", flexWrap: "wrap" }}>
              {editingId && (
                <button type="button" onClick={resetForm} disabled={saving} style={{ padding: "11px 18px", border: "1px solid #ccc", borderRadius: "8px", background: "#eee", cursor: "pointer" }}>
                  Batal Edit
                </button>
              )}
              <button type="submit" disabled={saving} style={{ padding: "11px 20px", border: "none", borderRadius: "8px", background: "#263d30", color: "#fff", cursor: saving ? "not-allowed" : "pointer" }}>
                {saving ? "Menyimpan..." : editingId ? "Simpan Perubahan" : "Tambah Template"}
              </button>
            </div>
          </form>
        </section>

        <section style={{ background: "#fffefa", padding: "25px", borderRadius: "14px", border: "1px solid #e5e1d6" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px", marginBottom: "18px" }}>
            <h2 style={{ fontSize: "20px", fontWeight: "700", margin: 0, color: "#263d30" }}>Daftar Template</h2>
            <span style={{ color: "#777", fontSize: "13px" }}>{templates.length} template</span>
          </div>

          {loading ? (
            <p style={{ color: "#666" }}>Memuat template...</p>
          ) : templates.length === 0 ? (
            <p style={{ color: "#666" }}>Belum ada template. Tambahkan template melalui form di atas.</p>
          ) : (
            <div style={{ display: "grid", gap: "14px" }}>
              {templates.map((template) => (
                <article key={template.id} style={{ border: "1px solid #e5e1d6", borderRadius: "10px", padding: "16px", background: "#fff" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px", flexWrap: "wrap" }}>
                    <div style={{ flex: 1, minWidth: "220px" }}>
                      <span style={{ display: "inline-block", fontSize: "12px", color: "#263d30", background: "#e8eee8", padding: "4px 9px", borderRadius: "20px", marginBottom: "8px" }}>{template.brand}</span>
                      <h3 style={{ margin: "0 0 8px", color: "#222", fontSize: "17px" }}>{template.name}</h3>
                      <p style={{ margin: 0, color: "#666", whiteSpace: "pre-wrap", lineHeight: 1.6 }}>{template.defaultDesc}</p>
                    </div>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <button type="button" onClick={() => startEdit(template)} style={{ padding: "8px 13px", border: "1px solid #263d30", borderRadius: "7px", background: "#fff", color: "#263d30", cursor: "pointer" }}>Edit</button>
                      <button type="button" onClick={() => handleDelete(template)} style={{ padding: "8px 13px", border: "none", borderRadius: "7px", background: "#b91c1c", color: "#fff", cursor: "pointer" }}>Hapus</button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}
