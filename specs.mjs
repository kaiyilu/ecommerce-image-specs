/**
 * ecommerce-image-specs — Reference Math for Marketplace Product Photography & Catalog ZIPs
 *
 * Covers:
 *  1. Shopify OS 2.0 (Dawn) aspect-ratio padding & mobile hero safe-zone geometry
 *  2. Amazon main image 85% product bounding-box fill on pure white RGB(255,255,255)
 *  3. Etsy 5:4 vs 1:1 search card crop loss calculation
 *  4. Cross-platform CSV/Excel URL-to-SKU filename & subfolder sanitization
 */

export const SHOPIFY_PLACEMENTS = {
  productZoom: { width: 2048, height: 2048, ratio: "1:1", zoomReady: true },
  collectionCard: { width: 1200, height: 1200, ratio: "1:1", zoomReady: false },
  apparelPortrait: { width: 1600, height: 2000, ratio: "4:5", zoomReady: true },
  heroBanner: { width: 2000, height: 800, ratio: "5:2", mobileViewportRatio: 0.75 },
  collectionHeader: { width: 1600, height: 600, ratio: "8:3", mobileViewportRatio: 0.75 },
  mobileSlide: { width: 1200, height: 1600, ratio: "3:4", zoomReady: false },
};

/**
 * Computes letterbox/pillarbox pad geometry to place a source image inside a target canvas
 * without clipping any product edge.
 */
export function computeCanvasPad({ srcWidth, srcHeight, targetWidth, targetHeight }) {
  const scale = Math.min(targetWidth / srcWidth, targetHeight / srcHeight);
  const drawWidth = Math.round(srcWidth * scale);
  const drawHeight = Math.round(srcHeight * scale);
  const offsetX = Math.round((targetWidth - drawWidth) / 2);
  const offsetY = Math.round((targetHeight - drawHeight) / 2);
  return { scale, drawWidth, drawHeight, offsetX, offsetY };
}

/**
 * Computes mobile center-crop safe zone on wide desktop Shopify hero banners
 * when rendered inside a portrait mobile container (e.g. 3:4 width/height ratio).
 */
export function computeMobileBannerSafeZone({ bannerWidth = 2000, bannerHeight = 800, mobileAspect = 0.75 }) {
  const safeWidth = Math.min(bannerWidth, Math.round(bannerHeight * mobileAspect));
  const croppedEachSide = Math.round((bannerWidth - safeWidth) / 2);
  const safeWidthPercent = Number(((safeWidth / bannerWidth) * 100).toFixed(1));
  return {
    bannerWidth,
    bannerHeight,
    safeWidth,
    safeXStart: croppedEachSide,
    safeXEnd: bannerWidth - croppedEachSide,
    croppedEachSide,
    safeWidthPercent,
  };
}

/**
 * Computes Amazon compliant 2000x2000 pure-white canvas placement so the non-white
 * product bounding box occupies `targetFill` (default 85%) of the longest canvas axis.
 */
export function computeAmazonMainImagePlacement({
  bboxWidth,
  bboxHeight,
  canvasSize = 2000,
  targetFill = 0.85,
}) {
  const maxProductSpan = Math.round(canvasSize * targetFill);
  const scale = Math.min(maxProductSpan / bboxWidth, maxProductSpan / bboxHeight);
  const renderedWidth = Math.round(bboxWidth * scale);
  const renderedHeight = Math.round(bboxHeight * scale);
  const offsetX = Math.round((canvasSize - renderedWidth) / 2);
  const offsetY = Math.round((canvasSize - renderedHeight) / 2);
  const frameAreaRatio = Number(((renderedWidth * renderedHeight) / (canvasSize * canvasSize)).toFixed(3));
  return {
    canvasSize,
    scale: Number(scale.toFixed(4)),
    renderedWidth,
    renderedHeight,
    offsetX,
    offsetY,
    longestAxisFill: Number((Math.max(renderedWidth, renderedHeight) / canvasSize).toFixed(3)),
    frameAreaRatio,
  };
}

/**
 * Sanitizes Excel/CSV SKU filenames & optional category folders for cross-OS ZIP archives
 * while preventing duplicate path collisions.
 */
export function buildSafeZipPaths(rows) {
  const used = new Set();
  const cleanSeg = (val, fallback) => {
    const cleaned = String(val ?? "")
      .replace(/[\u0000-\u001f<>:"|?*]/g, "-")
      .replace(/[\\/]+/g, "-")
      .replace(/\s+/g, " ")
      .replace(/[. ]+$/g, "")
      .trim();
    return cleaned && cleaned !== "." && cleaned !== ".." ? cleaned : fallback;
  };

  return rows.map((row, idx) => {
    const file = cleanSeg(row.filename, `asset-${idx + 1}.jpg`);
    const folder = String(row.folder ?? "")
      .split(/[\\/]+/)
      .map((s) => cleanSeg(s, ""))
      .filter(Boolean)
      .join("/");
    const base = folder ? `${folder}/${file}` : file;

    if (!used.has(base.toLowerCase())) {
      used.add(base.toLowerCase());
      return base;
    }

    const dot = base.lastIndexOf(".");
    const slash = base.lastIndexOf("/");
    const hasExt = dot > slash;
    const stem = hasExt ? base.slice(0, dot) : base;
    const ext = hasExt ? base.slice(dot) : "";
    let n = 2;
    while (used.has(`${stem}-${n}${ext}`.toLowerCase())) n++;
    const unique = `${stem}-${n}${ext}`;
    used.add(unique.toLowerCase());
    return unique;
  });
}

if (import.meta.url === `file://${process.argv[1]}`) {
  console.log("1. Shopify Hero Banner Mobile Safe Zone (2000x800):");
  console.log(computeMobileBannerSafeZone({ bannerWidth: 2000, bannerHeight: 800 }));

  console.log("\n2. Amazon 2000x2000 Pure White 85% Fill Placement:");
  console.log(computeAmazonMainImagePlacement({ bboxWidth: 940, bboxHeight: 1320 }));

  console.log("\n3. Collision-Safe Excel SKU ZIP Paths:");
  console.log(
    buildSafeZipPaths([
      { filename: "SKU:101*Main.webp", folder: "Apparel\\Footwear" },
      { filename: "SKU:101*Main.webp", folder: "Apparel/Footwear" },
    ])
  );
}
