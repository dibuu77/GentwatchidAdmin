"use client";

import { useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import styles from './panduan.module.css';

export default function PanduanPage() {
  const [activeTab, setActiveTab] = useState('beli');
  const [openFaq, setOpenFaq] = useState(null);

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const faqBeli = [
    {
      q: "Apakah unit yang dijual di Donstore dijamin original?",
      a: "100% Original. Semua unit telah melewati proses verifikasi fisik, fungsi tombol dan kelengkapan oleh tim kami."
    },
    {
      q: "Apakah ada garansi untuk unit yang dibeli?",
      a: "Unit second di Donstore tidak dilengkapi garansi, tetapi kami pastikan kondisi unit sesuai dengan deskripsi, foto, dan catatan minus yang tertera. Karena itu, baca detail produk dengan teliti sebelum membeli. Jika ada ketidaksesuaian, hubungi Admin dengan bukti unboxing."
    },
    {
      q: "Metode pembayaran apa saja yang tersedia?",
      a: "Kami menerima transfer bank, e-wallet, dan transaksi via marketplace terpercaya untuk kemudahan dan keamanan bersama."
    }
  ];

  const faqJual = [
    {
      q: "Apakah penjualan unit hanya bisa lewat COD?",
      a: "Ya, penjualan unit di Donstore khusus COD. Kamu dan tim kami bertemu langsung di lokasi yang disepakati, sehingga unit bisa dicek bersama dan pembayaran diterima saat itu juga."
    },
    {
      q: "Apakah saya harus mengirimkan barang terlebih dahulu?",
      a: "Ya, untuk sistem jual putus/titip jual, unit dikirim ke toko kami untuk dilakukan cek fisik & fungsi secara menyeluruh sebelum pencairan dana."
    },
    {
      q: "Apa bedanya Jual Putus dengan Titip Jual?",
      a: "Jual Putus: Dana langsung cair setelah unit lulus verifikasi. Titip Jual: Unit dipasarkan di katalog Donstore, dan pencairan dana dilakukan setelah unit laku terjual dengan harga yang biasanya lebih tinggi."
    }
  ];

  return (
    <div className={styles.page}>
      <Header />

      <main className={`${styles.panduanContainer} ${styles.wrap}`}>
        {/* HERO SECTION */}
        <div className={styles.panduanHero}>
          <span className={styles.kicker}>PANDUAN LENGKAP</span>
          <h1 className={styles.display}>Cara Membeli & Menjual di Donstore</h1>
          <p className={styles.lede}>
            Pahami langkah mudah bertransaksi sportwatch second berkualitas dengan aman, transparan, dan tanpa drama.
          </p>

          {/* TAB SWITCHER */}
          <div className={styles.tabSwitcher}>
            <button
              className={`${styles.tabBtn} ${activeTab === 'beli' ? styles.active : ''}`}
              onClick={() => { setActiveTab('beli'); setOpenFaq(null); }}
            >
              🛒 Panduan Membeli
            </button>
            <button
              className={`${styles.tabBtn} ${activeTab === 'jual' ? styles.active : ''}`}
              onClick={() => { setActiveTab('jual'); setOpenFaq(null); }}
            >
              🤝 Panduan Menjual  
            </button>
          </div>
        </div>

        {/* CONTENT SECTION: MEMBELI */}
        {activeTab === 'beli' && (
          <div className={`${styles.panduanContent} ${styles.fadeIn}`}>
            <h2 className={`${styles.sectionTitle} ${styles.display}`}>4 Langkah Mudah Membeli Unit</h2>
            
            <div className={styles.stepsGrid}>
              <div className={styles.stepCard}>
                <div className={styles.stepNum}>01</div>
                <h3>Pilih Unit di Katalog</h3>
                <p>Jelajahi katalog kami, gunakan filter brand (Garmin, Amazfit, Coros, dll) atau fitur pencarian untuk menemukan jam yang kamu inginkan.</p>
              </div>

              <div className={styles.stepCard}>
                <div className={styles.stepNum}>02</div>
                <h3>Cek Detail & Kondisi</h3>
                <p>Baca informasi spesifikasi, kondisi fisik, performa baterai, kelengkapan paket, serta catatan minus (jika ada) pada halaman detail produk.</p>
              </div>

              <div className={styles.stepCard}>
                <div className={styles.stepNum}>03</div>
                <h3>Hubungi Admin via WA</h3>
                <p>Klik tombol konfirmasi/pembelian untuk terhubung langsung dengan Admin WhatsApp kami guna mengamankan stok unit.</p>
              </div>

              <div className={styles.stepCard}>
                <div className={styles.stepNum}>04</div>
                <h3>Pembayaran & Pengiriman</h3>
                <p>Selesaikan pembayaran aman via transfer/marketplace. Barang akan dikemas rapi dengan *bubble wrap* tebal dan dikirim ke alamatmu.</p>
              </div>
            </div>

            <div className={styles.ctaBox}>
              <h3>Siap menemukan sportwatch impianmu?</h3>
              <p>Lihat update stok unit yang tersedia minggu ini.</p>
              <Link href="/katalog" className={styles.ctaBtn}>Buka Katalog Produk →</Link>
            </div>

            {/* FAQ BELI */}
            <div className={styles.faqSection}>
              <h3 className={`${styles.sectionTitle} ${styles.display}`}>Pertanyaan Sering Diajukan (Membeli)</h3>
              <div className={styles.faqList}>
                {faqBeli.map((item, idx) => (
                  <div key={idx} className={`${styles.faqItem} ${openFaq === idx ? styles.open : ''}`} onClick={() => toggleFaq(idx)}>
                    <div className={styles.faqQuestion}>
                      <span>{item.q}</span>
                      <span className={styles.faqIcon}>{openFaq === idx ? '−' : '+'}</span>
                    </div>
                    {openFaq === idx && <div className={styles.faqAnswer}>{item.a}</div>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* CONTENT SECTION: MENJUAL */}
        {activeTab === 'jual' && (
          <div className={`${styles.panduanContent} ${styles.fadeIn}`}>
            <h2 className={`${styles.sectionTitle} ${styles.display}`}>4 Langkah Mudah Menjual Unit</h2>

            <div className={styles.stepsGrid}>
              <div className={styles.stepCard}>
                <div className={styles.stepNum}>01</div>
                <h3>Isi Form Penawaran</h3>
                <p>Buka halaman Jual, isi data diri, spesifikasi unit, kondisi baterai, kelengkapan, serta ekspektasi harga penjualanmu.</p>
              </div>

              <div className={styles.stepCard}>
                <div className={styles.stepNum}>02</div>
                <h3>Kirim Detail ke WA Admin</h3>
                <p>Data form akan terformat otomatis. Kirimkan pesan tersebut ke WhatsApp Admin beserta foto/video kondisi jam tanganmu.</p>
              </div>

              <div className={styles.stepCard}>
                <div className={styles.stepNum}>03</div>
                <h3>Jadwalkan Pengecekan unit</h3>
                <p>Jika harga yang kamu ajukan cocok dan disetujui Admin, kamu akan dihubungi untuk menjadwalkan pengecekan unit.</p>
              </div>

              <div className={styles.stepCard}>
                <div className={styles.stepNum}>04</div>
                <h3>Pembayaran dan Serah Terima Unit</h3>
                <p>Jika unit lolos pengecekan dan harga final sudah disepakati, pembayaran akan langsung diproses ke rekening atau e-wallet milikmu.</p>
              </div>
            </div>

            <div className={styles.ctaBox}>
              <h3>Ingin menjual atau tukar tambah sportwatch?</h3>
              <p>Isi formulir penawaran unit kamu dalam waktu kurang dari 3 menit.</p>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                <Link href="/jual" className={styles.ctaBtn}>Ajukan Jual Unit →</Link>
              </div>
            </div>

            {/* FAQ JUAL */}
            <div className={styles.faqSection}>
              <h3 className={`${styles.sectionTitle} ${styles.display}`}>Pertanyaan Sering Diajukan (Menjual)</h3>
              <div className={styles.faqList}>
                {faqJual.map((item, idx) => (
                  <div key={idx} className={`${styles.faqItem} ${openFaq === idx ? styles.open : ''}`} onClick={() => toggleFaq(idx)}>
                    <div className={styles.faqQuestion}>
                      <span>{item.q}</span>
                      <span className={styles.faqIcon}>{openFaq === idx ? '−' : '+'}</span>
                    </div>
                    {openFaq === idx && <div className={styles.faqAnswer}>{item.a}</div>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}