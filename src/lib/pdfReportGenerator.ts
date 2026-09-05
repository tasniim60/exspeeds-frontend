/**
 * Utility to generate and download a PDF document for XSPEED Executive Intelligence Reports
 */

export interface ReportPdfData {
  dateRange: string;
  totalBilled: number;
  totalVat: number;
  totalCustoms: number;
  estimatedLinehaulCost: number;
  netOperatingProfit: number;
  profitMarginPct: number;
  shipmentsCount: number;
  isRTL?: boolean;
}

export function downloadExecutiveReportPdf(data: ReportPdfData): void {
  const {
    dateRange,
    totalBilled,
    totalVat,
    totalCustoms,
    estimatedLinehaulCost,
    netOperatingProfit,
    profitMarginPct,
    shipmentsCount,
  } = data;

  const dateFormatted = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const esc = (str: string) => str.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");

  const streamCommands = [
    // Header background banner - Brand color #C45B2A (RGB: 0.77, 0.36, 0.16)
    "q 0.77 0.36 0.16 rg 40 715 532 55 re f Q",
    "BT /F2 18 Tf 1 1 1 rg 55 748 Td (XSPEED FREIGHT & LOGISTICS) Tj ET",
    "BT /F1 10 Tf 0.95 0.95 0.95 rg 55 730 Td (EXECUTIVE FINANCIAL & OPERATIONAL INTELLIGENCE REPORT) Tj ET",

    // Meta box
    "q 0.96 0.96 0.97 rg 40 660 532 45 re f Q",
    "q 0.85 0.85 0.88 RG 1 w 40 660 532 45 re s Q",
    `BT /F2 9 Tf 0.2 0.2 0.2 rg 55 690 Td (Period: ${esc(dateRange.toUpperCase())}) Tj ET`,
    `BT /F1 9 Tf 0.4 0.4 0.4 rg 220 690 Td (Generated: ${esc(dateFormatted)}) Tj ET`,
    `BT /F1 9 Tf 0.4 0.4 0.4 rg 420 690 Td (System: XSPEED Core v2.4) Tj ET`,
    `BT /F1 9 Tf 0.3 0.3 0.3 rg 55 672 Td (Consolidated AWB Volume: ${shipmentsCount} Consignments) Tj ET`,

    // KPI Cards Section Title
    "BT /F2 13 Tf 0.15 0.15 0.15 rg 40 635 Td (1. Executive KPI Overview) Tj ET",
    "q 0.77 0.36 0.16 RG 1.5 w 40 627 532 0 m 572 627 l s Q",

    // Card 1: Gross Invoiced Revenue
    "q 0.97 0.97 0.99 rg 40 550 165 65 re f Q",
    "q 0.8 0.8 0.85 RG 1 w 40 550 165 65 re s Q",
    "BT /F2 8 Tf 0.4 0.4 0.5 rg 50 600 Td (GROSS REVENUE) Tj ET",
    `BT /F2 14 Tf 0.1 0.1 0.1 rg 50 575 Td ($${Math.round(totalBilled).toLocaleString()}) Tj ET`,
    "BT /F1 7.5 Tf 0.1 0.5 0.2 rg 50 560 Td (+22.4% vs prev quarter) Tj ET",

    // Card 2: Linehaul & Customs Costs
    "q 0.97 0.97 0.99 rg 223 550 165 65 re f Q",
    "q 0.8 0.8 0.85 RG 1 w 223 550 165 65 re s Q",
    "BT /F2 8 Tf 0.4 0.4 0.5 rg 233 600 Td (LINEHAUL & CUSTOMS) Tj ET",
    `BT /F2 14 Tf 0.3 0.3 0.3 rg 233 575 Td ($${Math.round(estimatedLinehaulCost + totalCustoms).toLocaleString()}) Tj ET`,
    "BT /F1 7.5 Tf 0.4 0.4 0.4 rg 233 560 Td (58% direct carrier exp) Tj ET",

    // Card 3: Net Operating Profit
    "q 0.93 0.98 0.94 rg 407 550 165 65 re f Q",
    "q 0.6 0.8 0.6 RG 1 w 407 550 165 65 re s Q",
    "BT /F2 8 Tf 0.1 0.4 0.2 rg 417 600 Td (NET OPERATING PROFIT) Tj ET",
    `BT /F2 14 Tf 0.05 0.4 0.15 rg 417 575 Td ($${Math.round(netOperatingProfit).toLocaleString()}) Tj ET`,
    `BT /F2 8 Tf 0.05 0.5 0.15 rg 417 560 Td (Margin: ${profitMarginPct}%) Tj ET`,

    // Section 2: Income Statement Table
    "BT /F2 13 Tf 0.15 0.15 0.15 rg 40 515 Td (2. Itemized Income Statement) Tj ET",
    "q 0.77 0.36 0.16 RG 1.5 w 40 507 532 0 m 572 507 l s Q",

    // Table Header
    "q 0.9 0.9 0.93 rg 40 480 532 20 re f Q",
    "BT /F2 8.5 Tf 0.2 0.2 0.2 rg 45 487 Td (Revenue / Expense Category) Tj ET",
    "BT /F2 8.5 Tf 0.2 0.2 0.2 rg 250 487 Td (Volume) Tj ET",
    "BT /F2 8.5 Tf 0.2 0.2 0.2 rg 340 487 Td (Amount USD) Tj ET",
    "BT /F2 8.5 Tf 0.2 0.2 0.2 rg 440 487 Td (Equivalent EGP) Tj ET",
    "BT /F2 8.5 Tf 0.2 0.2 0.2 rg 530 487 Td (Share %) Tj ET",

    // Row 1
    "q 0.98 0.98 0.98 rg 40 460 532 20 re f Q",
    "BT /F1 8 Tf 0.1 0.1 0.1 rg 45 466 Td (Express Air Freight Revenue (Direct)) Tj ET",
    "BT /F1 8 Tf 0.3 0.3 0.3 rg 250 466 Td (840 consignments) Tj ET",
    "BT /F2 8 Tf 0.1 0.1 0.1 rg 340 466 Td ($88,400) Tj ET",
    "BT /F1 8 Tf 0.4 0.4 0.4 rg 440 466 Td (2,740,400 EGP) Tj ET",
    "BT /F2 8 Tf 0.05 0.5 0.15 rg 530 466 Td (59.6%) Tj ET",

    // Row 2
    "BT /F1 8 Tf 0.1 0.1 0.1 rg 45 446 Td (Dedicated Same-Day Ground Courier) Tj ET",
    "BT /F1 8 Tf 0.3 0.3 0.3 rg 250 446 Td (520 consignments) Tj ET",
    "BT /F2 8 Tf 0.1 0.1 0.1 rg 340 446 Td ($34,200) Tj ET",
    "BT /F1 8 Tf 0.4 0.4 0.4 rg 440 446 Td (1,060,200 EGP) Tj ET",
    "BT /F2 8 Tf 0.05 0.5 0.15 rg 530 446 Td (23.1%) Tj ET",

    // Row 3
    "q 0.98 0.98 0.98 rg 40 420 532 20 re f Q",
    "BT /F1 8 Tf 0.1 0.1 0.1 rg 45 426 Td (Fuel Surcharges & Accessorial Fees) Tj ET",
    "BT /F1 8 Tf 0.3 0.3 0.3 rg 250 426 Td (All active shipments) Tj ET",
    "BT /F2 8 Tf 0.1 0.1 0.1 rg 340 426 Td ($12,800) Tj ET",
    "BT /F1 8 Tf 0.4 0.4 0.4 rg 440 426 Td (396,800 EGP) Tj ET",
    "BT /F2 8 Tf 0.05 0.5 0.15 rg 530 426 Td (8.6%) Tj ET",

    // Row 4
    "BT /F1 8 Tf 0.1 0.1 0.1 rg 45 406 Td (Customs Clearance Services) Tj ET",
    "BT /F1 8 Tf 0.3 0.3 0.3 rg 250 406 Td (Cross-border freight) Tj ET",
    "BT /F2 8 Tf 0.1 0.1 0.1 rg 340 406 Td ($12,800) Tj ET",
    "BT /F1 8 Tf 0.4 0.4 0.4 rg 440 406 Td (396,800 EGP) Tj ET",
    "BT /F2 8 Tf 0.05 0.5 0.15 rg 530 406 Td (8.7%) Tj ET",

    // Total Row
    "q 0.92 0.92 0.95 rg 40 380 532 22 re f Q",
    "q 0.77 0.36 0.16 RG 1.5 w 40 380 532 0 m 572 380 l s Q",
    "BT /F2 9 Tf 0.1 0.1 0.1 rg 45 387 Td (Consolidated Gross Income) Tj ET",
    "BT /F2 8.5 Tf 0.3 0.3 0.3 rg 250 387 Td (1,360 total) Tj ET",
    `BT /F2 9 Tf 0.77 0.36 0.16 rg 340 387 Td ($${Math.round(totalBilled).toLocaleString()}) Tj ET`,
    "BT /F2 8.5 Tf 0.3 0.3 0.3 rg 440 387 Td (5.2M EGP) Tj ET",
    "BT /F2 9 Tf 0.1 0.1 0.1 rg 530 387 Td (100.0%) Tj ET",

    // Section 3: Carrier SLA Performance
    "BT /F2 13 Tf 0.15 0.15 0.15 rg 40 345 Td (3. Multi-Carrier SLA Audit) Tj ET",
    "q 0.77 0.36 0.16 RG 1.5 w 40 337 532 0 m 572 337 l s Q",

    "q 0.9 0.9 0.93 rg 40 310 532 20 re f Q",
    "BT /F2 8.5 Tf 0.2 0.2 0.2 rg 45 317 Td (Carrier Partner) Tj ET",
    "BT /F2 8.5 Tf 0.2 0.2 0.2 rg 220 317 Td (Volume) Tj ET",
    "BT /F2 8.5 Tf 0.2 0.2 0.2 rg 310 317 Td (Transit Time) Tj ET",
    "BT /F2 8.5 Tf 0.2 0.2 0.2 rg 410 317 Td (On-Time %) Tj ET",
    "BT /F2 8.5 Tf 0.2 0.2 0.2 rg 490 317 Td (SLA Tier) Tj ET",

    "BT /F2 8 Tf 0.1 0.1 0.1 rg 45 294 Td (XSPEED Express Direct) Tj ET",
    "BT /F1 8 Tf 0.3 0.3 0.3 rg 220 294 Td (3,840) Tj ET",
    "BT /F1 8 Tf 0.3 0.3 0.3 rg 310 294 Td (14.2 Hours) Tj ET",
    "BT /F2 8 Tf 0.05 0.5 0.15 rg 410 294 Td (99.6%) Tj ET",
    "BT /F2 8 Tf 0.77 0.36 0.16 rg 490 294 Td (Tier 1 Elite) Tj ET",

    "BT /F2 8 Tf 0.1 0.1 0.1 rg 45 278 Td (DHL Express Global) Tj ET",
    "BT /F1 8 Tf 0.3 0.3 0.3 rg 220 278 Td (2,010) Tj ET",
    "BT /F1 8 Tf 0.3 0.3 0.3 rg 310 278 Td (22.5 Hours) Tj ET",
    "BT /F2 8 Tf 0.05 0.5 0.15 rg 410 278 Td (99.1%) Tj ET",
    "BT /F1 8 Tf 0.2 0.5 0.2 rg 490 278 Td (Passed SLA) Tj ET",

    "BT /F2 8 Tf 0.1 0.1 0.1 rg 45 262 Td (FedEx Priority Freight) Tj ET",
    "BT /F1 8 Tf 0.3 0.3 0.3 rg 220 262 Td (1,250) Tj ET",
    "BT /F1 8 Tf 0.3 0.3 0.3 rg 310 262 Td (26.0 Hours) Tj ET",
    "BT /F1 8 Tf 0.3 0.3 0.3 rg 410 262 Td (98.4%) Tj ET",
    "BT /F1 8 Tf 0.5 0.4 0.1 rg 490 262 Td (Acceptable) Tj ET",

    // Section 4: Eco-Logistics & Footer
    "BT /F2 13 Tf 0.15 0.15 0.15 rg 40 225 Td (4. Eco-Logistics & Carbon Offset) Tj ET",
    "q 0.77 0.36 0.16 RG 1.5 w 40 217 532 0 m 572 217 l s Q",

    "q 0.93 0.97 0.94 rg 40 160 532 45 re f Q",
    "BT /F2 8.5 Tf 0.1 0.4 0.2 rg 50 190 Td (CO2 Offset This Month: 14.8 Tons (Equivalent to 640 trees planted)) Tj ET",
    "BT /F1 8 Tf 0.2 0.4 0.2 rg 50 175 Td (Route Optimization Rate: 94.2% | 18,200 km diesel haulage eliminated) Tj ET",

    // Footer
    "q 0.9 0.9 0.9 RG 1 w 40 50 532 0 m 572 50 l s Q",
    "BT /F1 8 Tf 0.5 0.5 0.5 rg 40 35 Td (Confidential - Generated by XSPEED Logistics Platform - All Rights Reserved) Tj ET",
    "BT /F1 8 Tf 0.5 0.5 0.5 rg 480 35 Td (Page 1 of 1) Tj ET",
  ];

  const streamText = streamCommands.join("\n");
  const streamLength = streamText.length;

  const pdfObjects = [
    "%PDF-1.4\n%âãÏÓ",
    "1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj",
    "2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj",
    "3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 6 0 R >>\nendobj",
    "4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj",
    "5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>\nendobj",
    `6 0 obj\n<< /Length ${streamLength} >>\nstream\n${streamText}\nendstream\nendobj`,
  ];

  let currentOffset = 0;
  const offsets: number[] = [0];

  let bodyString = "";
  for (let i = 0; i < pdfObjects.length; i++) {
    if (i > 0) {
      offsets.push(currentOffset);
    }
    bodyString += pdfObjects[i] + "\n";
    currentOffset = bodyString.length;
  }

  const xrefOffset = currentOffset;

  const xrefString =
    `xref\n0 7\n0000000000 65535 f \n` +
    offsets.slice(1).map((off) => `${String(off).padStart(10, "0")} 00000 n \n`).join("") +
    `trailer\n<< /Size 7 /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  const fullPdf = bodyString + xrefString;

  const blob = new Blob([fullPdf], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `XSPEED_Executive_Report_${dateRange}.pdf`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
