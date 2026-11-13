# ecommerce-image-specs

Zero-dependency JavaScript reference equations for ecommerce catalog photography, marketplace main-image compliance, and spreadsheet-to-ZIP SKU asset preparation:

1. **Shopify OS 2.0 (Dawn) Aspect Ratios & Mobile Safe Zones**: Exact pixel presets (`2048×2048` zoom square, `1600×2000` 4:5 apparel portrait, `2000×800` desktop hero banner) plus center-crop mobile viewport clipping math.
2. **Amazon Main Image `RGB(255, 255, 255)` & 85% Fill Geometry**: Bounding-box scaling onto a `2000×2000` pure white canvas so the product's longest axis hits the recommended `85%` frame fill without touching outer margins.
3. **Etsy `5:4` & `1:1` Search Card Safe Padding**: Preventing clipped typography, framing, and craft details across desktop search grids and mobile app thumbnails.
4. **Spreadsheet URL-to-SKU ZIP Sanitization**: Cross-platform (`Windows` / `macOS`) reserved character stripping, nested folder normalization, and collision-safe suffixing when batch downloading supplier files from Excel or CSV.

## Live Browser Tools (Zero Login, 100% Client-Side Canvas / ZIP)

- **Shopify Size Studio & Safe-Zone Simulator**: [https://usequickkit.com/shopify-image-size-guide](https://usequickkit.com/shopify-image-size-guide)
- **Shopify Single Product Image Resizer**: [https://usequickkit.com/shopify-product-image-resizer](https://usequickkit.com/shopify-product-image-resizer)
- **Shopify Bulk Image Resizer (Batch ZIP + Manifest)**: [https://usequickkit.com/shopify-bulk-image-resizer](https://usequickkit.com/shopify-bulk-image-resizer)
- **Amazon Main Image Checker & 1-Click 85% White Fix**: [https://usequickkit.com/amazon-main-image-checker](https://usequickkit.com/amazon-main-image-checker)
- **Etsy Listing Photo Crop Checker & Safe Pad**: [https://usequickkit.com/etsy-listing-photo-checker](https://usequickkit.com/etsy-listing-photo-checker)
- **Download Multiple Files from Excel URLs (ZIP Guide & Tool)**: [https://usequickkit.com/how-to-download-files-from-excel-urls](https://usequickkit.com/how-to-download-files-from-excel-urls)
- **Bulk Download Product Images by SKU**: [https://usequickkit.com/bulk-download-product-images-by-sku](https://usequickkit.com/bulk-download-product-images-by-sku)
- **CSV / Excel Bulk File Downloader**: [https://usequickkit.com/bulk-file-downloader](https://usequickkit.com/bulk-file-downloader)

## Quick Start

```bash
node specs.mjs
```

## Key Reference Equations

### 1. Mobile Center-Crop Safe Width on Wide Shopify Banners

When a wide desktop hero banner ($W \times H$, e.g. $2000 \times 800$) renders inside a portrait mobile container with aspect ratio $r_m = W_m / H_m \approx 0.75$ at full container height:

$$W_{\text{safe}} = \min(W,\; \operatorname{round}(H \cdot r_m)), \qquad X_{\text{margin}} = \frac{W - W_{\text{safe}}}{2}$$

For a $2000 \times 800$ banner at $r_m = 0.75$, only the central $600\text{ px}$ ($30\%$) survives uncropped on narrow mobile screens, trimming $700\text{ px}$ from both left and right edges.

### 2. Amazon 85% Longest-Axis Product Fill

Given a detected non-white product bounding box $(w_b, h_b)$ and target square canvas $S = 2000\text{ px}$:

$$k = \min\!\left(\frac{0.85\,S}{w_b},\; \frac{0.85\,S}{h_b}\right), \qquad (x_0, y_0) = \left(\frac{S - k w_b}{2},\; \frac{S - k h_b}{2}\right)$$

### 3. Extracting Raw URLs from Excel `=HYPERLINK()` Cells

When supplier sheets store clickable anchor text instead of literal `https://` strings, extract plain URLs with a 4-line VBA UDF before exporting `.xlsx` or `.csv`:

```vb
Function GetURL(rng As Range) As String
    If rng.Hyperlinks.Count > 0 Then GetURL = rng.Hyperlinks(1).Address
End Function
```

## License

MIT
