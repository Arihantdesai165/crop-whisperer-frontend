// src/utils/pdfGenerator.tsx
import jsPDF from "jspdf";

/**
 * Options:
 *  - logoDataUrl?: string (optional base64/data URL or image URL)
 *  - landscape?: boolean (optional)
 */
export async function generateYieldPredictionPDF(
  formData: any,
  result: any,
  options?: { logoDataUrl?: string; landscape?: boolean }
) {
  try {
    // Ensure values are strings
    const s = (v: any) => (v === undefined || v === null ? "" : String(v));

    const orientation = options?.landscape ? "landscape" : "portrait";
    const doc = new jsPDF({ unit: "pt", format: "a4", orientation });

    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 40;
    let y = 40;

    // Load logo if provided (dataURL). If it's a regular URL, try to fetch and convert.
    async function loadImage(dataUrlOrUrl?: string) {
      if (!dataUrlOrUrl) return null;
      // if already data url
      if (dataUrlOrUrl.startsWith("data:")) return dataUrlOrUrl;
      // try fetching and convert to blob -> dataURL
      try {
        const resp = await fetch(dataUrlOrUrl);
        const blob = await resp.blob();
        return await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(String(reader.result));
          reader.onerror = (e) => reject(e);
          reader.readAsDataURL(blob);
        });
      } catch (err) {
        // ignore
        return null;
      }
    }

    const logoDataUrl = await loadImage(options?.logoDataUrl);

    // ---------- Header ----------
    doc.setFillColor(18, 97, 49); // dark green
    doc.rect(0, 0, pageWidth, 72, "F");

    if (logoDataUrl) {
      // left logo
      try {
        doc.addImage(logoDataUrl, "PNG", margin, 12, 48, 48, undefined, "FAST");
      } catch (e) {
        // ignore image errors
      }
    }

    doc.setFontSize(20);
    doc.setTextColor(255, 255, 255);
    doc.text("Crop Yield Prediction Report", margin + (logoDataUrl ? 60 : 0), 40);

    // small subtitle on right
    doc.setFontSize(10);
    doc.text(
      `Generated: ${new Date().toLocaleDateString()}`,
      pageWidth - margin - 160,
      40,
      { align: "right" }
    );

    y = 90;

    // ---------- Left: Farm details box ----------
    const leftColX = margin;
    const leftColW = pageWidth * 0.46 - margin;
    const rightColX = pageWidth * 0.52;
    const boxPadding = 12;

    // Farm details card
    doc.setFillColor(249, 250, 249);
    doc.setDrawColor(220, 225, 220);
    doc.roundedRect(leftColX, y, leftColW, 220, 6, 6, "FD");

    doc.setFontSize(12);
    doc.setTextColor(34, 49, 32);
    doc.text("Farm & Crop Details", leftColX + boxPadding, y + 20);

    doc.setFontSize(10);
    doc.setTextColor(80, 80, 80);
    let ly = y + 40;
    const lineH = 16;
    const push = (label: string, value: string | number) => {
      doc.text(`${label}`, leftColX + boxPadding, ly);
      doc.text(String(value), leftColX + leftColW - boxPadding, ly, {
        align: "right",
      });
      ly += lineH;
    };

    push("Crop Type:", s(formData.seedType));
    push("Plot Size (acres):", s(formData.plotSize));
    push("Season:", s(formData.season));
    push("Location:", s(formData.location));
    push("Soil Type:", s(formData.soilType));
    push("Fertilizer Plan:", s(formData.fertilizerPlan || "-"));
    push("Irrigation Plan:", s(formData.irrigationPlan || "-"));
    push("Previous Yield (q/acre):", s(formData.previousYield || "-"));
    push("Planting Date:", s(formData.plantingDate || "-"));

    // ---------- Right: Prediction summary ----------
    const rightW = pageWidth - rightColX - margin;
    // predicted yield box
    const summaryTop = y;
    const summaryBoxH = 86;
    doc.setFillColor(245, 247, 244);
    doc.setDrawColor(220, 225, 220);
    doc.roundedRect(rightColX, summaryTop, rightW, summaryBoxH, 6, 6, "FD");

    // Left part: Large yield number
    doc.setFontSize(10);
    doc.setTextColor(100, 120, 110);
    doc.text("Predicted Yield", rightColX + boxPadding, summaryTop + 22);

    doc.setFontSize(28);
    doc.setTextColor(18, 97, 49);
    doc.text(`${s(result.predictedYield)}`, rightColX + boxPadding, summaryTop + 55);

    // Right side small info boxes for revenue/profit
    const miniW = 120;
    const miniH = 40;
    const miniGap = 10;
    const miniX = rightColX + rightW - boxPadding - miniW;
    const miniY = summaryTop + 10;

    // Revenue box
    doc.setFillColor(232, 249, 238);
    doc.roundedRect(miniX, miniY, miniW, miniH, 6, 6, "F");
    doc.setFontSize(9);
    doc.setTextColor(30, 120, 50);
    doc.text("Estimated Revenue", miniX + 8, miniY + 14);
    doc.setFontSize(12);
    doc.setTextColor(20, 100, 45);
    doc.text(`${s(result.estimatedRevenue)}`, miniX + 8, miniY + 30);

    // Profit box below
    const mini2Y = miniY + miniH + miniGap;
    doc.setFillColor(255, 247, 230);
    doc.roundedRect(miniX, mini2Y, miniW, miniH, 6, 6, "F");
    doc.setFontSize(9);
    doc.setTextColor(160, 120, 30);
    doc.text("Profit Estimate", miniX + 8, mini2Y + 14);
    doc.setFontSize(12);
    doc.setTextColor(140, 90, 20);
    doc.text(`${s(result.profitEstimate)}`, miniX + 8, mini2Y + 30);

    // move y below summary
    y = summaryTop + summaryBoxH + 20;

    // ---------- Cost breakdown table (right col) ----------
    const tableX = rightColX;
    const tableW = rightW;
    doc.setFontSize(10);
    doc.setTextColor(34, 49, 32);
    doc.text("Cost Breakdown", tableX + boxPadding, y);

    const tableStartY = y + 18;
    const rowH = 16;
    let ty = tableStartY;

    const cb = result.costBreakdown || {};
    const rows = [
      ["Seeds:", s(cb.seeds || "-")],
      ["Fertilizer:", s(cb.fertilizer || "-")],
      ["Irrigation:", s(cb.irrigation || "-")],
      ["Labor:", s(cb.labor || "-")],
    ];
    rows.forEach((r) => {
      doc.setFontSize(10);
      doc.setTextColor(90, 90, 90);
      doc.text(r[0], tableX + boxPadding, ty);
      doc.setTextColor(40, 40, 40);
      doc.text(r[1], tableX + tableW - boxPadding, ty, { align: "right" });
      ty += rowH;
    });

    // total line
    doc.setDrawColor(230, 230, 230);
    doc.line(tableX + boxPadding, ty + 4, tableX + tableW - boxPadding, ty + 4);
    ty += 12;
    doc.setFontSize(10);
    doc.setTextColor(34, 49, 32);
    doc.text("Total Cost:", tableX + boxPadding, ty);
    doc.text(s(cb.total || "-"), tableX + tableW - boxPadding, ty, { align: "right" });

    y = ty + 30;

    // Market Price
    doc.setFontSize(10);
    doc.setTextColor(80, 80, 80);
    doc.text("Market Price (per q):", tableX + boxPadding, y);
    doc.setFontSize(10);
    doc.setTextColor(34, 49, 32);
    doc.text(s(result.marketPrice || "-"), tableX + tableW - boxPadding, y, { align: "right" });

    y += 30;

    // ---------- Analysis (full width under both columns) ----------
    const fullX = margin;
    const fullW = pageWidth - margin * 2;
    doc.setFontSize(12);
    doc.setTextColor(34, 49, 32);
    doc.text("Analysis", fullX + boxPadding, y);

    const analysisY = y + 16;
    doc.setFontSize(10);
    doc.setTextColor(70, 70, 70);
    const analysisText = s(result.reasoning || "No analysis provided.");
    const wrapped = doc.splitTextToSize(analysisText, fullW - boxPadding * 2);
    doc.text(wrapped, fullX + boxPadding, analysisY);

    // ---------- Footer with signature line ----------
    const footerY = doc.internal.pageSize.getHeight() - 80;
    doc.setDrawColor(220, 220, 220);
    doc.line(fullX + boxPadding, footerY, fullX + fullW - boxPadding, footerY);
    doc.setFontSize(10);
    doc.setTextColor(120, 120, 120);
    doc.text("Prepared by: AgriTrust System", fullX + boxPadding, footerY + 18);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, fullX + fullW - boxPadding - 120, footerY + 18);

    // Save the PDF
    doc.save("yield_prediction_report.pdf");
  } catch (error) {
    console.error("PDF generation error:", error);
    throw error;
  }
}
// --------------------------------------------
// ADVANCED CROP RECOMMENDATION PDF GENERATOR
// --------------------------------------------
export async function generateCropRecommendationPDF(
  formData: any,
  result: any,
  options?: { logoDataUrl?: string; landscape?: boolean }
) {
  try {
    const s = (v: any) => (v === undefined || v === null ? "" : String(v));

    const orientation = options?.landscape ? "landscape" : "portrait";
    const doc = new jsPDF({ unit: "pt", format: "a4", orientation });

    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 40;
    let y = 40;

    // ---------- HEADER ----------
    doc.setFillColor(30, 100, 60);
    doc.rect(0, 0, pageWidth, 70, "F");

    doc.setFontSize(22);
    doc.setTextColor(255, 255, 255);
    doc.text("Smart Crop Recommendation Report", margin, 40);

    doc.setFontSize(11);
    doc.text(
      `Generated: ${new Date().toLocaleDateString()}`,
      pageWidth - margin,
      40,
      { align: "right" }
    );

    y = 90;

    // ---------- FARM DETAILS CARD ----------
    const cardW = pageWidth - margin * 2;
    doc.setFillColor(249, 250, 248);
    doc.setDrawColor(220, 225, 220);
    doc.roundedRect(margin, y, cardW, 150, 8, 8, "FD");

    doc.setFontSize(14);
    doc.setTextColor(30, 50, 40);
    doc.text("Farm Details", margin + 16, y + 26);

    doc.setFontSize(11);
    doc.setTextColor(80, 80, 80);

    const details = [
      ["Soil Type", s(formData.soilType)],
      ["Soil pH", s(formData.soilPH || "-")],
      ["Farm Area (acres)", s(formData.area)],
      ["Water Access", s(formData.waterAccess)],
      ["Season", s(formData.season)],
      ["Budget (₹)", s(formData.budget)],
      ["Market Preference", s(formData.marketPreference)],
      ["Location", s(formData.location)],
      ["Previous Crops", s(formData.previousCrops || "-")],
    ];

    let dy = y + 50;
    details.forEach(([label, value]) => {
      doc.text(`${label}:`, margin + 16, dy);
      doc.text(String(value), pageWidth - margin - 16, dy, { align: "right" });
      dy += 18;
    });

    y = dy + 15;

    // ---------- RECOMMENDATIONS ----------
    doc.setFontSize(16);
    doc.setTextColor(30, 60, 40);
    doc.text("Recommended Crops", margin, y);

    y += 20;

    result.recommendations.forEach((rec: any, index: number) => {
      doc.setFillColor(240, 245, 240);
      doc.roundedRect(margin, y, cardW, 120, 8, 8, "F");

      doc.setFontSize(14);
      doc.setTextColor(18, 97, 49);
      doc.text(`${index + 1}. ${rec.cropName}`, margin + 16, y + 24);

      doc.setFontSize(11);
      doc.setTextColor(70, 70, 70);
      doc.text(`Confidence: ${rec.confidence}%`, margin + 16, y + 44);
      doc.text(`Expected Yield: ${rec.expectedYield}`, margin + 16, y + 62);
      doc.text(`Market Demand: ${rec.marketDemand}`, margin + 16, y + 80);

      // Risk level color
      let color = [200, 50, 50];
      if (rec.riskLevel === "Low") color = [30, 130, 60];
      else if (rec.riskLevel === "Medium") color = [200, 150, 30];

      doc.setTextColor(...color);
      doc.text(`Risk Level: ${rec.riskLevel}`, margin + 16, y + 98);

      y += 140; // next card
    });

    // ---------- SUMMARY ----------
    doc.setFontSize(14);
    doc.setTextColor(30, 60, 40);
    doc.text("Summary", margin, y + 20);

    doc.setFontSize(11);
    doc.setTextColor(70, 70, 70);

    const wrapped = doc.splitTextToSize(result.summary, pageWidth - margin * 2);
    doc.text(wrapped, margin, y + 40);

    // ----- FOOTER -----
    const footerY = doc.internal.pageSize.getHeight() - 60;
    doc.setFontSize(10);
    doc.setTextColor(120, 120, 120);
    doc.text("AgriTrust - Smart Agriculture Intelligence", margin, footerY);

    doc.save("crop_recommendation_report.pdf");
  } catch (err) {
    console.error("PDF error:", err);
    throw err;
  }
}
export function generateProfilePDF(data: any) {
  const doc = new jsPDF();
  doc.text("Profile Report", 20, 20);
  doc.text(JSON.stringify(data, null, 2), 20, 40);
  doc.save("profile_report.pdf");
}

