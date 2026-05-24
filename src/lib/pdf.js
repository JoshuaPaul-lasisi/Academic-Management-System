import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { format } from 'date-fns'

const BURGUNDY = [139, 26, 47]
const GOLD     = [201, 168, 76]
const CREAM    = [253, 248, 240]
const LIGHT_B  = [253, 243, 245]

const fmt = (n) => `NGN ${Number(n || 0).toLocaleString('en-NG', { minimumFractionDigits: 2 })}`

function addHeader(doc, schoolName, annexName, pageW) {
  doc.setFillColor(...BURGUNDY)
  doc.rect(0, 0, pageW, 26, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(13)
  doc.setFont('helvetica', 'bold')
  doc.text(schoolName || 'DEBBYFIELD SCHOOLS', pageW / 2, 10, { align: 'center' })
  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.text(`${annexName || ''} Annex  |  Achieving Life's Purpose`, pageW / 2, 17, { align: 'center' })
  doc.setDrawColor(...GOLD)
  doc.setLineWidth(0.8)
  doc.line(0, 26, pageW, 26)
  doc.setTextColor(0, 0, 0)
}

function addFooter(doc, pageW, pageH) {
  doc.setFontSize(7)
  doc.setFont('helvetica', 'italic')
  doc.setTextColor(150, 150, 150)
  doc.text('Generated electronically by Debbyfield Schools Management System', pageW / 2, pageH - 8, { align: 'center' })
}

// ── PAYMENT RECEIPT ──────────────────────────────────────────
export function generateReceipt({ payment, student, schoolName, annexName, termName, recordedBy }) {
  const doc   = new jsPDF({ unit: 'mm', format: 'a5', orientation: 'portrait' })
  const pageW = doc.internal.pageSize.getWidth()
  const pageH = doc.internal.pageSize.getHeight()

  addHeader(doc, schoolName, annexName, pageW)

  doc.setFontSize(15)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...BURGUNDY)
  doc.text('PAYMENT RECEIPT', pageW / 2, 36, { align: 'center' })

  doc.setDrawColor(...GOLD)
  doc.setLineWidth(0.4)
  doc.line(20, 39, pageW - 20, 39)

  doc.setFontSize(8.5)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(60, 60, 60)
  doc.text(`Receipt No: ${payment.receipt_number || '—'}`, 14, 47)
  doc.text(`Date: ${payment.payment_date ? format(new Date(payment.payment_date), 'dd MMMM yyyy') : '—'}`, pageW - 14, 47, { align: 'right' })

  // Student box
  doc.setFillColor(...LIGHT_B)
  doc.roundedRect(14, 52, pageW - 28, 24, 2, 2, 'F')
  doc.setFontSize(7.5)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...BURGUNDY)
  doc.text('STUDENT DETAILS', 18, 59)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(40, 40, 40)
  const fullName = `${student.first_name || ''} ${student.last_name || ''}`.trim()
  doc.text(`Name: ${fullName}`, 18, 66)
  doc.text(`Class: ${student.classes?.name || '—'}`, 18, 72)
  doc.text(`Adm. No: ${student.admission_number || '—'}`, pageW / 2, 66)
  doc.text(`Term: ${termName || '—'}`, pageW / 2, 72)

  autoTable(doc, {
    startY: 84,
    margin: { left: 14, right: 14 },
    head: [['Description', 'Details']],
    body: [
      ['Amount Paid', fmt(payment.amount)],
      ['Payment Method', payment.payment_method || '—'],
      ['Received By', recordedBy || '—'],
      payment.notes ? ['Notes', payment.notes] : null,
    ].filter(Boolean),
    headStyles: { fillColor: BURGUNDY, textColor: 255, fontSize: 8, fontStyle: 'bold' },
    bodyStyles: { fontSize: 8.5 },
    alternateRowStyles: { fillColor: CREAM },
    columnStyles: { 0: { fontStyle: 'bold', cellWidth: 45 } },
  })

  const y = doc.lastAutoTable.finalY + 8

  // Total highlight
  doc.setFillColor(...GOLD)
  doc.roundedRect(pageW - 70, y, 56, 14, 2, 2, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(8)
  doc.setFont('helvetica', 'bold')
  doc.text('AMOUNT PAID', pageW - 42, y + 5, { align: 'center' })
  doc.setFontSize(10)
  doc.text(fmt(payment.amount), pageW - 42, y + 11, { align: 'center' })

  // Signature
  doc.setTextColor(80, 80, 80)
  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.setDrawColor(...BURGUNDY)
  doc.line(14, y + 30, 65, y + 30)
  doc.text("Bursar's Signature", 39, y + 35, { align: 'center' })

  addFooter(doc, pageW, pageH)
  return doc
}

// ── FEE INVOICE ──────────────────────────────────────────────
export function generateInvoice({ student, feeItems, totalOwed, totalPaid, schoolName, annexName, termName }) {
  const doc   = new jsPDF({ unit: 'mm', format: 'a5', orientation: 'portrait' })
  const pageW = doc.internal.pageSize.getWidth()
  const pageH = doc.internal.pageSize.getHeight()

  addHeader(doc, schoolName, annexName, pageW)

  doc.setFontSize(15)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...BURGUNDY)
  doc.text('FEE INVOICE', pageW / 2, 36, { align: 'center' })
  doc.setDrawColor(...GOLD)
  doc.setLineWidth(0.4)
  doc.line(20, 39, pageW - 20, 39)

  doc.setFontSize(8.5)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(60, 60, 60)
  doc.text(`Term: ${termName || '—'}`, 14, 47)
  doc.text(`Issued: ${format(new Date(), 'dd MMMM yyyy')}`, pageW - 14, 47, { align: 'right' })

  doc.setFillColor(...LIGHT_B)
  doc.roundedRect(14, 52, pageW - 28, 24, 2, 2, 'F')
  doc.setFontSize(7.5)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...BURGUNDY)
  doc.text('STUDENT DETAILS', 18, 59)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(40, 40, 40)
  const fullName = `${student.first_name || ''} ${student.last_name || ''}`.trim()
  doc.text(`Name: ${fullName}`, 18, 66)
  doc.text(`Class: ${student.classes?.name || '—'}`, 18, 72)
  doc.text(`Adm. No: ${student.admission_number || '—'}`, pageW / 2, 66)
  doc.text(`Type: ${student.student_type === 'new' ? 'New Intake' : 'Returning'}`, pageW / 2, 72)

  autoTable(doc, {
    startY: 84,
    margin: { left: 14, right: 14 },
    head: [['Fee Item', 'Amount']],
    body: feeItems.map(item => [item.name, fmt(item.amount)]),
    foot: [
      ['TOTAL BILLED', fmt(totalOwed)],
      ['TOTAL PAID',   fmt(totalPaid)],
      ['BALANCE DUE',  fmt(totalOwed - totalPaid)],
    ],
    headStyles:  { fillColor: BURGUNDY, textColor: 255, fontSize: 8 },
    bodyStyles:  { fontSize: 8.5 },
    footStyles:  { fillColor: CREAM, textColor: [0, 0, 0], fontStyle: 'bold', fontSize: 9 },
    alternateRowStyles: { fillColor: [250, 250, 250] },
    columnStyles: { 1: { halign: 'right' } },
  })

  const y = doc.lastAutoTable.finalY + 8
  const balance = totalOwed - totalPaid
  if (balance > 0) {
    doc.setFillColor(254, 242, 242)
    doc.setDrawColor(252, 165, 165)
    doc.roundedRect(14, y, pageW - 28, 12, 2, 2, 'FD')
    doc.setFontSize(8)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(185, 28, 28)
    doc.text(`Outstanding balance: ${fmt(balance)} — please pay promptly.`, pageW / 2, y + 7.5, { align: 'center' })
  }

  addFooter(doc, pageW, pageH)
  return doc
}

// ── OUTSTANDING FEES REPORT ──────────────────────────────────
export function generateOutstandingReport({ rows, filters, schoolName, annexName, termName }) {
  const doc   = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'landscape' })
  const pageW = doc.internal.pageSize.getWidth()
  const pageH = doc.internal.pageSize.getHeight()

  addHeader(doc, schoolName, annexName, pageW)

  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...BURGUNDY)
  doc.text('OUTSTANDING FEES REPORT', pageW / 2, 36, { align: 'center' })
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(80, 80, 80)
  doc.text(`${termName || ''}  |  ${filters || ''}  |  Generated: ${format(new Date(), 'dd/MM/yyyy')}`, pageW / 2, 43, { align: 'center' })

  autoTable(doc, {
    startY: 50,
    margin: { left: 14, right: 14 },
    head: [['#', 'Student Name', 'Adm. No.', 'Class', 'Total Billed', 'Total Paid', 'Outstanding']],
    body: rows.map((r, i) => [
      i + 1,
      r.name,
      r.admission_number || '—',
      r.class_name || '—',
      fmt(r.total_owed),
      fmt(r.total_paid),
      fmt(r.balance),
    ]),
    headStyles:  { fillColor: BURGUNDY, textColor: 255, fontSize: 8 },
    bodyStyles:  { fontSize: 8 },
    alternateRowStyles: { fillColor: CREAM },
    columnStyles: {
      0: { cellWidth: 8 },
      4: { halign: 'right' },
      5: { halign: 'right' },
      6: { halign: 'right', fontStyle: 'bold', textColor: [185, 28, 28] },
    },
  })

  const y = doc.lastAutoTable.finalY + 6
  const totalOutstanding = rows.reduce((s, r) => s + Number(r.balance || 0), 0)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...BURGUNDY)
  doc.text(`Total outstanding: ${fmt(totalOutstanding)}  (${rows.length} students)`, pageW - 14, y, { align: 'right' })

  addFooter(doc, pageW, pageH)
  return doc
}

// ── ALUMNI LIST ──────────────────────────────────────────────
export function generateAlumniList({ rows, schoolName, annexName }) {
  const doc   = new jsPDF({ unit: 'mm', format: 'a4' })
  const pageW = doc.internal.pageSize.getWidth()
  const pageH = doc.internal.pageSize.getHeight()

  addHeader(doc, schoolName, annexName, pageW)

  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...BURGUNDY)
  doc.text('ALUMNI LIST', pageW / 2, 36, { align: 'center' })
  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(80, 80, 80)
  doc.text(`Generated: ${format(new Date(), 'dd MMMM yyyy')}  ·  Total: ${rows.length}`, pageW / 2, 43, { align: 'center' })

  autoTable(doc, {
    startY: 50,
    margin: { left: 14, right: 14 },
    head: [['#', 'Name', 'Adm. No.', 'Last Class', 'Exit Year', 'Next Destination']],
    body: rows.map((r, i) => [i + 1, r.name, r.admission_number ?? '—', r.class_name ?? '—', r.exit_year ?? '—', r.next_destination ?? '—']),
    headStyles:  { fillColor: BURGUNDY, textColor: 255, fontSize: 8 },
    bodyStyles:  { fontSize: 8.5 },
    alternateRowStyles: { fillColor: CREAM },
    columnStyles: { 0: { cellWidth: 8 } },
  })

  addFooter(doc, pageW, pageH)
  return doc
}

// ── FEE SCHEDULE PDF ─────────────────────────────────────────
export function generateFeeSchedule({ rows, schoolName, annexName, termName }) {
  const doc   = new jsPDF({ unit: 'mm', format: 'a4' })
  const pageW = doc.internal.pageSize.getWidth()
  const pageH = doc.internal.pageSize.getHeight()

  addHeader(doc, schoolName, annexName, pageW)

  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...BURGUNDY)
  doc.text('FEE SCHEDULE', pageW / 2, 36, { align: 'center' })
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(80, 80, 80)
  doc.text(`${termName || ''}  |  ${annexName || ''} Annex`, pageW / 2, 43, { align: 'center' })

  autoTable(doc, {
    startY: 50,
    margin: { left: 14, right: 14 },
    head: [['Class', 'New Intake (Tuition)', 'New Intake (Total)', 'Returning (Tuition)', 'Returning (Total)']],
    body: rows.map(r => [
      r.class_name,
      fmt(r.new_tuition),
      fmt(r.new_total),
      fmt(r.returning_tuition),
      fmt(r.returning_total),
    ]),
    headStyles:  { fillColor: BURGUNDY, textColor: 255, fontSize: 8 },
    bodyStyles:  { fontSize: 8.5 },
    alternateRowStyles: { fillColor: CREAM },
    columnStyles: {
      1: { halign: 'right' }, 2: { halign: 'right', fontStyle: 'bold' },
      3: { halign: 'right' }, 4: { halign: 'right', fontStyle: 'bold' },
    },
  })

  addFooter(doc, pageW, pageH)
  return doc
}
