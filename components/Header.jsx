"use client";

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

export default function Header({ onSearchChange }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const pathname = usePathname();
  const router = useRouter();

  const navLinks = [
    { href: '/Tamplate', label: 'Tamplate' },
    { href: '/Tambah', label: 'Tambah produk' },
  ];

  const handleSearchChange = (value) => {
    setSearchQuery(value);
    onSearchChange?.(value);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && searchQuery.trim() !== '') {
      if (pathname !== '/katalog') {
        router.push(`/katalog?search=${encodeURIComponent(searchQuery)}`);
      }
    }
  };

  return (
    <>
      <header style={{ backgroundColor: '#0d0d0c', color: '#ffffff' }}>
        <div className="wrap headbar">
          <Link href="/" className="logo">
            {/* Logo Desktop */}
            <img 
              src="/dekstop.png" 
              alt="Donstore Logo Desktop" 
              className="logo-desktop"
            />
            {/* Logo Mobile */}
            <img 
              src="/hp.png" 
              alt="Donstore Logo Mobile" 
              className="logo-mobile"
            />
          </Link>

          {/* Search Bar Container - DIBERSIHKAN DARI BORDER KOTAK LUAR */}
          <div 
            className="search" 
            style={{ 
              border: 'none', 
              outline: 'none', 
              background: 'transparent',
              backgroundColor: 'transparent',
              padding: 0,
              boxShadow: 'none'
            }}
          >
            <div 
              className="search-input-wrap"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                width: '100%',
                maxWidth: '360px',
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '999px',
                padding: '8px 16px',
                color: '#ffffff'
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0 }}>
                <circle cx="11" cy="11" r="7" />
                <path d="m21 21-4.3-4.3" />
              </svg>
              <input
                type="text"
                placeholder="Cari produk... (Tekan Enter)"
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                onKeyDown={handleKeyDown}
                autoComplete="off"
                autoCorrect="off"
                spellCheck="false"
                style={{
                  border: 'none',
                  outline: 'none',
                  background: 'transparent',
                  backgroundColor: 'transparent',
                  color: '#ffffff',
                  width: '100%',
                  fontSize: '14px'
                }}
              />
            </div>
          </div>

          <nav className="desktop-nav">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} className={pathname === link.href ? "active" : ""}>
                {link.label}
              </Link>
            ))}
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <circle cx="12" cy="8" r="4" />
              <path d="M4 20c0-4 3.6-6 8-6s8 2 8 6" strokeLinecap="round" />
            </svg>
          </nav>

          <div className="menu-btn" onClick={() => setMenuOpen(!menuOpen)}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              {menuOpen ? <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" /> : <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />}
            </svg>
          </div>
        </div>
      </header>

      {menuOpen && (
        <div className="mobile-overlay" onClick={() => setMenuOpen(false)} />
      )}

      <aside className={`mobile-sidebar ${menuOpen ? 'open' : ''}`}>
        <div className="sidebar-head">
          <span>Menu</span>
          <button onClick={() => setMenuOpen(false)}>✕</button>
        </div>
        {navLinks.map((link) => (
          <Link key={link.href} href={link.href} onClick={() => setMenuOpen(false)}>
            {link.label}
          </Link>
        ))}
        <hr />
        <div className="sidebar-account">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <circle cx="12" cy="8" r="4" />
            <path d="M4 20c0-4 3.6-6 8-6s8 2 8 6" strokeLinecap="round" />
          </svg>
          <span>Akun Saya</span>
        </div>
      </aside>
    </>
  );
}