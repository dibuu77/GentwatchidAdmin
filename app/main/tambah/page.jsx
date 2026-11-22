"use client";

import { useState, useEffect } from 'react';
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

const CONDITION_OPTIONS = [
  { label: 'Baru', value: 'BARU' },
  { label: 'Bekas Seperti Baru (Like New)', value: 'BEKAS_SEPERTI_BARU' },
  { label: 'Bekas Baik', value: 'BEKAS_BAIK' },
  { label: 'Ada Minus', value: 'MINUS' },
];

export default function TambahProdukPage() {
  const [loading, setLoading] = useState(false);
  const [seriesList, setSeriesList] = useState([]);
  const [loadingSeries, setLoadingSeries] = useState(false);

  // State Form Utama (Product)
  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    seriesId: '',
    price: '',
    unitAge: '',
    warrantyType: '',
    manufacturerWarrantyUntil: '',
    batteryTest: '',
    defects: '',
    status: 'AVAILABLE',
    condition: '',
    physicalCondition: '',
    screenCondition: '',
    batteryCondition: '',
    strapCondition: '',
  });

  // State Aksesori (Accessoriess)
  const [accData, setAccData] = useState({
    charger: false,
    box: false,
    manual: false,
    warrantyCard: false,
    invoice: false,
    packageContents: '',
    additionalAccessories: '',
  });

  // State Multiple Images
  const [imageFiles, setImageFiles] = useState([]);

  // Fetch daftar seri ketika Brand dipilih
  useEffect(() => {
    if (!formData.brand) {
      setSeriesList([]);
      return;
    }

    const fetchSeries = async () => {
      setLoadingSeries(true);
      try {
        const res = await fetch(`/api/series?brand=${formData.brand}`);
        const result = await res.json();
        if (result.success) {
          setSeriesList(result.data);
        }
      } catch (err) {
        console.error("Gagal mengambil data seri:", err);
      } finally {
        setLoadingSeries(false);
      }
    };

    fetchSeries();
  }, [formData.brand]);

  // Handler Perubahan Input Utama
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handler Khusus Pilih Seri
  const handleSeriesChange = (e) => {
    const selectedId = e.target.value;
    const selectedSeries = seriesList.find((s) => s.id === selectedId);

    setFormData((prev) => ({
      ...prev,
      seriesId: selectedId,
      name: selectedSeries ? `${formData.brand} ${selectedSeries.name}` : prev.name,
    }));
  };

  // Handler Checkbox Aksesori
  const handleAccCheckbox = (e) => {
    const { name, checked } = e.target;
    setAccData((prev) => ({ ...prev, [name]: checked }));
  };

  // Handler Pilih Gambar (Akumulasi / Tambah ke daftar yang sudah ada)
  const handleImageChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      setImageFiles((prevFiles) => [...prevFiles, ...newFiles]);
      e.target.value = '';
    }
  };

  // Handler Hapus Gambar Tunggal dari Pratinjau
  const handleRemoveImage = (indexToRemove) => {
    setImageFiles((prevFiles) => prevFiles.filter((_, index) => index !== indexToRemove));
  };

  // Handler Mengatur Foto Menjadi Utama (Pindah ke paling depan/indeks 0)
  const handleMakePrimary = (indexToPrimary) => {
    setImageFiles((prevFiles) => {
      const updated = [...prevFiles];
      const [selected] = updated.splice(indexToPrimary, 1);
      updated.unshift(selected);
      return updated;
    });
  };

  // Handler Menggeser Posisi Foto (Kiri/Kanan)
  const handleMoveImage = (fromIndex, toIndex) => {
    setImageFiles((prevFiles) => {
      const updated = [...prevFiles];
      const [movedItem] = updated.splice(fromIndex, 1);
      updated.splice(toIndex, 0, movedItem);
      return updated;
    });
  };

  // Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = new FormData();
      
      // 1. Append Field Product
      Object.keys(formData).forEach((key) => {
        data.append(key, formData[key]);
      });

      // 2. Append Field Accessoriess
      data.append('accessoriess', JSON.stringify(accData));

      // 3. Append Multiple Gambar dengan Urutan yang Sudah Disusun
      imageFiles.forEach((file) => {
        data.append('images', file);
      });

      const res = await fetch('/api/katalog', {
        method: 'POST',
        body: data,
      });

      const result = await res.json();

      if (result.success) {
        alert('Produk berhasil ditambahkan!');
        window.location.href = '/katalog';
      } else {
        alert(result.message || 'Gagal menyimpan produk');
      }
    } catch (err) {
      console.error(err);
      alert('Terjadi kesalahan saat mengirim data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '2rem auto', padding: '0 1rem', fontFamily: 'sans-serif' }}>
      <Link href="/katalog" style={{ color: '#666', textDecoration: 'none', fontSize: '0.9rem' }}>
        &larr; Kembali ke Katalog
      </Link>

      <h1 style={{ fontSize: '1.8rem', margin: '1rem 0 1.5rem 0', color: '#111' }}>Tambah Produk Baru</h1>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        
        {/* SECTION 1: BRAND & SERI */}
        <fieldset style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '1.2rem' }}>
          <legend style={{ fontWeight: 'bold', color: '#d9622b' }}>1. Informasi Brand & Seri</legend>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 'bold', marginBottom: '0.4rem' }}>
                Brand <span style={{ color: 'red' }}>*</span>
              </label>
              <select
                name="brand"
                value={formData.brand}
                onChange={(e) => {
                  handleChange(e);
                  setFormData((prev) => ({ ...prev, seriesId: '', name: '' }));
                }}
                required
                style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #ccc' }}
              >
                <option value="">-- Pilih Brand --</option>
                {BRAND_OPTIONS.map((b) => (
                  <option key={b.value} value={b.value}>{b.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 'bold', marginBottom: '0.4rem' }}>
                Seri Produk (`ProductSeries`)
              </label>
              <select
                name="seriesId"
                value={formData.seriesId}
                onChange={handleSeriesChange}
                disabled={!formData.brand || loadingSeries}
                style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #ccc' }}
              >
                <option value="">
                  {loadingSeries ? 'Memuat seri...' : formData.brand ? `-- Pilih Seri ${formData.brand} --` : '-- Pilih Brand Dulu --'}
                </option>
                {seriesList.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ marginTop: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 'bold', marginBottom: '0.4rem' }}>
              Nama Produk (Judul Tampilan) <span style={{ color: 'red' }}>*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Contoh: Garmin Forerunner 265 Black Slate"
              required
              style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #ccc' }}
            />
          </div>

          <div style={{ marginTop: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 'bold', marginBottom: '0.4rem' }}>
              Harga (Rp) <span style={{ color: 'red' }}>*</span>
            </label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              placeholder="Contoh: 3500000"
              max="2000000000"
              required
              style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #ccc' }}
            />
          </div>
        </fieldset>

        {/* SECTION 2: KONDISI & SPESIFIKASI UNIT */}
        <fieldset style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '1.2rem' }}>
          <legend style={{ fontWeight: 'bold', color: '#d9622b' }}>2. Kondisi & Spesifikasi Unit</legend>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.3rem' }}>Kondisi Umum</label>
              <select name="condition" value={formData.condition} onChange={handleChange} style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #ccc' }}>
                <option value="">-- Pilih Kondisi --</option>
                {CONDITION_OPTIONS.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.3rem' }}>Kondisi Fisik</label>
              <select name="physicalCondition" value={formData.physicalCondition} onChange={handleChange} style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #ccc' }}>
                <option value="">-- Pilih Kondisi --</option>
                {CONDITION_OPTIONS.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.3rem' }}>Kondisi Layar</label>
              <select name="screenCondition" value={formData.screenCondition} onChange={handleChange} style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #ccc' }}>
                <option value="">-- Pilih Kondisi --</option>
                {CONDITION_OPTIONS.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.3rem' }}>Kondisi Baterai</label>
              <select name="batteryCondition" value={formData.batteryCondition} onChange={handleChange} style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #ccc' }}>
                <option value="">-- Pilih Kondisi --</option>
                {CONDITION_OPTIONS.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.3rem' }}>Kondisi Strap</label>
              <select name="strapCondition" value={formData.strapCondition} onChange={handleChange} style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #ccc' }}>
                <option value="">-- Pilih Kondisi --</option>
                {CONDITION_OPTIONS.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.3rem' }}>Umur Pemakaian Unit</label>
              <input type="text" name="unitAge" value={formData.unitAge} onChange={handleChange} placeholder="Contoh: 6 Bulan / 1 Tahun" style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #ccc' }} />
            </div>
          </div>

          <div style={{ marginTop: '1rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.3rem' }}>Tipe Garansi</label>
              <input type="text" name="warrantyType" value={formData.warrantyType} onChange={handleChange} placeholder="Contoh: Garansi Resmi TAM / Toko 7 Hari" style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #ccc' }} />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.3rem' }}>Garansi Pabrik Hingga</label>
              <input type="date" name="manufacturerWarrantyUntil" value={formData.manufacturerWarrantyUntil} onChange={handleChange} style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #ccc' }} />
            </div>
          </div>

          <div style={{ marginTop: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.3rem' }}>Hasil Tes Baterai</label>
            <input type="text" name="batteryTest" value={formData.batteryTest} onChange={handleChange} placeholder="Contoh: Tahan 5-7 Hari mode smartwatch" style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #ccc' }} />
          </div>

          <div style={{ marginTop: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.3rem' }}>Catatan Minus / Defect</label>
            <textarea name="defects" rows="3" value={formData.defects} onChange={handleChange} placeholder="Contoh: Ada goresan halus di bezel jam 12..." style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #ccc' }} />
          </div>
        </fieldset>

        {/* SECTION 3: KELENGKAPAN (ACCESSORIESS) */}
        <fieldset style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '1.2rem' }}>
          <legend style={{ fontWeight: 'bold', color: '#d9622b' }}>3. Kelengkapan Unit</legend>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.8rem', margin: '0.5rem 0 1rem 0' }}>
            <label><input type="checkbox" name="charger" checked={accData.charger} onChange={handleAccCheckbox} /> Charger</label>
            <label><input type="checkbox" name="box" checked={accData.box} onChange={handleAccCheckbox} /> Box / Dus</label>
            <label><input type="checkbox" name="manual" checked={accData.manual} onChange={handleAccCheckbox} /> Manual Book</label>
            <label><input type="checkbox" name="warrantyCard" checked={accData.warrantyCard} onChange={handleAccCheckbox} /> Kartu Garansi</label>
            <label><input type="checkbox" name="invoice" checked={accData.invoice} onChange={handleAccCheckbox} /> Nota / Invoice</label>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.3rem' }}>Isi Paket Tambahan</label>
              <input type="text" name="packageContents" value={accData.packageContents} onChange={(e) => setAccData({ ...accData, packageContents: e.target.value })} placeholder="Contoh: Anti gores terpasang" style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #ccc' }} />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.3rem' }}>Aksesori Tambahan</label>
              <input type="text" name="additionalAccessories" value={accData.additionalAccessories} onChange={(e) => setAccData({ ...accData, additionalAccessories: e.target.value })} placeholder="Contoh: Bonus 1 Strap Nylon" style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #ccc' }} />
            </div>
          </div>
        </fieldset>

        {/* SECTION 4: FOTO (MULTIPLE) & STATUS */}
        <fieldset style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '1.2rem' }}>
          <legend style={{ fontWeight: 'bold', color: '#d9622b' }}>4. Foto Produk & Status Katalog</legend>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '0.3rem' }}>
                Upload Foto Produk (Bisa pilih beberapa sekaligus atau bertahap)
              </label>
              
              <input 
                type="file" 
                accept="image/*" 
                multiple 
                onChange={handleImageChange} 
                style={{ width: '100%', marginBottom: '0.6rem' }} 
              />

              {/* Pratinjau Daftar Foto dengan Kontrol Urutan */}
              {imageFiles.length > 0 ? (
                <div>
                  <p style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#d9622b', marginBottom: '0.4rem' }}>
                    ✅ {imageFiles.length} foto terpilih (Foto pertama = Sampul Katalog):
                  </p>
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    {imageFiles.map((file, idx) => {
                      const objectUrl = URL.createObjectURL(file);
                      const isPrimary = idx === 0;

                      return (
                        <div 
                          key={idx} 
                          style={{ 
                            position: 'relative', 
                            width: '84px', 
                            height: '84px', 
                            border: isPrimary ? '2px solid #d9622b' : '1px solid #ccc', 
                            borderRadius: '8px', 
                            overflow: 'hidden',
                            backgroundColor: '#fafafa'
                          }}
                        >
                          <img 
                            src={objectUrl} 
                            alt={`Preview ${idx + 1}`} 
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                          />

                          {/* Label Sampul Utama */}
                          {isPrimary && (
                            <span 
                              style={{ 
                                position: 'absolute', 
                                bottom: '0', 
                                left: '0', 
                                right: '0', 
                                backgroundColor: '#d9622b', 
                                color: '#fff', 
                                fontSize: '8px', 
                                textAlign: 'center', 
                                fontWeight: 'bold', 
                                padding: '2px 0',
                                textTransform: 'uppercase'
                              }}
                            >
                              UTAMA
                            </span>
                          )}

                          {/* Tombol Jadikan Utama (Jika Bukan Indeks 0) */}
                          {!isPrimary && (
                            <button
                              type="button"
                              onClick={() => handleMakePrimary(idx)}
                              style={{
                                position: 'absolute',
                                top: '2px',
                                left: '2px',
                                background: 'rgba(0, 0, 0, 0.65)',
                                color: '#ffb703',
                                border: 'none',
                                borderRadius: '4px',
                                width: '20px',
                                height: '20px',
                                fontSize: '11px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}
                              title="Jadikan Foto Utama (Sampul)"
                            >
                              ★
                            </button>
                          )}

                          {/* Tombol Geser Kiri / Kanan */}
                          <div 
                            style={{ 
                              position: 'absolute', 
                              bottom: isPrimary ? '16px' : '2px', 
                              left: '2px', 
                              display: 'flex', 
                              gap: '2px' 
                            }}
                          >
                            {idx > 0 && (
                              <button
                                type="button"
                                onClick={() => handleMoveImage(idx, idx - 1)}
                                style={{
                                  background: 'rgba(0,0,0,0.5)',
                                  color: '#fff',
                                  border: 'none',
                                  borderRadius: '3px',
                                  width: '16px',
                                  height: '16px',
                                  fontSize: '8px',
                                  cursor: 'pointer'
                                }}
                                title="Geser ke kiri"
                              >
                                ◀
                              </button>
                            )}
                            {idx < imageFiles.length - 1 && (
                              <button
                                type="button"
                                onClick={() => handleMoveImage(idx, idx + 1)}
                                style={{
                                  background: 'rgba(0,0,0,0.5)',
                                  color: '#fff',
                                  border: 'none',
                                  borderRadius: '3px',
                                  width: '16px',
                                  height: '16px',
                                  fontSize: '8px',
                                  cursor: 'pointer'
                                }}
                                title="Geser ke kanan"
                              >
                                ▶
                              </button>
                            )}
                          </div>

                          {/* Tombol Hapus */}
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(idx)}
                            style={{
                              position: 'absolute',
                              top: '2px',
                              right: '2px',
                              background: 'rgba(217, 98, 43, 0.9)',
                              color: '#fff',
                              border: 'none',
                              borderRadius: '50%',
                              width: '18px',
                              height: '18px',
                              fontSize: '10px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 'bold'
                            }}
                            title="Hapus foto ini"
                          >
                            ✕
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <p style={{ fontSize: '0.75rem', color: '#666' }}>Belum ada foto dipilih</p>
              )}
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '0.3rem' }}>
                Status Produk
              </label>
              <select name="status" value={formData.status} onChange={handleChange} style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #ccc' }}>
                <option value="AVAILABLE">Tersedia (AVAILABLE)</option>
                <option value="RESERVED">Booking (RESERVED)</option>
                <option value="SOLD">Terjual (SOLD)</option>
                <option value="UNAVAILABLE">Tidak Tersedia (UNAVAILABLE)</option>
              </select>
            </div>
          </div>
        </fieldset>

        {/* SUBMIT BUTTON */}
        <button
          type="submit"
          disabled={loading}
          style={{
            padding: '0.85rem',
            borderRadius: '8px',
            border: 'none',
            backgroundColor: loading ? '#888' : '#d9622b',
            color: '#fff',
            fontWeight: 'bold',
            fontSize: '1rem',
            cursor: loading ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? 'Menyimpan & Mengunggah Foto...' : 'Simpan Produk ke Katalog'}
        </button>

      </form>
    </div>
  );
}