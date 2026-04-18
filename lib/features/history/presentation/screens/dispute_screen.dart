import 'dart:io';

import 'package:firebase_auth/firebase_auth.dart';
import 'package:firebase_storage/firebase_storage.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:image_picker/image_picker.dart';

import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_spacing.dart';
import '../../../../core/constants/app_text_styles.dart';
import '../../../auth/presentation/providers/auth_provider.dart';
import '../providers/history_provider.dart';

class DisputeScreen extends ConsumerStatefulWidget {
  const DisputeScreen({super.key, required this.paymentId});

  final String paymentId;

  @override
  ConsumerState<DisputeScreen> createState() => _DisputeScreenState();
}

class _DisputeScreenState extends ConsumerState<DisputeScreen> {
  String _reason = 'wrong_amount';
  final _descriptionController = TextEditingController();
  bool _submitting = false;
  final List<File> _evidence = [];

  static const _reasons = [
    ('wrong_amount', 'ভুল পরিমাণ চার্জ হয়েছে', 'Wrong amount charged'),
    ('not_my_vehicle', 'এটি আমার গাড়ি নয়', 'Not my vehicle'),
    ('gate_error', 'গেট খোলেনি', 'Gate error'),
    ('double_charge', 'দ্বিগুণ চার্জ হয়েছে', 'Double charge'),
    ('other', 'অন্যান্য', 'Other'),
  ];

  @override
  void dispose() {
    _descriptionController.dispose();
    super.dispose();
  }

  Future<void> _pickEvidence() async {
    final file = await ImagePicker().pickImage(source: ImageSource.gallery);
    if (file == null) return;
    setState(() => _evidence.add(File(file.path)));
  }

  Future<List<String>> _uploadEvidence() async {
    final uid = FirebaseAuth.instance.currentUser?.uid;
    if (uid == null || _evidence.isEmpty) return const [];
    final urls = <String>[];
    for (final file in _evidence) {
      final ref = FirebaseStorage.instance.ref().child(
            'disputes/$uid/${DateTime.now().millisecondsSinceEpoch}-${file.path.split('/').last}',
          );
      await ref.putFile(file);
      urls.add(await ref.getDownloadURL());
    }
    return urls;
  }

  Future<void> _submit() async {
    if (_submitting) return;
    setState(() => _submitting = true);
    final language = ref.read(languageProvider);
    try {
      final urls = await _uploadEvidence();
      final result = await ref.read(historyActionsProvider).createDispute(
            tollPaymentId: widget.paymentId,
            reason: _reason,
            description: _descriptionController.text.trim(),
            evidenceUrls: urls,
          );
      if (!mounted) return;
      final disputeId = result['disputeId']?.toString() ?? '';
      await showDialog<void>(
        context: context,
        builder: (context) => AlertDialog(
          title: Text(
              language == 'bn' ? 'বিরোধ দাখিল সম্পন্ন' : 'Dispute submitted'),
          content: Text(
            language == 'bn'
                ? 'আপনার বিরোধ #$disputeId নিবন্ধিত হয়েছে\n৭ কার্যদিবসের মধ্যে সমাধান করা হবে'
                : 'Your dispute #$disputeId has been registered.\nResolution within 7 business days.',
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(context).pop(),
              child: const Text('OK'),
            ),
          ],
        ),
      );
      if (!mounted) return;
      context.go('/history');
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(e.toString())),
      );
    } finally {
      if (mounted) setState(() => _submitting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final language = ref.watch(languageProvider);
    return Scaffold(
      appBar: AppBar(
        title: Text(language == 'bn' ? 'বিরোধ দাখিল করুন' : 'Raise Dispute'),
      ),
      body: ListView(
        padding: const EdgeInsets.all(AppSpacing.lg),
        children: [
          Container(
            padding: const EdgeInsets.all(AppSpacing.md),
            decoration: BoxDecoration(
              color: AppColors.surfaceVariant,
              borderRadius: BorderRadius.circular(AppRadius.md),
            ),
            child: Text(
              '${language == 'bn' ? 'ট্রানজেকশন' : 'Transaction'}: ${widget.paymentId}',
              style: AppTextStyles.bodySmall,
            ),
          ),
          const SizedBox(height: AppSpacing.md),
          ..._reasons.map(
            (item) => RadioListTile<String>(
              value: item.$1,
              groupValue: _reason,
              onChanged: (value) => setState(() => _reason = value ?? _reason),
              title: Text(language == 'bn' ? item.$2 : item.$3),
              contentPadding: EdgeInsets.zero,
            ),
          ),
          const SizedBox(height: AppSpacing.sm),
          TextField(
            controller: _descriptionController,
            maxLines: 4,
            decoration: InputDecoration(
              labelText: language == 'bn'
                  ? 'বিস্তারিত বলুন (ঐচ্ছিক)'
                  : 'Details (optional)',
            ),
          ),
          const SizedBox(height: AppSpacing.md),
          OutlinedButton.icon(
            onPressed: _pickEvidence,
            icon: const Icon(Icons.upload_file_rounded),
            label: Text(
              language == 'bn'
                  ? 'প্রমাণের ছবি আপলোড করুন (ঐচ্ছিক)'
                  : 'Upload evidence (optional)',
            ),
          ),
          if (_evidence.isNotEmpty) ...[
            const SizedBox(height: AppSpacing.sm),
            Wrap(
              spacing: AppSpacing.sm,
              runSpacing: AppSpacing.sm,
              children: _evidence
                  .map(
                    (file) => ClipRRect(
                      borderRadius: BorderRadius.circular(10),
                      child: Image.file(file,
                          width: 74, height: 74, fit: BoxFit.cover),
                    ),
                  )
                  .toList(),
            ),
          ],
          const SizedBox(height: AppSpacing.xl),
          FilledButton(
            onPressed: _submit,
            style: FilledButton.styleFrom(backgroundColor: AppColors.accent),
            child: _submitting
                ? const SizedBox(
                    height: 20,
                    width: 20,
                    child: CircularProgressIndicator(
                      strokeWidth: 2,
                      color: Colors.white,
                    ),
                  )
                : Text(language == 'bn' ? 'দাখিল করুন' : 'Submit'),
          ),
        ],
      ),
    );
  }
}
