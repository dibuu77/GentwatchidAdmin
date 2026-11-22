"use client";

import { useState } from 'react';
import Link from 'next/link';

const BRAND_OPTIONS = [
  { label: 'Garmin', value: 'GARMIN' },
  { label: 'Amazfit', value: 'AMAZFIT' },
  { label: 'Coros', value: 'COROS' },
  { label: 'Suunto', value: 'SUUNTO' },
  { label: 'Polar', value: 'POLAR' },
  { label: 'Apple', value: 'APPLE' },
  { label: 'Lainnya', value: 'OTHER' },
];

export default function TambahMasterSeriesPage() {
  const [formData, setFormData] = useState({
    brand: '',
    name: '',
    defaultDesc: '',
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const res = await fetch('/api/series', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const result = await res.json();

      if (result.success) {
        setMessage({ type: 'success', text: 'Master Seri b  rhasil ditambahkan!' });
        setFormData({ brand: '', name: '', defaultDesc: '' }); // Reset form
      } else {
        setMessage({ type: 'error', text: result.message || 'Gagal menyimpan data' });
      }
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: 'Terjadi kesalahan jaringan/server' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '700px', margin: '2rem auto', padding: '0 1rem', fontFamily: 'sans-serif' }}>
      <Link href="/katalog" style={{ color: '#666', textDecoration: 'none', fontSize: '0.9rem' }}>
        &larr; Kembali ke Katalog
      </Link>

      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '2rem', marginTop: '1rem', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
        <h1 style={{ fontSize: '1.5rem', margin: '0 0 0.5rem 0', color: '#111827' }}>
          Tambah Master Seri Produk (`ProductSeries`)
        </h1>
        <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: '0 0 1.5rem 0' }}>
          Isi form ini untuk menambahkan template deskripsi resmi bawaan pabrik berdasarkan brand dan tipe seri jam tangan.
        </p>

        {/* FEEDBACK MESSAGE */}
        {message.text && (
          <div style={{
            padding: '0.8rem 1rem',
            borderRadius: '6px',
            marginBottom: '1.5rem',
            fontSize: '0.9rem',
            backgroundColor: message.type === 'success' ? '#def7ec' : '#fde8e8',
            color: message.type === 'success' ? '#03543f' : '#9b1c1c',
            border: `1px solid ${message.type === 'success' ? '#bcf0da' : '#fbd5d5'}`,
          }}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* 1. BRAND */}
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.4rem' }}>
              Brand <span style={{ color: 'red' }}>*</span>
            </label>
            <select
              name="brand"
              value={formData.brand}
              onChange={handleChange}
              required
              style={{ width: '100%', padding: '0.65rem', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '0.95rem' }}
            >
              <option value="">-- Pilih Brand --</option>
              {BRAND_OPTIONS.map((b) => (
                <option key={b.value} value={b.value}>{b.label}</option>
              ))}
            </select>
          </div>

          {/* 2. NAMA SERI */}
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.4rem' }}>
              Nama Seri / Tipe <span style={{ color: 'red' }}>*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Contoh: Forerunner 265 / Active 3 Premium"
              required
              style={{ width: '100%', padding: '0.65rem', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '0.95rem' }}
            />
          </div>

          {/* 3. DEFAULT DESKRIPSI */}
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.4rem' }}>
              Deskripsi Bawaan Pabrik (`defaultDesc`) <span style={{ color: 'red' }}>*</span>
            </label>
            <textarea
              name="defaultDesc"
              rows="8"
              value={formData.defaultDesc}
              onChange={handleChange}
              placeholder="Tuliskan deskripsi panjang resmi mengenai fitur, material, layar, baterai, dan fungsi utama seri ini..."
              required
              style={{ width: '100%', padding: '0.65rem', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '0.95rem', lineHeight: '1.5' }}
            />
          </div>

          {/* BUTTON SUBMIT */}
          <button
            type="submit"
            disabled={loading}
            style={{
              padding: '0.75rem 1.5rem',
              borderRadius: '6px',
              border: 'none',
              backgroundColor: loading ? '#9ca3af' : '#2563eb',
              color: '#fff',
              fontWeight: 'bold',
              fontSize: '0.95rem',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'background-color 0.2s',
              marginTop: '0.5rem'
            }}
          >
            {loading ? 'Sesuai Menyimpan...' : 'Simpan Master Seri'}
          </button>
        </form>
      </div>
    </div>
  );
}