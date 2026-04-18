import 'dart:typed_data';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:pdf/pdf.dart';
import 'package:pdf/widgets.dart' as pw;
import 'package:printing/printing.dart';
import 'package:qr_flutter/qr_flutter.dart';

import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_spacing.dart';
import '../../../../core/constants/app_text_styles.dart';
import '../../../../core/utils/currency_formatter.dart';
import '../../../../core/utils/date_formatter.dart';
import '../../../auth/presentation/providers/auth_provider.dart';
import '../../presentation/providers/history_provider.dart';

class ReceiptDetailScreen extends ConsumerWidget {
  const ReceiptDetailScreen({super.key, required this.paymentId});

  final String paymentId;

  Future<Uint8List> _buildPdf({
    required String txId,
    required String gate,
    required String road,
    required String vehicle,
    required String amount,
    required String date,
    required String status,
  }) async {
    final pdf = pw.Document();
    pdf.addPage(
      pw.Page(
        pageFormat: PdfPageFormat.a4,
        build: (context) {
          return pw.Column(
            crossAxisAlignment: pw.CrossAxisAlignment.start,
            children: [
              pw.Center(
                child: pw.Text(
                  'TollBD Digital Receipt',
                  style: pw.TextStyle(
                    fontSize: 22,
                    fontWeight: pw.FontWeight.bold,
                  ),
                ),
              ),
              pw.SizedBox(height: 12),
              pw.Divider(),
              _pdfRow('Receipt No', txId),
              _pdfRow('Date Time', date),
              _pdfRow('Gate', gate),
              _pdfRow('Road', road),
              _pdfRow('Vehicle', vehicle),
              _pdfRow('Toll Fee', amount),
              _pdfRow('Payment Method', 'TollBD Wallet'),
              _pdfRow('Status', status),
              pw.SizedBox(height: 24),
              pw.Center(
                child: pw.BarcodeWidget(
                  data: txId,
                  barcode: pw.Barcode.qrCode(),
                  width: 120,
                  height: 120,
                ),
              ),
            ],
          );
        },
      ),
    );
    return pdf.save();
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final language = ref.watch(languageProvider);
    final paymentAsync = ref.watch(receiptPaymentProvider(paymentId));
    return Scaffold(
      appBar: AppBar(
        title: Text(language == 'bn' ? 'ডিজিটাল রসিদ' : 'Digital Receipt'),
      ),
      body: paymentAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (error, _) => Center(child: Text(error.toString())),
        data: (payment) {
          if (payment == null) {
            return Center(
              child: Text(
                language == 'bn' ? 'রসিদ পাওয়া যায়নি' : 'Receipt not found',
              ),
            );
          }
          final formattedDate = DateFormatter.friendlyDate(
            payment.createdAt,
            language: language,
          );
          return ListView(
            padding: const EdgeInsets.all(AppSpacing.lg),
            children: [
              Container(
                padding: const EdgeInsets.all(AppSpacing.lg),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(AppRadius.lg),
                  border: Border.all(color: AppColors.cardBorder),
                ),
                child: Column(
                  children: [
                    const Text('TollBD', style: AppTextStyles.h2),
                    Text(
                      language == 'bn'
                          ? 'সরকারি স্বীকৃত টোল পেমেন্ট'
                          : 'Government approved toll payment',
                      style: AppTextStyles.bodySmall,
                    ),
                    const SizedBox(height: AppSpacing.sm),
                    const Divider(),
                    _Item(label: 'রসিদ নম্বর', value: payment.id),
                    _Item(label: 'তারিখ ও সময়', value: formattedDate),
                    _Item(label: 'টোল গেট', value: payment.gateName),
                    _Item(label: 'সড়ক', value: payment.roadName),
                    _Item(label: 'যানবাহন', value: payment.vehiclePlate),
                    _Item(
                      label: 'টোল ফি',
                      value: CurrencyFormatter.formatPaisa(payment.amount),
                    ),
                    _Item(label: 'পেমেন্ট পদ্ধতি', value: 'TollBD Wallet'),
                    _Item(label: 'স্ট্যাটাস', value: payment.status),
                    const Divider(),
                    const SizedBox(height: AppSpacing.sm),
                    QrImageView(
                      data: payment.id,
                      size: 120,
                      foregroundColor: AppColors.textPrimary,
                    ),
                  ],
                ),
              ),
              const SizedBox(height: AppSpacing.md),
              Row(
                children: [
                  Expanded(
                    child: OutlinedButton.icon(
                      onPressed: () async {
                        final pdfData = await _buildPdf(
                          txId: payment.id,
                          gate: payment.gateName,
                          road: payment.roadName,
                          vehicle: payment.vehiclePlate,
                          amount: CurrencyFormatter.formatPaisa(payment.amount),
                          date: formattedDate,
                          status: payment.status,
                        );
                        if (!context.mounted) return;
                        await Printing.layoutPdf(onLayout: (_) => pdfData);
                      },
                      icon: const Icon(Icons.picture_as_pdf_rounded),
                      label: const Text('PDF'),
                    ),
                  ),
                  const SizedBox(width: AppSpacing.sm),
                  Expanded(
                    child: OutlinedButton.icon(
                      onPressed: () async {
                        final pdfData = await _buildPdf(
                          txId: payment.id,
                          gate: payment.gateName,
                          road: payment.roadName,
                          vehicle: payment.vehiclePlate,
                          amount: CurrencyFormatter.formatPaisa(payment.amount),
                          date: formattedDate,
                          status: payment.status,
                        );
                        if (!context.mounted) return;
                        await Printing.sharePdf(
                          bytes: pdfData,
                          filename: 'receipt-${payment.id}.pdf',
                        );
                      },
                      icon: const Icon(Icons.share_rounded),
                      label: const Text('Share'),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: AppSpacing.sm),
              FilledButton.icon(
                style:
                    FilledButton.styleFrom(backgroundColor: AppColors.accent),
                onPressed: () =>
                    context.push('/history/dispute?paymentId=${payment.id}'),
                icon: const Icon(Icons.report_problem_outlined),
                label: Text(
                    language == 'bn' ? 'বিরোধ দাখিল করুন' : 'Raise Dispute'),
              ),
            ],
          );
        },
      ),
    );
  }
}

pw.Widget _pdfRow(String label, String value) {
  return pw.Padding(
    padding: const pw.EdgeInsets.symmetric(vertical: 4),
    child: pw.Row(
      children: [
        pw.Expanded(child: pw.Text(label)),
        pw.Expanded(
          child: pw.Text(
            value,
            textAlign: pw.TextAlign.right,
            style: pw.TextStyle(fontWeight: pw.FontWeight.bold),
          ),
        ),
      ],
    ),
  );
}

class _Item extends StatelessWidget {
  const _Item({required this.label, required this.value});

  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        children: [
          Expanded(child: Text(label, style: AppTextStyles.bodySmall)),
          Expanded(
            child: Text(
              value,
              textAlign: TextAlign.end,
              style: AppTextStyles.bodySmall.copyWith(
                color: AppColors.textPrimary,
                fontWeight: FontWeight.w700,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
