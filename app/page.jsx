"use client";

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import styles from './katalog.module.css';

function KatalogContent() {
  const [produk, setProduk] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorfetch, setErrorFetch] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  
  const [selectedBrand, setSelectedBrand] = useState("Semua");
  const [sortByPrice, setSortByPrice] = useState("");

  const searchParams = useSearchParams();

  useEffect(() => {
    const queryFromUrl = searchParams.get('search');
    if (queryFromUrl) {
      setSearchQuery(queryFromUrl);
    }
  }, [searchParams]);

  const fetchProduk = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/katalog");
      const resdata = await res.json();
      if (resdata.success) {
        setProduk(resdata.data);
      } else {
        setErrorFetch(resdata.massage || resdata.message || "Gagal memuat data");
      }
    } catch (error) {
      setErrorFetch("Terjadi kesalahan koneksi");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProduk();
  }, []);

  const availableBrands = ["Semua", ...Array.from(new Set(produk.map((item) => item.brand).filter(Boolean)))];

  const filteredProduk = produk.filter((item) => {
    const query = searchQuery.toLowerCase();
    const nameMatch = item.name?.toLowerCase().includes(query);
    const brandMatch = item.brand?.toLowerCase().includes(query);
    
    const matchesSearch = nameMatch || brandMatch;
    const matchesTab = selectedBrand === "Semua" || item.brand?.toUpperCase() === selectedBrand.toUpperCase();

    return matchesSearch && matchesTab;
  });

  const sortedAndFilteredProduk = [...filteredProduk].sort((a, b) => {
    const priceA = Number(a.price || 0);
    const priceB = Number(b.price || 0);

    if (sortByPrice === "low-to-high") {
      return priceA - priceB;
    } else if (sortByPrice === "high-to-low") {
      return priceB - priceA;
    }
    return 0;
  });

  return (
    <div className={styles.page}>
      <Header onSearchChange={setSearchQuery} />

      <section className={styles.products}>
        <div className={styles.wrap}>
          <div className={styles['prod-head']}>
            
          </div>

          <div className={styles['grid-produk']}>
            {loading ? (
              <p>Memuat data produk...</p>
            ) : sortedAndFilteredProduk.length === 0 ? (
              <p>
                {searchQuery || selectedBrand !== "Semua"
                  ? `Tidak ada hasil pencarian produk untuk "${searchQuery || selectedBrand}".`
                  : "Belum ada produk yang ditambahkan."}
              </p>
            ) : (
              sortedAndFilteredProduk.map((item) => {
                let firstImage = null;
                if (Array.isArray(item.images) && item.images.length > 0) {
                  firstImage = item.images[0];
                } else if (typeof item.images === 'string' && item.images.trim() !== '') {
                  firstImage = item.images.split(',')[0].trim();
                }

                return (
                  <Link href={`/main/${item.id}`} key={item.id} className={styles['card-link']}>
                    <div className={styles.card}>
                      <div className={styles.thumb}>
                        {firstImage ? (
                          <img src={firstImage} alt={item.name} />
                        ) : (
                          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--ink-dim)" strokeWidth="1.5">
                            <circle cx="12" cy="12" r="8"/>
                            <path d="M12 8v4l2.5 2.5" strokeLinecap="round"/>
                          </svg>
                        )}
                      </div>
                      <div className={styles.body}>
                        <span className={styles.brand}>{item.brand}</span>
                        <h3 className={styles.name}>{item.name}</h3>
                        <div className={styles['price-row']}>
                          <span className={styles.price}>
                            Rp{Number(item.price || 0).toLocaleString("id-ID")}
                          </span>
                          <button 
                            type="button" 
                            className={styles['add-btn']} 
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                            }}
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })
            )}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default function KatalogPage() {
  return (
    <Suspense fallback={<div>Memuat halaman...</div>}>
      <KatalogContent />
    </Suspense>
  );
}


