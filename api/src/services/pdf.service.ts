import PDFDocument from 'pdfkit';
import QRCode from 'node-qrcode';
import { prisma } from '../config/database';
import { AppError } from '../middleware/error.middleware';

const formatBDT = (paisa: number) => `BDT ${(paisa / 100).toFixed(2)}`;

const formatDate = (d: Date | string) =>
  new Date(d).toLocaleString('en-BD', {
    timeZone: 'Asia/Dhaka',
    year: 'numeric', month: 'short', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hour12: true
  });

export const generateReceiptPDF = async (transactionId: string, userId: string): Promise<Buffer> => {
  const tx = await prisma.transaction.findUnique({
    where: { id: transactionId },
    include: {
      user: { select: { fullName: true, email: true, phone: true } }
    }
  });

  if (!tx) throw new AppError('Transaction not found', 404, 'NOT_FOUND');
  if (tx.userId !== userId) throw new AppError('Access denied', 403, 'FORBIDDEN');

  // QR code with transaction ID
  const qrDataUrl = await QRCode.toDataURL(tx.id, { width: 80, margin: 1 });
  const qrBuffer = Buffer.from(qrDataUrl.split(',')[1], 'base64');

  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    const doc = new PDFDocument({ size: 'A5', margins: { top: 40, bottom: 40, left: 50, right: 50 } });

    doc.on('data', (chunk: Buffer) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    const W = doc.page.width - 100;

    // ── Header ──────────────────────────────────────────────────────────────
    doc.rect(0, 0, doc.page.width, 70).fill('#1B4FDB');
    doc.fillColor('white').fontSize(22).font('Helvetica-Bold').text('TollBD', 50, 20, { align: 'left' });
    doc.fontSize(9).font('Helvetica').text('Bangladesh Smart Bridge Toll System', 50, 45, { align: 'left' });
    doc.image(qrBuffer, doc.page.width - 100, 10, { width: 50, height: 50 });

    doc.moveDown(1.5);

    // ── Title ────────────────────────────────────────────────────────────────
    doc.fillColor('#1B4FDB').fontSize(14).font('Helvetica-Bold').text('TOLL PAYMENT RECEIPT', 50, 82, { align: 'center', width: W });
    doc.fillColor('#6b7280').fontSize(8).font('Helvetica').text('সেতু টোল রসিদ', 50, 98, { align: 'center', width: W });

    // ── Divider ──────────────────────────────────────────────────────────────
    doc.moveTo(50, 112).lineTo(doc.page.width - 50, 112).strokeColor('#e5e7eb').lineWidth(1).stroke();

    // ── Status badge ─────────────────────────────────────────────────────────
    const statusColor = tx.status === 'SUCCESS' ? '#00A86B' : tx.status === 'REFUNDED' ? '#3B82F6' : '#EF4444';
    doc.roundedRect(50, 120, 70, 18, 4).fill(statusColor);
    doc.fillColor('white').fontSize(8).font('Helvetica-Bold').text(tx.status, 50, 125, { width: 70, align: 'center' });

    doc.fillColor('#111').fontSize(18).font('Helvetica-Bold').text(formatBDT(tx.amount), doc.page.width - 200, 118, { width: 150, align: 'right' });

    // ── Details table ────────────────────────────────────────────────────────
    const rows: [string, string][] = [
      ['Receipt No', tx.id.slice(0, 16).toUpperCase()],
      ['Date & Time', formatDate(tx.createdAt)],
      ['Bridge', tx.bridgeName ?? '—'],
      ['Vehicle Plate', tx.vehiclePlate ?? '—'],
      ['Payment Method', tx.paymentMethod],
      ['Passenger Name', tx.user?.fullName ?? '—'],
      ['Contact', tx.user?.phone ?? tx.user?.email ?? '—']
    ];

    let y = 148;
    rows.forEach(([label, value], i) => {
      const bg = i % 2 === 0 ? '#F9FAFB' : '#FFFFFF';
      doc.rect(50, y, W, 20).fill(bg);
      doc.fillColor('#6b7280').fontSize(8).font('Helvetica').text(label, 55, y + 6, { width: W / 2 - 10 });
      doc.fillColor('#111827').fontSize(8).font('Helvetica-Bold').text(value, 55 + W / 2, y + 6, { width: W / 2 - 10, align: 'right' });
      y += 20;
    });

    // ── Amount summary ───────────────────────────────────────────────────────
    y += 8;
    doc.rect(50, y, W, 32).fill('#1B4FDB');
    doc.fillColor('white').fontSize(9).font('Helvetica').text('Total Amount Charged', 60, y + 6, { width: W - 20 });
    doc.fontSize(15).font('Helvetica-Bold').text(formatBDT(tx.amount), 60, y + 14, { width: W - 20, align: 'right' });

    // ── Footer ───────────────────────────────────────────────────────────────
    y += 50;
    doc.moveTo(50, y).lineTo(doc.page.width - 50, y).strokeColor('#e5e7eb').lineWidth(0.5).stroke();
    y += 8;
    doc.fillColor('#9ca3af').fontSize(7).font('Helvetica')
      .text('This is a computer-generated receipt. No signature required.', 50, y, { align: 'center', width: W });
    doc.text('TollBD | Bangladesh Bridge Authority | support@tollbd.com.bd', 50, y + 12, { align: 'center', width: W });
    doc.text(`Generated: ${formatDate(new Date())}`, 50, y + 24, { align: 'center', width: W });

    doc.end();
  });
};
