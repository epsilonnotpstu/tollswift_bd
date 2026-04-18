import 'dart:io';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:image_picker/image_picker.dart';

import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_spacing.dart';
import '../../../../core/constants/app_text_styles.dart';
import '../../../../core/widgets/loading_overlay.dart';
import '../../../auth/presentation/providers/auth_provider.dart';
import '../../data/brtc_service.dart';
import '../providers/vehicle_provider.dart';
import 'vehicle_type_selector.dart';

class AddVehicleScreen extends ConsumerStatefulWidget {
  const AddVehicleScreen({super.key});

  @override
  ConsumerState<AddVehicleScreen> createState() => _AddVehicleScreenState();
}

class _AddVehicleScreenState extends ConsumerState<AddVehicleScreen> {
  final _plateController = TextEditingController();
  final _ownerController = TextEditingController();
  final _makeModelController = TextEditingController();
  final _nicknameController = TextEditingController();
  final _yearController = TextEditingController(text: DateTime.now().year.toString());

  String _vehicleType = 'car';
  String _color = 'White';
  int _step = 1;
  bool _loading = false;
  bool _verifying = false;
  BRTCVerificationResult? _brtcResult;
  File? _registrationFile;

  static const _colorOptions = [
    'White',
    'Black',
    'Silver',
    'Red',
    'Blue',
    'Yellow',
    'Green',
    'Other',
  ];

  static const _colorMap = {
    'White': Color(0xFFFFFFFF),
    'Black': Color(0xFF111827),
    'Silver': Color(0xFF9CA3AF),
    'Red': Color(0xFFEF4444),
    'Blue': Color(0xFF3B82F6),
    'Yellow': Color(0xFFEAB308),
    'Green': Color(0xFF10B981),
    'Other': Color(0xFF6B7280),
  };

  @override
  void dispose() {
    _plateController.dispose();
    _ownerController.dispose();
    _makeModelController.dispose();
    _nicknameController.dispose();
    _yearController.dispose();
    super.dispose();
  }

  Future<void> _verifyBrtc() async {
    final plate = _plateController.text.trim();
    if (plate.isEmpty) return;
    setState(() {
      _verifying = true;
      _brtcResult = null;
    });
    try {
      final result = await ref.read(vehicleActionsProvider).verifyWithBrtc(plate);
      if (!mounted) return;
      setState(() {
        _verifying = false;
        _brtcResult = result;
        if (result.verified) {
          _ownerController.text = result.ownerName ?? _ownerController.text;
          _makeModelController.text = [
            result.make ?? '',
            result.model ?? '',
          ].where((item) => item.trim().isNotEmpty).join(' ');
          _yearController.text =
              (result.year ?? DateTime.now().year).toString();
          _color = result.color ?? _color;
          _vehicleType = (result.vehicleType ?? _vehicleType).toLowerCase();
        }
      });
    } catch (_) {
      if (!mounted) return;
      setState(() {
        _verifying = false;
        _brtcResult = const BRTCVerificationResult(status: BRTCStatus.apiError);
      });
    }
  }

  Future<void> _pickRegistration() async {
    final file = await ImagePicker().pickImage(
      source: ImageSource.gallery,
      imageQuality: 85,
      maxWidth: 1800,
    );
    if (file == null) return;
    setState(() => _registrationFile = File(file.path));
  }

  Future<void> _submit() async {
    final language = ref.read(languageProvider);
    if (_plateController.text.trim().isEmpty || _makeModelController.text.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            language == 'bn'
                ? 'প্রয়োজনীয় তথ্য দিন'
                : 'Please fill required fields',
          ),
        ),
      );
      return;
    }
    if (_registrationFile == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            language == 'bn'
                ? 'নিবন্ধন কার্ডের ছবি আপলোড করুন'
                : 'Please upload registration document',
          ),
        ),
      );
      return;
    }

    setState(() => _loading = true);
    try {
      final makeModel = _makeModelController.text.trim().split(RegExp(r'\s+'));
      final make = makeModel.isNotEmpty ? makeModel.first : '';
      final model = makeModel.length > 1
          ? makeModel.sublist(1).join(' ')
          : '';
      await ref.read(vehicleActionsProvider).addVehicle(
            plateNumber: _plateController.text.trim(),
            vehicleType: _vehicleType,
            make: make,
            model: model,
            color: _color,
            year: int.tryParse(_yearController.text.trim()) ?? DateTime.now().year,
            nickname: _nicknameController.text.trim(),
            brtcVerified: _brtcResult?.verified ?? false,
            brtcData: _brtcResult?.raw,
            registrationFile: _registrationFile,
          );
      if (!mounted) return;
      context.go('/vehicles');
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(language == 'bn' ? 'গাড়ি যোগ করা হয়েছে!' : 'Vehicle added successfully!'),
        ),
      );
    } catch (e) {
      if (!mounted) return;
      setState(() => _loading = false);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(e.toString())),
      );
    }
  }

  Widget _buildBrtcBanner(String language) {
    if (_verifying) {
      return Container(
        margin: const EdgeInsets.only(top: AppSpacing.sm),
        padding: const EdgeInsets.all(AppSpacing.md),
        decoration: BoxDecoration(
          color: AppColors.infoBg,
          borderRadius: BorderRadius.circular(AppRadius.md),
        ),
        child: Text(
          language == 'bn'
              ? 'BRTC ডেটাবেজে খোঁজা হচ্ছে...'
              : 'Searching in BRTC database...',
          style: AppTextStyles.bodySmall.copyWith(color: AppColors.info),
        ),
      );
    }
    final result = _brtcResult;
    if (result == null) return const SizedBox.shrink();
    if (result.status == BRTCStatus.verified) {
      return Container(
        margin: const EdgeInsets.only(top: AppSpacing.sm),
        padding: const EdgeInsets.all(AppSpacing.md),
        decoration: BoxDecoration(
          color: AppColors.successBg,
          borderRadius: BorderRadius.circular(AppRadius.md),
        ),
        child: Text(
          language == 'bn'
              ? '✓ BRTC যাচাই সফল (${result.ownerName ?? ''})'
              : '✓ BRTC verification successful (${result.ownerName ?? ''})',
          style: AppTextStyles.bodySmall.copyWith(color: AppColors.success),
        ),
      );
    }
    if (result.status == BRTCStatus.notFound) {
      return Container(
        margin: const EdgeInsets.only(top: AppSpacing.sm),
        padding: const EdgeInsets.all(AppSpacing.md),
        decoration: BoxDecoration(
          color: AppColors.warningBg,
          borderRadius: BorderRadius.circular(AppRadius.md),
        ),
        child: Text(
          language == 'bn'
              ? 'নিবন্ধন পাওয়া যায়নি — আপনাকে ম্যানুয়ালি যোগ করতে হবে'
              : 'Registration not found - manual review required',
          style: AppTextStyles.bodySmall.copyWith(color: AppColors.warning),
        ),
      );
    }
    return Container(
      margin: const EdgeInsets.only(top: AppSpacing.sm),
      padding: const EdgeInsets.all(AppSpacing.md),
      decoration: BoxDecoration(
        color: AppColors.errorBg,
        borderRadius: BorderRadius.circular(AppRadius.md),
      ),
      child: Text(
        language == 'bn'
            ? 'BRTC সার্ভার এখন উপলব্ধ নয়'
            : 'BRTC server is unavailable now',
        style: AppTextStyles.bodySmall.copyWith(color: AppColors.error),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final language = ref.watch(languageProvider);
    return LoadingOverlay(
      loading: _loading,
      child: Scaffold(
        backgroundColor: AppColors.background,
        appBar: AppBar(
          title: Text(language == 'bn' ? 'গাড়ি যোগ করুন' : 'Add Vehicle'),
        ),
        body: ListView(
          padding: const EdgeInsets.all(AppSpacing.lg),
          children: [
            Row(
              children: [
                _StepDot(active: _step == 1),
                const SizedBox(width: AppSpacing.sm),
                _StepDot(active: _step == 2),
              ],
            ),
            const SizedBox(height: AppSpacing.md),
            if (_step == 1) ...[
              Text(
                language == 'bn' ? 'যানবাহনের ধরন' : 'Vehicle Type',
                style: AppTextStyles.h4,
              ),
              const SizedBox(height: AppSpacing.sm),
              VehicleTypeSelector(
                language: language,
                selectedType: _vehicleType,
                onChanged: (value) => setState(() => _vehicleType = value),
              ),
              const SizedBox(height: AppSpacing.lg),
              Text(language == 'bn' ? 'নিবন্ধন নম্বর' : 'Registration Number'),
              const SizedBox(height: AppSpacing.xs),
              TextField(
                controller: _plateController,
                textCapitalization: TextCapitalization.characters,
                decoration: InputDecoration(
                  hintText: language == 'bn'
                      ? 'উদাহরণ: DHAKA METRO GA 11-1111'
                      : 'Example: DHAKA METRO GA 11-1111',
                ),
              ),
              const SizedBox(height: AppSpacing.sm),
              OutlinedButton(
                onPressed: _verifying ? null : _verifyBrtc,
                child: Text(language == 'bn' ? 'BRTC দিয়ে যাচাই করুন' : 'Verify with BRTC'),
              ),
              _buildBrtcBanner(language),
              const SizedBox(height: AppSpacing.lg),
              TextField(
                controller: _ownerController,
                decoration: InputDecoration(
                  labelText: language == 'bn' ? 'মালিকের নাম' : 'Owner Name',
                ),
              ),
              const SizedBox(height: AppSpacing.md),
              Text(language == 'bn' ? 'গাড়ির রঙ' : 'Vehicle Color'),
              const SizedBox(height: AppSpacing.sm),
              Wrap(
                spacing: AppSpacing.sm,
                runSpacing: AppSpacing.sm,
                children: _colorOptions.map((item) {
                  final selected = _color == item;
                  return ChoiceChip(
                    selected: selected,
                    label: Text(item),
                    onSelected: (_) => setState(() => _color = item),
                    avatar: CircleAvatar(
                      backgroundColor: _colorMap[item],
                    ),
                  );
                }).toList(),
              ),
              const SizedBox(height: AppSpacing.md),
              TextField(
                controller: _makeModelController,
                decoration: InputDecoration(
                  labelText: language == 'bn'
                      ? 'নির্মাতা ও মডেল'
                      : 'Make and Model',
                  hintText: 'Toyota Corolla',
                ),
              ),
              const SizedBox(height: AppSpacing.md),
              TextField(
                controller: _yearController,
                keyboardType: TextInputType.number,
                inputFormatters: [FilteringTextInputFormatter.digitsOnly],
                decoration: InputDecoration(
                  labelText: language == 'bn' ? 'নির্মাণ বছর' : 'Manufacture Year',
                ),
              ),
              const SizedBox(height: AppSpacing.md),
              TextField(
                controller: _nicknameController,
                decoration: InputDecoration(
                  labelText: language == 'bn' ? 'ডাকনাম (ঐচ্ছিক)' : 'Nickname (optional)',
                ),
              ),
              const SizedBox(height: AppSpacing.lg),
              FilledButton(
                onPressed: () => setState(() => _step = 2),
                child: Text(language == 'bn' ? 'পরবর্তী' : 'Next'),
              ),
            ] else ...[
              Text(
                language == 'bn'
                    ? 'নিবন্ধন কার্ডের ছবি আপলোড করুন'
                    : 'Upload registration document',
                style: AppTextStyles.h4,
              ),
              const SizedBox(height: AppSpacing.md),
              InkWell(
                onTap: _pickRegistration,
                borderRadius: BorderRadius.circular(AppRadius.lg),
                child: Container(
                  padding: const EdgeInsets.all(AppSpacing.xl),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(AppRadius.lg),
                    border: Border.all(
                      color: AppColors.cardBorder,
                      width: 1.4,
                    ),
                  ),
                  child: Column(
                    children: [
                      Icon(
                        _registrationFile == null
                            ? Icons.upload_file_rounded
                            : Icons.check_circle_rounded,
                        color: _registrationFile == null
                            ? AppColors.textHint
                            : AppColors.success,
                        size: 40,
                      ),
                      const SizedBox(height: AppSpacing.sm),
                      Text(
                        _registrationFile == null
                            ? (language == 'bn'
                                ? 'ছবি তুলুন বা গ্যালারি থেকে বেছে নিন'
                                : 'Pick image from gallery')
                            : _registrationFile!.path.split('/').last,
                        textAlign: TextAlign.center,
                        style: AppTextStyles.bodySmall,
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: AppSpacing.md),
              Text(
                language == 'bn'
                    ? 'আপনার ডকুমেন্ট নিরাপদে সংরক্ষিত হবে এবং শুধুমাত্র যাচাইয়ের জন্য ব্যবহার হবে'
                    : 'Document will be stored securely and used only for verification.',
                style: AppTextStyles.bodySmall,
              ),
              const SizedBox(height: AppSpacing.xl),
              FilledButton(
                onPressed: _submit,
                child: Text(language == 'bn' ? 'গাড়ি যোগ করুন' : 'Add Vehicle'),
              ),
              const SizedBox(height: AppSpacing.sm),
              TextButton(
                onPressed: () => setState(() => _step = 1),
                child: Text(language == 'bn' ? 'আগের ধাপ' : 'Back'),
              ),
            ],
          ],
        ),
      ),
    );
  }
}

class _StepDot extends StatelessWidget {
  const _StepDot({required this.active});

  final bool active;

  @override
  Widget build(BuildContext context) {
    return AnimatedContainer(
      duration: const Duration(milliseconds: 180),
      width: active ? 26 : 14,
      height: 14,
      decoration: BoxDecoration(
        color: active ? AppColors.primary : AppColors.cardBorder,
        borderRadius: BorderRadius.circular(99),
      ),
    );
  }
}
