// ============================================================
// Arti Air Con — PDF Receipt Generator (jsPDF-based)
// UI/UX premium design — branded, professional A4 layout
// ============================================================

import { jsPDF } from "jspdf";
import { ServiceBooking } from "@/types";

// Brand colours (matching app palette)
const BRAND = {
  primary: [0, 122, 204] as [number, number, number],       // #007ACC deep blue
  primaryDark: [0, 82, 155] as [number, number, number],    // #00529B
  accent: [14, 165, 233] as [number, number, number],       // #0EA5E9 sky
  white: [255, 255, 255] as [number, number, number],
  lightBg: [240, 249, 255] as [number, number, number],     // #F0F9FF
  textDark: [17, 24, 39] as [number, number, number],       // #111827
  textMid: [71, 85, 105] as [number, number, number],       // #475569
  textLight: [148, 163, 184] as [number, number, number],   // #94A3B8
  border: [219, 234, 254] as [number, number, number],      // #DBEAFE
  green: [22, 163, 74] as [number, number, number],         // #16A34A
  greenBg: [220, 252, 231] as [number, number, number],     // #DCFCE7
  yellow: [161, 98, 7] as [number, number, number],
  yellowBg: [254, 249, 195] as [number, number, number],
  red: [220, 38, 38] as [number, number, number],
  redBg: [254, 226, 226] as [number, number, number],
};

function statusColor(status: string): { text: [number, number, number]; bg: [number, number, number] } {
  switch (status) {
    case "COMPLETED":   return { text: BRAND.green, bg: BRAND.greenBg };
    case "CANCELLED":   return { text: BRAND.red,   bg: BRAND.redBg };
    default:            return { text: BRAND.yellow, bg: BRAND.yellowBg };
  }
}

function formatDateTime(dateStr?: string) {
  if (!dateStr) return "—";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleString("en-IN", {
      day: "2-digit", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit", hour12: true,
    });
  } catch { return dateStr; }
}

// Helper function to render the branded Snowflake Logo (Blue rounded box + white vector snowflake)
function drawSnowflakeLogo(doc: jsPDF, x: number, y: number, size: number) {
  // 1. Outer white rounded card container
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(x, y, size, size, 6, 6, "F");

  // 2. Inner vibrant blue rounded logo box (#0066FF)
  const pad = 2;
  const bx = x + pad;
  const by = y + pad;
  const bSize = size - pad * 2;
  doc.setFillColor(0, 102, 255);
  doc.roundedRect(bx, by, bSize, bSize, 4.5, 4.5, "F");

  // 3. Center coordinates for vector snowflake
  const cx = bx + bSize / 2;
  const cy = by + bSize / 2;

  // Snowflake line properties
  doc.setDrawColor(255, 255, 255);
  doc.setLineWidth(0.85);

  const numSpokes = 6;
  const rArm = 7.2;
  const rBranch = 4.8;
  const bLen = 2.1;
  const rHex = 2.2;

  // Draw 6 radial arms & V-barbs
  for (let i = 0; i < numSpokes; i++) {
    const angle = (i * Math.PI) / 3;
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);

    // Main spoke line
    const endX = cx + rArm * cos;
    const endY = cy + rArm * sin;
    doc.line(cx, cy, endX, endY);

    // V-barbs at outer branch point
    const branchX = cx + rBranch * cos;
    const branchY = cy + rBranch * sin;

    const angle1 = angle + Math.PI / 4;
    const angle2 = angle - Math.PI / 4;

    doc.line(branchX, branchY, branchX + bLen * Math.cos(angle1), branchY + bLen * Math.sin(angle1));
    doc.line(branchX, branchY, branchX + bLen * Math.cos(angle2), branchY + bLen * Math.sin(angle2));
  }

  // Draw central hexagonal ring
  for (let i = 0; i < numSpokes; i++) {
    const a1 = (i * Math.PI) / 3;
    const a2 = ((i + 1) * Math.PI) / 3;

    const x1 = cx + rHex * Math.cos(a1);
    const y1 = cy + rHex * Math.sin(a1);
    const x2 = cx + rHex * Math.cos(a2);
    const y2 = cy + rHex * Math.sin(a2);

    doc.line(x1, y1, x2, y2);
  }

  // Center solid white core dot
  doc.setFillColor(255, 255, 255);
  doc.circle(cx, cy, 0.7, "F");
}

// ────────────────────────────────────────────────────────────
export function generateReceiptPDF(booking: ServiceBooking, customerName?: string, technicianName?: string) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const W = doc.internal.pageSize.getWidth();   // 210
  const H = doc.internal.pageSize.getHeight();  // 297

  // ── BACKGROUND ──────────────────────────────────────────
  doc.setFillColor(...BRAND.white);
  doc.rect(0, 0, W, H, "F");

  // ── HEADER GRADIENT BLOCK ────────────────────────────────
  // Deep blue top bar
  doc.setFillColor(...BRAND.primaryDark);
  doc.rect(0, 0, W, 52, "F");

  // Decorative accent circle (top-right)
  doc.setFillColor(...BRAND.primary);
  doc.circle(W - 10, -6, 34, "F");

  // Lighter accent stripe at bottom of header
  doc.setFillColor(...BRAND.accent);
  doc.rect(0, 52, W, 3, "F");

  // ── COMPANY LOGO AREA ────────────────────────────────────
  drawSnowflakeLogo(doc, 14, 10, 28);

  // Company name
  doc.setTextColor(...BRAND.white);
  doc.setFontSize(17);
  doc.setFont("helvetica", "bold");
  doc.text("ARTI AIR CON", 47, 22);

  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(186, 230, 253); // lighter blue
  doc.text("Professional Air Conditioning Services", 47, 28.5);

  // ── "TAX INVOICE" LABEL (right side of header) ──────────
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...BRAND.white);
  doc.text("TAX INVOICE", W - 14, 22, { align: "right" });

  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(186, 230, 253);
  doc.text("Includes 18% GST", W - 14, 28.5, { align: "right" });

  // ── META INFO STRIP ──────────────────────────────────────
  doc.setFillColor(...BRAND.lightBg);
  doc.rect(0, 55, W, 26, "F");

  const metaY = 66;

  // Booking Code pill
  doc.setFillColor(...BRAND.primary);
  doc.roundedRect(14, 58, 65, 12, 3, 3, "F");
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...BRAND.white);
  doc.text(`BOOKING #${booking.bookingCode}`, 46.5, 65.5, { align: "center" });

  // Receipt date & download date
  doc.setTextColor(...BRAND.textMid);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  const today = new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" });
  doc.text(`Receipt Date: ${today}`, W - 14, metaY - 5, { align: "right" });

  const sched = formatDateTime(booking.preferredDateTime);
  doc.text(`Service Date: ${sched}`, W - 14, metaY + 1, { align: "right" });

  // ── TWO-COLUMN INFO SECTION ──────────────────────────────
  const boxTop = 87;
  const boxH = 52;
  const col1X = 14, col2X = W / 2 + 5;
  const colW = W / 2 - 19;

  // Left card — Bill To
  doc.setFillColor(249, 250, 251);
  doc.roundedRect(col1X, boxTop, colW, boxH, 4, 4, "F");
  doc.setDrawColor(...BRAND.border);
  doc.setLineWidth(0.4);
  doc.roundedRect(col1X, boxTop, colW, boxH, 4, 4, "S");

  // Left card header bar
  doc.setFillColor(...BRAND.primary);
  doc.roundedRect(col1X, boxTop, colW, 10, 4, 4, "F");
  doc.rect(col1X, boxTop + 5, colW, 5, "F"); // fill bottom corners
  doc.setFontSize(7.5);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...BRAND.white);
  doc.text("BILL TO", col1X + 5, boxTop + 7);

  const cName = customerName || booking.fullName;
  const li = (label: string, value: string, y: number) => {
    doc.setFontSize(7);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...BRAND.textMid);
    doc.text(label, col1X + 5, y);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...BRAND.textDark);
    doc.text(value, col1X + 28, y);
  };
  li("Name", cName, boxTop + 19);
  li("Mobile", booking.mobileNumber, boxTop + 27);
  li("Address", booking.fullAddress?.slice(0, 32) || "—", boxTop + 35);
  li("City", `${booking.city} - ${booking.pincode}`, boxTop + 43);

  // Right card — Service By
  doc.setFillColor(249, 250, 251);
  doc.roundedRect(col2X, boxTop, colW, boxH, 4, 4, "F");
  doc.setDrawColor(...BRAND.border);
  doc.roundedRect(col2X, boxTop, colW, boxH, 4, 4, "S");

  doc.setFillColor(...BRAND.primaryDark);
  doc.roundedRect(col2X, boxTop, colW, 10, 4, 4, "F");
  doc.rect(col2X, boxTop + 5, colW, 5, "F");
  doc.setFontSize(7.5);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...BRAND.white);
  doc.text("SERVICE BY", col2X + 5, boxTop + 7);

  const ri = (label: string, value: string, y: number) => {
    doc.setFontSize(7);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...BRAND.textMid);
    doc.text(label, col2X + 5, y);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...BRAND.textDark);
    doc.text(value, col2X + 28, y);
  };
  ri("Company", "Arti Air Con Pvt. Ltd.", boxTop + 19);
  ri("Technician", booking.technicianName || technicianName || "Nitesh Kumar Sharma", boxTop + 27);
  ri("Email", "artiaircon@gmail.com", boxTop + 35);
  ri("Phone", "+91 9264173334", boxTop + 43);

  // ── SERVICE DETAILS TABLE ────────────────────────────────
  const tableTop = boxTop + boxH + 10;

  // Table header
  doc.setFillColor(...BRAND.primaryDark);
  doc.roundedRect(14, tableTop, W - 28, 10, 3, 3, "F");
  doc.rect(14, tableTop + 5, W - 28, 5, "F");

  const cols = [14, 60, 105, 145, 175];
  const headers = ["Service Description", "AC Type", "AC Brand", "Qty", "Amount"];
  doc.setFontSize(7.5);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...BRAND.white);
  headers.forEach((h, i) => doc.text(h, cols[i] + 3, tableTop + 6.5));

  // Table row
  const rowY = tableTop + 10;
  doc.setFillColor(248, 250, 252);
  doc.rect(14, rowY, W - 28, 14, "F");
  doc.setDrawColor(...BRAND.border);
  doc.setLineWidth(0.3);
  doc.rect(14, rowY, W - 28, 14, "S");

  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...BRAND.textDark);
  doc.text(booking.serviceType || "AC Service", cols[0] + 3, rowY + 5.5);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(...BRAND.textMid);
  if (booking.problemDescription) {
    doc.text(booking.problemDescription.slice(0, 40), cols[0] + 3, rowY + 10.5);
  }

  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...BRAND.textDark);
  doc.text(booking.acType || "—", cols[1] + 3, rowY + 7.5);
  doc.text(booking.acBrand || "—", cols[2] + 3, rowY + 7.5);
  doc.text("1", cols[3] + 3, rowY + 7.5);
  doc.setFont("helvetica", "bold");
  doc.text(`Rs.${booking.amount || 450}`, cols[4] + 3, rowY + 7.5);

  // ── AMOUNT SUMMARY BOX ───────────────────────────────────
  const summaryX = W - 14 - 80;
  const summaryTop = rowY + 22;

  doc.setFillColor(240, 249, 255);
  doc.roundedRect(summaryX, summaryTop, 80, 52, 4, 4, "F");
  doc.setDrawColor(...BRAND.border);
  doc.setLineWidth(0.4);
  doc.roundedRect(summaryX, summaryTop, 80, 52, 4, 4, "S");

  const baseAmount = Math.round((booking.amount || 450) / 1.18);
  const gst = (booking.amount || 450) - baseAmount;

  const sumRow = (label: string, value: string, y: number, bold = false) => {
    doc.setFontSize(8);
    doc.setFont("helvetica", bold ? "bold" : "normal");
    doc.setTextColor(...BRAND.textMid);
    doc.text(label, summaryX + 6, y);
    doc.setTextColor(bold ? BRAND.primaryDark[0] : BRAND.textDark[0], bold ? BRAND.primaryDark[1] : BRAND.textDark[1], bold ? BRAND.primaryDark[2] : BRAND.textDark[2]);
    doc.text(value, summaryX + 74, y, { align: "right" });
  };

  sumRow("Subtotal (excl. GST)", `Rs.${baseAmount}`, summaryTop + 12);
  sumRow("GST @ 18%", `Rs.${gst}`, summaryTop + 21);

  // Divider
  doc.setDrawColor(...BRAND.border);
  doc.setLineWidth(0.5);
  doc.line(summaryX + 4, summaryTop + 27, summaryX + 76, summaryTop + 27);

  // Total
  doc.setFillColor(...BRAND.primaryDark);
  doc.roundedRect(summaryX, summaryTop + 29, 80, 16, 3, 3, "F");
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...BRAND.white);
  doc.text("TOTAL PAID", summaryX + 6, summaryTop + 40);
  doc.text(`Rs.${booking.amount || 450}`, summaryX + 74, summaryTop + 40, { align: "right" });

  // ── STATUS BADGE ─────────────────────────────────────────
  const sc = statusColor(booking.status);
  const statusLabel = booking.status;
  const badgeX = 14, badgeY = summaryTop;
  doc.setFillColor(...sc.bg);
  doc.roundedRect(badgeX, badgeY + 5, 40, 10, 3, 3, "F");
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...sc.text);
  doc.text(statusLabel, badgeX + 20, badgeY + 11.5, { align: "center" });

  // Payment mode label
  doc.setFontSize(7.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...BRAND.textMid);
  doc.text("Payment Mode: Cash on Service", 14, badgeY + 25);
  doc.text("Invoice Type: GST Tax Invoice", 14, badgeY + 32);

  // ── SEPARATOR LINE ────────────────────────────────────────
  const sepY = summaryTop + 82;
  doc.setDrawColor(...BRAND.border);
  doc.setLineWidth(0.6);
  doc.line(14, sepY, W - 14, sepY);

  // ── TERMS & CONDITIONS ────────────────────────────────────
  const termsY = sepY + 8;
  doc.setFontSize(7.5);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...BRAND.primary);
  doc.text("Terms & Conditions", 14, termsY);

  const terms = [
    "1. This invoice is valid only for the services mentioned above.",
    "2. Any dispute must be raised within 7 days of service completion.",
    "3. Warranty on service labour: 30 days from date of service.",
    "4. Arti Air Con is not liable for pre-existing equipment damage.",
  ];
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...BRAND.textMid);
  terms.forEach((t, i) => doc.text(t, 14, termsY + 7 + i * 6));

  // ── QR / STAMP PLACEHOLDER ───────────────────────────────
  doc.setFillColor(240, 249, 255);
  doc.roundedRect(W - 56, termsY - 5, 42, 42, 4, 4, "F");
  doc.setDrawColor(...BRAND.border);
  doc.roundedRect(W - 56, termsY - 5, 42, 42, 4, 4, "S");
  drawSnowflakeLogo(doc, W - 43, termsY - 1, 16);
  doc.setFontSize(7);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...BRAND.primaryDark);
  doc.text("Authorized Signatory", W - 35, termsY + 24, { align: "center" });
  doc.setFontSize(6);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...BRAND.textMid);
  doc.text("Arti Air Con Pvt. Ltd.", W - 35, termsY + 29, { align: "center" });

  // ── FOOTER ───────────────────────────────────────────────
  const footerY = H - 18;
  doc.setFillColor(...BRAND.primaryDark);
  doc.rect(0, footerY, W, 18, "F");

  doc.setFontSize(7.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(186, 230, 253);
  doc.text("artiaircon@gmail.com", 14, footerY + 7);
  doc.text("|", W / 2, footerY + 7, { align: "center" });
  doc.text("+91 9264173334", W / 2 + 6, footerY + 7);
  doc.text("|", W - 60, footerY + 7);
  doc.text("www.artiair.com", W - 14, footerY + 7, { align: "right" });

  doc.setFontSize(6.5);
  doc.setTextColor(148, 163, 184);
  doc.text("© 2026 Arti Air Con Pvt. Ltd. | GSTIN: 07AAXCA1234F1ZM | All Rights Reserved", W / 2, footerY + 13, { align: "center" });

  // ── WATERMARK (diagonal, light) ──────────────────────────
  doc.saveGraphicsState();
  doc.setGState(doc.GState({ opacity: 0.04 }));
  doc.setFontSize(52);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...BRAND.primaryDark);
  doc.text("ARTI AIR CON", W / 2, H / 2 + 20, { align: "center", angle: 45 });
  doc.restoreGraphicsState();

  // ── SAVE ─────────────────────────────────────────────────
  doc.save(`Arti-Air-Con-Receipt-${booking.bookingCode}.pdf`);
}
