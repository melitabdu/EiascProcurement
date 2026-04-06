import PDFDocument from "pdfkit";

export const generateMinutesPDF = (res, summary, minutes) => {
  const doc = new PDFDocument({
    margin: 50,
    size: "A4",
  });

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    "inline; filename=procurement-minutes.pdf"
  );

  doc.pipe(res);

  const pageWidth = doc.page.width - 100;
  const startX = 50;

  /* =====================================================
     HEADER
  ===================================================== */

  doc
    .font("Helvetica-Bold")
    .fontSize(14)
    .text("ETHIOPIAN ISLAMIC AFFAIRS SUPREME COUNCIL", {
      align: "center",
    });

  doc.moveDown(0.3);

  doc
    .fontSize(12)
    .text("OFFICIAL PROCUREMENT EVALUATION MINUTES", {
      align: "center",
    });

  doc.moveDown(0.5);
  doc.moveTo(startX, doc.y).lineTo(startX + pageWidth, doc.y).stroke();
  doc.moveDown(1);

  /* =====================================================
     PROCUREMENT INFO
  ===================================================== */

  doc.font("Helvetica").fontSize(11);

  doc.text(`Procurement Title: ${summary.procurement.title}`);
  doc.text(`Reference No: ${summary.procurement.referenceNumber}`);
  doc.text(`Department: ${summary.procurement.requestingDepartment}`);

  doc.moveDown(1.2);

  /* =====================================================
     1. QUOTATION SUMMARY TABLE (PROFESSIONAL GRID)
  ===================================================== */

  doc.font("Helvetica-Bold").text("1. Quotation Summary", {
    underline: true,
  });

  doc.moveDown(0.7);
  doc.font("Helvetica");

  const tableTop = doc.y;
  const col1 = startX;
  const col2 = startX + 40;
  const col3 = startX + 280;
  const rowHeight = 25;

  // Table Header
  doc.rect(col1, tableTop, pageWidth, rowHeight).stroke();
  doc.text("No", col1 + 5, tableTop + 8);
  doc.text("Item Description", col2, tableTop + 8);
  doc.text("Selected Supplier", col3, tableTop + 8);

  let y = tableTop + rowHeight;

  summary.items.forEach((item, index) => {
    doc.rect(col1, y, pageWidth, rowHeight).stroke();

    doc.text(index + 1, col1 + 5, y + 8);

    doc.text(item.itemName, col2, y + 8, {
      width: 220,
    });

    const winner = summary.businesses?.find(
      (b) => b.businessId === item.winnerBusinessId
    );

    doc.text(winner ? winner.name : "-", col3, y + 8, {
      width: 200,
    });

    y += rowHeight;
  });

  doc.y = y + 15;

  /* =====================================================
     2. BID OPENING COMMITTEE
  ===================================================== */

  doc.font("Helvetica-Bold").text("2. Bid Opening Committee", {
    underline: true,
  });

  doc.moveDown(0.5);
  doc.font("Helvetica");

  if (summary.procurement.bidOpenedBy?.length > 0) {
    summary.procurement.bidOpenedBy.forEach((m, i) => {
      doc.text(`${i + 1}. ${m.fullName}`);
    });
  } else {
    doc.text("No bid opening members recorded.");
  }

  doc.moveDown(1);

  /* =====================================================
     3. EVALUATION REPORT
  ===================================================== */

  doc.font("Helvetica-Bold").text("3. Evaluation Report", {
    underline: true,
  });

  doc.moveDown(0.5);
  doc.font("Helvetica").text(minutes.evaluationReport || "-", {
    align: "justify",
  });

  doc.moveDown(1);

  /* =====================================================
     4. COMMITTEE DECISION
  ===================================================== */

  doc.font("Helvetica-Bold").text("4. Committee Decision", {
    underline: true,
  });

  doc.moveDown(0.5);
  doc.font("Helvetica").text(minutes.decisionText || "-", {
    align: "justify",
  });

  doc.moveDown(1);

  /* =====================================================
     5. MANAGERIAL DECISION
  ===================================================== */

  doc.font("Helvetica-Bold").text("5. Managerial Decision", {
    underline: true,
  });

  doc.moveDown(0.5);

  doc.font("Helvetica").text(
    minutes.managerialDecision || "______________________________________________"
  );

  doc.moveDown(2);

  /* =====================================================
     SIGNATURE SECTION
  ===================================================== */

  doc.font("Helvetica-Bold").text("Committee Members Signatures", {
    underline: true,
  });

  doc.moveDown(1);
  doc.font("Helvetica");

  if (minutes.committeeMembers?.length > 0) {
    minutes.committeeMembers.forEach((m) => {
      doc.text(`${m.name} - ${m.role}`);
      doc.text("Signature: ______________________________");
      doc.moveDown(1);
    });
  } else {
    doc.text("No committee members recorded.");
  }

  doc.moveDown(2);

  /* =====================================================
     MANAGER APPROVAL BLOCK
  ===================================================== */

  doc.moveTo(startX, doc.y).lineTo(startX + pageWidth, doc.y).stroke();
  doc.moveDown(1);

  doc.text("Manager Approval:");
  doc.moveDown(1);
  doc.text("Name: ______________________________");
  doc.moveDown(1);
  doc.text("Signature: __________________________");
  doc.moveDown(1);
  doc.text("Date: _______________________________");

  doc.end();
};