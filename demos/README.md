# Webmu Demo Pages — Portfolio untuk Penjualan

Tiga halaman demo landing page untuk segmen target Webmu (SMB Indonesia).
Dibuat dengan design system per-segmen via ui-ux-pro-max skill.

## Struktur
- `mockups/` — source HTML final (production-quality, siap host)
- `screenshots/` — tangkapan layar (desktop full, mobile full, above-the-fold)

## Demo
| Segmen | File | Design system |
|---|---|---|
| Bakery (Roti & Kue) | `mockups/bakery.html` | Artisan warm — #92400E/#FEF3C7, Amatic SC + Cabin |
| Klinik | `mockups/clinic.html` | Accessible & Ethical — #0891B2/#059669, Figtree + Noto Sans |
| Wedding Vendor | `mockups/wedding.html` | Soft UI Evolution — #DB2777/#A16207, Great Vibes + Cormorant Infant |

## QA Checklist (lolos semua)
- [x] Kontras teks 4.5:1 (WCAG AA)
- [x] Focus states visible, skip-link (clinic)
- [x] prefers-reduced-motion dihormati
- [x] Responsive 375/768/1024/1440px — tanpa horizontal overflow
- [x] SVG icons (bukan emoji), touch target ≥48px
- [x] Copy Bahasa Indonesia, SEO title + meta description
- [x] CTA WhatsApp dengan nomor placeholder

## Catatan QA tool (BR-06)
- Generasi via tool tertunda: `gemini-flash-latest` free tier mengalami
  503/timeout (>90s) saat payload gambar besar, sedangkan
  `gemini-flash-lite-latest` merespons 2s. Kandidat fix: model fallback ringan
  atau kompresi input. Dicatat sebagai datapoint untuk perbaikan tool.
