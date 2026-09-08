import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const formatCurrency = (amount) => {
  return `Rp ${parseFloat(amount).toLocaleString("id-ID", {
    minimumFractionDigits: 0,
  })}`;
};

const getStatusColor = (status) => {
  switch (status.toLowerCase()) {
    case "paid":
      return "success";
    case "pending":
      return "warning";
    case "overdue":
      return "error";
    default:
      return "default";
  }
};

const generateInvoicePDF = async (invoiceData, companyInfo) => {
  try {
    const doc = new jsPDF("p", "mm", "a4");
    const pageHeight =
      doc.internal.pageSize.height || doc.internal.pageSize.getHeight();
    const pageWidth =
      doc.internal.pageSize.width || doc.internal.pageSize.getWidth();
    console.log(pageHeight + "," + pageWidth);

    let yPos = 20;

    // Colors
    const primaryColor = [25, 118, 210]; // Blue
    const secondaryColor = [66, 165, 245]; // Light Blue
    const textColor = [33, 33, 33];
    const lightGray = [245, 245, 245];
    const white = [255, 255, 255];

    // Helper function to add gradient-like header
    const addHeader = () => {
      // Header background
      doc.setFillColor(...primaryColor);
      doc.rect(0, 0, pageWidth, 50, "F");

      // Company logo area (circle)
      doc.setFillColor(255, 255, 255, 0.2);
      doc.circle(20, 30, 12, "F");

      // Invoice icon (simplified receipt)
      doc.setFillColor(255, 255, 255);
      doc.setDrawColor(255, 255, 255);
      doc.setLineWidth(0.5);
      doc.line(20, 27, 28, 27);
      doc.line(20, 29, 28, 29);
      doc.line(20, 31, 26, 31);

      // Company info
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("Tax Invoice/Bill of Supply/Cash Memo", 10, 8);

      doc.setFontSize(22);
      doc.setFont("helvetica", "bold");
      doc.text(companyInfo.name, 40, 25);

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(companyInfo.tagline, 42, 32);

      // Invoice number and status
      doc.setFontSize(13);
      doc.setFont("helvetica", "bold");
      doc.text(`GSTIN: ${companyInfo.gstin}`, pageWidth - 12, 12, {
        align: "right",
      });

      // Invoice number and status
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text(
        `Invoice Number: ${invoiceData.sale_number}`,
        pageWidth - 12,
        18,
        {
          align: "right",
        }
      );

      // Invoice Date
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text(
        `Invoice Date: ${formatDate(invoiceData.sale_date)}`,
        pageWidth - 12,
        24,
        {
          align: "right",
        }
      );

      // Status chip
      const statusText = invoiceData.payment_status.toUpperCase();
      const statusWidth = doc.getTextWidth(statusText) + 5;
      const statusX = pageWidth - 18 - statusWidth / 2;

      // Status background
      let statusColor = [255, 193, 7]; // Warning yellow
      if (invoiceData.payment_status.toLowerCase() === "paid")
        statusColor = [76, 175, 80]; // Green
      if (invoiceData.payment_status.toLowerCase() === "overdue")
        statusColor = [244, 67, 54]; // Red

      doc.setFillColor(...statusColor);
      doc.roundedRect(statusX - statusWidth / 2, 28, statusWidth, 8, 2, 2, "F");
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text(statusText, pageWidth - 20, 33, { align: "right" });
    };

    addHeader();
    yPos = 65;

    // Company and Customer Info Section
    doc.setFillColor(...lightGray);
    doc.rect(0, yPos - 10, pageWidth, 60, "F");

    // FROM section
    doc.setTextColor(...textColor);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Sold By:", 10, yPos);

    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text(companyInfo.name, 10, yPos + 8);

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    const companyAddressLines = companyInfo.address.split("\n");
    companyAddressLines.forEach((line, index) => {
      doc.text(line, 10, yPos + 14 + index * 4);
    });

    doc.text(`Email: ${companyInfo.email}`, 10, yPos + 28);
    doc.text(`Phone: ${companyInfo.phone}`, 10, yPos + 34);

    // BILL TO section
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Billing Address:", pageWidth / 2 + 10, yPos);

    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text(invoiceData.customer_details.name, pageWidth / 2 + 10, yPos + 8);

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    const customerAddressLines =
      invoiceData.customer_details.address.split("\n");
    customerAddressLines.forEach((line, index) => {
      doc.text(line, pageWidth / 2 + 10, yPos + 14 + index * 4);
    });

    doc.text(
      `Email: ${invoiceData.customer_details.email}`,
      pageWidth / 2 + 10,
      yPos + 28
    );
    doc.text(
      `Phone: ${invoiceData.customer_details.phone}`,
      pageWidth / 2 + 10,
      yPos + 34
    );

    yPos += 60;

    // ===== ITEMS TABLE =====
    const tableColumns = [
      { header: "Sl.No", dataKey: "slno" },
      { header: "Description", dataKey: "description" },
      { header: "SKU", dataKey: "sku" },
      { header: "Qty", dataKey: "quantity" },
      { header: "Unit Price", dataKey: "unitPrice" },
      { header: "Discount", dataKey: "discount" },
      { header: "Tax Rate", dataKey: "taxRate" },
      { header: "Tax Type", dataKey: "taxType" },
      { header: "Tax Amount", dataKey: "taxAmount" },
      { header: "Total Amount", dataKey: "totalAmount" },
    ];

    const tableRows = invoiceData.items.map((item, index) => ({
      slno: index + 1,
      description: item.product_name,
      sku: item.product_sku,
      quantity: item.quantity.toString(),
      unitPrice: formatCurrency(item.unit_price),
      discount: `${item.discount_percent}%`,
      taxRate: `${item.tax_rate}%`,
      taxType: "CGST",
      taxAmount: `500`,
      totalAmount: formatCurrency(item.line_total),
    }));
    autoTable(doc, {
      startY: yPos,
      columns: tableColumns,
      body: tableRows,
      tableWidth: pageWidth,
      margin: {
        left: 0,
      },
      theme: "grid",
      headStyles: {
        fillColor: primaryColor,
        textColor: [255, 255, 255],
        halign: "center",
      },
      bodyStyles: { fontSize: 9 },
      columnStyles: {
        0: { cellWidth: 10 },
        1: { cellWidth: 62, halign: "left" },
        2: { cellWidth: 15, halign: "center" },
        3: { cellWidth: 10, halign: "right" },
        4: { cellWidth: 20, halign: "center" },
        5: { cellWidth: 20, halign: "center" },
        6: { cellWidth: 12, halign: "right" },
        7: { cellWidth: 15, halign: "center" },
        8: { cellWidth: 20, halign: "center" },
        9: { cellWidth: 25, halign: "center" },
      },
    });

    yPos = doc.lastAutoTable.finalY + 20;

    // ===== SUMMARY =====
    const finalY = doc.lastAutoTable.finalY + 15;
    doc.setFillColor(248, 249, 250);
    doc.rect(120, finalY - 5, 75, 50, "F");

    const summaryItems = [
      {
        label: "Subtotal:",
        value: String(formatCurrency(invoiceData.subtotal)),
      },
      {
        label: "Discount:",
        value: formatCurrency(invoiceData.discount_amount),
      },
      { label: "Tax (GST):", value: formatCurrency(invoiceData.tax_amount) },
      {
        label: "Total:",
        value: formatCurrency(invoiceData.total_amount),
        bold: true,
      },
      { label: "Paid:", value: formatCurrency(invoiceData.paid_amount) },
      {
        label: "Balance Due:",
        value: formatCurrency(invoiceData.balance_due),
        bold: true,
        color: [220, 53, 69],
      },
    ];

    summaryItems.forEach((item, i) => {
      const y = finalY + 5 + i * 7;
      doc.setFont("helvetica", item.bold ? "bold" : "normal");
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      doc.text(item.label, 125, y);
      if (item.color) doc.setTextColor(...item.color);
      doc.text(item.value, 190, y, { align: "right" });
    });

    // ===== PAYMENT + SALESPERSON =====
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "bold");
    doc.text("Payment Method:", 10, finalY);
    doc.setFont("helvetica", "normal");
    doc.text(invoiceData.payment_method.toUpperCase(), 10, finalY + 6);

    doc.setFont("helvetica", "bold");
    doc.text("Salesperson:", 10, finalY + 15);
    doc.setFont("helvetica", "normal");
    doc.text(invoiceData.salesperson_name, 10, finalY + 21);

    yPos += 15;
    // Notes Section (if any)
    // ===== NOTES =====
    if (invoiceData.notes) {
      doc.setFont("helvetica", "bold");
      doc.text("Notes:", 10, yPos + 40);
      doc.setFont("helvetica", "normal");
      const notesLines = doc.splitTextToSize(invoiceData.notes, 180);
      doc.text(notesLines, 10, yPos + 47);
    }

    // ===== FOOTER =====
    doc.setFillColor(...primaryColor);
    doc.rect(0, pageHeight - 20, 210, 20, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text("Thank you for your business!", 15, pageHeight - 10);

    doc.text(
      `${companyInfo.email} | ${companyInfo.phone}`,
      200,
      pageHeight - 15,
      { align: "right" }
    );
    doc.text(companyInfo.website, 200, pageHeight - 8, {
      align: "right",
    });

    // Save the PDF
    doc.save(`Invoice_${invoiceData.sale_number}.pdf`);
  } catch (error) {
    console.error("Error generating PDF:", error);
    alert("Error generating PDF. Please try again.");
  }
};

export default generateInvoicePDF;
