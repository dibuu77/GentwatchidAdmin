"use client";

import Link from 'next/link';
import './footer.css';

export default function Footer() {
  return (
    <footer className="main-footer">
      <div className="wrap footer-grid">
        
        {/* Kolom 1: Brand & Bio Singkat */}
        <div className="footer-brand">
          <div className="footer-logo">
            <img 
              src="/dekstop.png" 
              alt="Donstore Logo" 
              style={{ width: '140px', height: 'auto', objectFit: 'contain' }} 
            />
          </div>
          <p className="footer-desc">
            Platform spesialis jual, beli, dan tukar tambah sportwatch second berkualitas & terpercaya. Semua unit melewati pengecekan fungsi lengkap sebelum dikirim.
          </p>
        </div>

        {/* Kolom 2: Navigasi Utama */}
        <div className="footer-links">
          <h4 className="footer-title">Navigasi</h4>
          <ul>
            <li><Link href="/katalog">Katalog Produk</Link></li>
            <li><Link href="/jual">Jual Unit</Link></li>
            <li><Link href="/trade-in">Tukar Tambah</Link></li>
            <li><Link href="/panduan">Panduan Jual-Beli</Link></li>
          </ul>
        </div>

        {/* Kolom 3: Brand Populer */}
        <div className="footer-links">
          <h4 className="footer-title">Merek Populer</h4>
          <ul>
            <li><Link href="/katalog?search=Garmin">Garmin</Link></li>
            <li><Link href="/katalog?search=Coros">Coros</Link></li>
          </ul>
        </div>

        {/* Kolom 4: Kontak Admin */}
        <div className="footer-links">
          <h4 className="footer-title">Layanan Admin</h4>
          <p className="footer-contact">
            <b>WhatsApp Admin:</b><br />
            <a href="https://wa.me/6281320718854" target="_blank" rel="noreferrer">
              +62 813-2071-8854
            </a>
          </p>
          <p className="footer-contact" style={{ marginTop: '12px' }}>
            <b>Respons Admin:</b><br />
            24 Jam Siap Melayani
          </p>
        </div>

      </div>

      {/* Baris Copyright Bawah */}
      <div className="footer-bottom">
        <div className="wrap">
          <p>© {new Date().getFullYear()} Gent.watchid — JUAL · BELI · SPORTWATCH · SEJAK 2026</p>
        </div>
      </div>
    </footer>
  );
}