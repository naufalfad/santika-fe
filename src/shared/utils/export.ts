/**
 * Client-side utility for exporting structured data to spreadsheet CSV.
 * Automatically inserts UTF-8 Byte Order Mark (BOM) to guarantee clean import in MS Excel.
 */
export const downloadCSV = (filename: string, headers: string[], rows: string[][]) => {
  const content = [
    headers.join(','),
    ...rows.map(row => 
      row.map(cell => {
        // Escape double quotes and wrap cells with quotes if they contain comma, newline or quotes
        const escaped = String(cell ?? '').replace(/"/g, '""');
        return escaped.includes(',') || escaped.includes('\n') || escaped.includes('"') 
          ? `"${escaped}"` 
          : escaped;
      }).join(',')
    )
  ].join('\r\n');

  // Prepend UTF-8 BOM (\uFEFF)
  const blob = new Blob(['\uFEFF' + content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Client-side utility for exporting styled HTML table markup as an Excel spreadsheet (.xls).
 * Resolves base64 images by packing them into an MHTML (multipart/related) format, ensuring
 * that logos and icons render natively without broken image errors.
 */
export const downloadExcel = (filename: string, htmlTableContent: string) => {
  // 1. Parse HTML to extract base64 images and replace them with CID references
  const images: { mime: string; base64: string; cid: string }[] = [];
  let imageCounter = 1;

  const processedHtmlContent = htmlTableContent.replace(/src="data:(image\/[^;]+);base64,([^"]+)"/gi, (_match, mimeType, base64Data) => {
    const cid = `image_${imageCounter++}_logo`;
    images.push({ mime: mimeType, base64: base64Data, cid });
    return `src="cid:${cid}"`;
  });

  const excelHtmlTemplate = `
<html xmlns:o="urn:schemas-microsoft-com:office:office"
      xmlns:x="urn:schemas-microsoft-com:office:excel"
      xmlns="http://www.w3.org/TR/REC-html40">
<head>
  <!--[if gte mso 9]>
  <xml>
    <x:ExcelWorkbook>
      <x:ExcelWorksheets>
        <x:ExcelWorksheet>
          <x:Name>Laporan Keuangan</x:Name>
          <x:WorksheetOptions>
            <x:DisplayGridlines/>
          </x:WorksheetOptions>
        </x:ExcelWorksheet>
      </x:ExcelWorksheets>
    </x:ExcelWorkbook>
  </xml>
  <![endif]-->
  <meta charset="utf-8">
  <style>
    table { border-collapse: collapse; }
    th, td { border: 0.5pt solid #cbd5e1; font-family: Arial, sans-serif; font-size: 10pt; padding: 6px; }
    th { background-color: #1e293b; color: #ffffff; font-weight: bold; }
    .text-left { text-align: left; }
    .text-center { text-align: center; }
    .text-right { text-align: right; }
    .font-bold { font-weight: bold; }
    .mso-number { mso-number-format: '"Rp"\\ \\#\\,\\#\\#0'; }
    .bg-header { background-color: #1e293b; color: #ffffff; }
    .bg-total { background-color: #f8fafc; font-weight: bold; }
    .text-green { color: #16a34a; font-weight: bold; }
    .text-red { color: #dc2626; font-weight: bold; }
  </style>
</head>
<body>
  ${processedHtmlContent}
</body>
</html>
  `.trim();

  // 2. Build MHTML multipart archive
  const boundary = "----=_NextPart_Excel_Export_Boundary";
  const mhtmlParts: string[] = [];

  mhtmlParts.push("MIME-Version: 1.0");
  mhtmlParts.push(`Content-Type: multipart/related; boundary="${boundary}"`);
  mhtmlParts.push("");

  // Add the main HTML document
  mhtmlParts.push(`--${boundary}`);
  mhtmlParts.push('Content-Type: text/html; charset="utf-8"');
  mhtmlParts.push("Content-Transfer-Encoding: 8bit");
  mhtmlParts.push("");
  mhtmlParts.push(excelHtmlTemplate);
  mhtmlParts.push("");

  // Add each image as a separate MIME part
  for (const img of images) {
    mhtmlParts.push(`--${boundary}`);
    mhtmlParts.push(`Content-Type: ${img.mime}`);
    mhtmlParts.push("Content-Transfer-Encoding: base64");
    mhtmlParts.push(`Content-ID: <${img.cid}>`);
    mhtmlParts.push("");
    mhtmlParts.push(img.base64);
    mhtmlParts.push("");
  }

  // End boundary
  mhtmlParts.push(`--${boundary}--`);

  // 3. Trigger download
  const mhtmlContent = mhtmlParts.join('\r\n');
  const blob = new Blob([mhtmlContent], { type: 'application/vnd.ms-excel;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

