
"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Header from "../../../components/Header";
import Footer from "../../../components/Footer";
import styles from "./detail.module.css";

export default function DetailProdukPage({ params }) {
  const resolvedParams = use(params);
  const productId = resolvedParams.id;
  const router = useRouter();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedImage, setSelectedImage] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        setLoading(true);

        const res = await fetch(`/api/katalog/${productId}`);
        const result = await res.json();

        if (result.success) {
          setProduct(result.data);

          let imgList = [];

          if (Array.isArray(result.data.images)) {
            imgList = result.data.images;
          } else if (typeof result.data.images === "string") {
            imgList = result.data.images
              .split(",")
              .map((img) => img.trim());
          }

          if (imgList.length > 0) {
            setSelectedImage(imgList[0]);
          }
        } else {
          setError(result.message || "Produk tidak ditemukan");
        }
      } catch (err) {
        console.error(err);
        setError("Gagal mengambil data produk");
      } finally {
        setLoading(false);
      }
    };

    if (productId) fetchDetail();
  }, [productId]);

  const formatCondition = (cond) => {
    if (!cond) return "-";

    const map = {
      BARU: "Baru",
      BEKAS_SEPERTI_BARU: "Bekas Seperti Baru (Like New)",
      BEKAS_BAIK: "Bekas Baik",
      MINUS: "Ada Minus",
    };

    return map[cond] || cond;
  };

  const renderStatusBadge = (status) => {
    const badgeStyles = {
      AVAILABLE: {
        bg: "#e6f4ea",
        color: "#137333",
        label: "Tersedia",
      },
      SOLD: {
        bg: "#fce8e6",
        color: "#c5221f",
        label: "Terjual",
      },
      RESERVED: {
        bg: "#fef7e0",
        color: "#b06000",
        label: "Booking",
      },
      UNAVAILABLE: {
        bg: "#f1f3f4",
        color: "#5f6368",
        label: "Tidak Tersedia",
      },
    };

    const current = badgeStyles[status] || badgeStyles.UNAVAILABLE;

    return (
      <span
        className={styles["status-badge"]}
        style={{
          backgroundColor: current.bg,
          color: current.color,
        }}
      >
        {current.label}
      </span>
    );
  };

  // Handler untuk menghapus produk
  const handleDelete = async () => {
    const konfirmasi = window.confirm(
      `Yakin ingin menghapus produk "${product.name}"?`
    );

    if (!konfirmasi) return;

    try {
      setDeleting(true);

      const res = await fetch(`/api/katalog/${product.id}`, {
        method: "DELETE",
      });

      const result = await res.json();

      if (!res.ok || !result.success) {
        alert(result.message || "Gagal menghapus produk");
        return;
      }

      alert("Produk berhasil dihapus");
      router.push("/");
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan saat menghapus produk");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.page}>
        <Header />
        <main className={styles["status-container"]}>
          <p className={styles["status-text"]}>
            Memuat detail produk...
          </p>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className={styles.page}>
        <Header />
        <main className={styles["status-container"]}>
          <p className={styles["error-text"]}>{error}</p>
          <Link href="/" className={styles["back-link"]}>
            &larr; Kembali ke Katalog
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  let imageList = [];

  if (Array.isArray(product.images)) {
    imageList = product.images;
  } else if (typeof product.images === "string") {
    imageList = product.images
      .split(",")
      .map((img) => img.trim())
      .filter(Boolean);
  }

  const currentImageIndex = imageList.indexOf(
    selectedImage || imageList[0]
  );

  const handlePrevImage = () => {
    if (imageList.length <= 1) return;

    const prevIndex =
      (currentImageIndex - 1 + imageList.length) % imageList.length;

    setSelectedImage(imageList[prevIndex]);
  };

  const handleNextImage = () => {
    if (imageList.length <= 1) return;

    const nextIndex =
      (currentImageIndex + 1) % imageList.length;

    setSelectedImage(imageList[nextIndex]);
  };

  const acc = product.accessoriess || {};

  return (
    <div className={styles.page}>
      <Header />

      <main className={`${styles["detail-container"]} ${styles.wrap}`}>
        {/* SECTION ATAS */}
        <div className={styles["top-hero-section"]}>
          <div className={styles["image-column"]}>
            {/* Foto Utama */}
            <div className={styles["image-container"]}>
              {selectedImage || imageList[0] ? (
                <img
                  src={selectedImage || imageList[0]}
                  alt={product.name}
                  className={styles["main-img"]}
                />
              ) : (
                <span className={styles["no-image-text"]}>
                  Tidak Ada Gambar
                </span>
              )}

              {/* Tombol Geser */}
              {imageList.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={handlePrevImage}
                    className={`${styles["nav-btn"]} ${styles["nav-prev"]}`}
                    title="Foto Sebelumnya"
                  >
                    ❮
                  </button>

                  <button
                    type="button"
                    onClick={handleNextImage}
                    className={`${styles["nav-btn"]} ${styles["nav-next"]}`}
                    title="Foto Selanjutnya"
                  >
                    ❯
                  </button>
                </>
              )}
            </div>

            {/* List Thumbnail */}
            {imageList.length > 1 && (
              <div className={styles["thumbnail-list"]}>
                {imageList.map((imgUrl, idx) => {
                  const isSelected =
                    (selectedImage || imageList[0]) === imgUrl;

                  return (
                    <button
                      key={idx}
                      onClick={() => setSelectedImage(imgUrl)}
                      className={`${styles["thumb-btn"]} ${
                        isSelected ? styles["thumb-selected"] : ""
                      }`}
                    >
                      <img
                        src={imgUrl}
                        alt={`${product.name} thumb ${idx + 1}`}
                        className={styles["thumb-img"]}
                      />
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className={styles["main-info-column"]}>
            <div className={styles["header-row"]}>
              <span className={styles["brand-text"]}>
                {product.brand}
              </span>
              {renderStatusBadge(product.status)}
            </div>

            <h1 className={styles["product-title"]}>
              {product.name}
            </h1>

            <p className={styles["product-price"]}>
              Rp{Number(product.price).toLocaleString("id-ID")}
            </p>

            {/* TOMBOL EDIT DAN HAPUS */}
            <div
              style={{
                display: "flex",
                gap: "12px",
                marginTop: "1.5rem",
              }}
            >
              <Link
                href={`/admin/edit/${product.id}`}
                style={{
                  flex: 1,
                  padding: "13px",
                  backgroundColor: "#4f6b4a",
                  color: "#fff",
                  textAlign: "center",
                  textDecoration: "none",
                  borderRadius: "10px",
                  fontWeight: "700",
                  fontSize: "14px",
                }}
              >
                ✏️ Edit Produk
              </Link>

              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                style={{
                  flex: 1,
                  padding: "13px",
                  backgroundColor: "#d94545",
                  color: "#fff",
                  border: "none",
                  borderRadius: "10px",
                  fontWeight: "700",
                  fontSize: "14px",
                  cursor: deleting ? "not-allowed" : "pointer",
                  opacity: deleting ? 0.6 : 1,
                }}
              >
                {deleting ? "Menghapus..." : "🗑️ Hapus Produk"}
              </button>
            </div>

            <hr className={styles.divider} />

            <div className={styles["description-box"]}>
              <h3 className={styles["section-title"]}>
                Deskripsi Produk
              </h3>

              <p className={styles["description-text"]}>
                {product.series?.defaultDesc ||
                  product.description ||
                  "Tidak ada deskripsi produk."}
              </p>
            </div>
          </div>
        </div>

        {/* SECTION BAWAH */}
        <div className={styles["bottom-spec-section"]}>
          <div className={styles["card-box"]}>
            <h3 className={styles["section-title"]}>
              Spesifikasi & Kondisi Unit
            </h3>

            <div className={styles["spec-grid"]}>
              <div>
                <span className={styles["spec-label"]}>
                  Kondisi Umur Unit
                </span>
                <b>{product.unitAge || "-"}</b>
              </div>

              <div>
                <span className={styles["spec-label"]}>
                  Kondisi Umum
                </span>
                <b>{formatCondition(product.condition)}</b>
              </div>

              <div>
                <span className={styles["spec-label"]}>
                  Kondisi Fisik
                </span>
                <b>{formatCondition(product.physicalCondition)}</b>
              </div>

              <div>
                <span className={styles["spec-label"]}>
                  Kondisi Layar
                </span>
                <b>{formatCondition(product.screenCondition)}</b>
              </div>

              <div>
                <span className={styles["spec-label"]}>
                  Kondisi Baterai
                </span>
                <b>{formatCondition(product.batteryCondition)}</b>
              </div>

              <div>
                <span className={styles["spec-label"]}>
                  Kondisi Strap
                </span>
                <b>{formatCondition(product.strapCondition)}</b>
              </div>

              <div>
                <span className={styles["spec-label"]}>
                  Tes Baterai
                </span>
                <b>{product.batteryTest || "-"}</b>
              </div>

              <div>
                <span className={styles["spec-label"]}>
                  Tipe Garansi
                </span>
                <b>{product.warrantyType || "-"}</b>
              </div>

              <div>
                <span className={styles["spec-label"]}>
                  Garansi Pabrik Hingga
                </span>
                <b>
                  {product.manufacturerWarrantyUntil
                    ? new Date(
                        product.manufacturerWarrantyUntil
                      ).toLocaleDateString("id-ID")
                    : "-"}
                </b>
              </div>
            </div>

            {product.defects && (
              <div className={styles["defects-box"]}>
                <b className={styles["defects-title"]}>
                  Catatan Minus / Defect:
                </b>
                <p className={styles["defects-text"]}>
                  {product.defects}
                </p>
              </div>
            )}
          </div>

          <div className={styles["bottom-grid-two"]}>
            <div className={styles["card-box"]}>
              <h3 className={styles["section-title"]}>
                Kelengkapan (Paket Pembelian)
              </h3>

              <div className={styles["acc-grid"]}>
                <div>{acc.charger ? "✅" : "❌"} Charger</div>
                <div>{acc.box ? "✅" : "❌"} Box / Dus</div>
                <div>{acc.manual ? "✅" : "❌"} Buku Panduan</div>
                <div>{acc.warrantyCard ? "✅" : "❌"} Kartu Garansi</div>
                <div>{acc.invoice ? "✅" : "❌"} Nota / Invoice</div>
              </div>

              {acc.packageContents && (
                <div className={styles["acc-detail"]}>
                  <b>Isi Paket Tambahan:</b> {acc.packageContents}
                </div>
              )}

              {acc.additionalAccessories && (
                <div className={styles["acc-detail"]}>
                  <b>Aksesori Tambahan:</b>{" "}
                  {acc.additionalAccessories}
                </div>
              )}
            </div>

            <div className={styles["card-box"]}>
              <h3 className={styles["section-title"]}>
                Informasi Tambahan
              </h3>

              <div className={styles["info-list"]}>
                <div>
                  <b>ID Produk:</b>{" "}
                  <span className={styles["id-text"]}>
                    {product.id}
                  </span>
                </div>

                <div>
                  <b>Dibuat Pada:</b>{" "}
                  {new Date(product.createdAt).toLocaleDateString(
                    "id-ID"
                  )}
                </div>

                <div>
                  <b>Terakhir Diperbarui:</b>{" "}
                  {new Date(product.updatedAt).toLocaleDateString(
                    "id-ID"
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
