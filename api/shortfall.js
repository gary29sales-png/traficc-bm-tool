import ExcelJS from 'exceljs';
import path from 'path';
import fs from 'fs';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const invoice = parseFloat(req.query.invoice) || 0;
  const deposit = parseFloat(req.query.deposit) || 0;

  const possiblePaths = [
    path.join(process.cwd(), 'assets', 'Shortfall_Calculator.xlsx'),
    path.join(process.cwd(), 'public', 'files', 'Shortfall_Calculator.xlsx'),
    path.join('/var/task', 'assets', 'Shortfall_Calculator.xlsx'),
    path.join('/var/task', 'public', 'files', 'Shortfall_Calculator.xlsx'),
  ];

  let filePath = null;
  for (const p of possiblePaths) {
    if (fs.existsSync(p)) { filePath = p; break; }
  }

  if (!filePath) {
    return res.status(500).json({ error: 'Calculator file not found', tried: possiblePaths });
  }

  try {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(filePath);

    const sheet = workbook.getWorksheet('Loan Input Parameters');
    if (!sheet) throw new Error('Worksheet not found');

    sheet.getCell('B8').value = invoice;
    sheet.getCell('B9').value = deposit;

    const buffer = await workbook.xlsx.writeBuffer();

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="Traficc_Shortfall_Calculator.xlsx"');
    res.setHeader('Content-Length', buffer.length);
    return res.status(200).send(buffer);

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
