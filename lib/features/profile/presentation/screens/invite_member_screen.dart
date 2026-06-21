import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/constants/app_spacing.dart';
import '../../../../core/constants/app_text_styles.dart';
import '../../../auth/presentation/providers/auth_provider.dart';
import '../providers/profile_provider.dart';

class InviteMemberScreen extends ConsumerStatefulWidget {
  const InviteMemberScreen({super.key, required this.familyId});

  final String familyId;

  @override
  ConsumerState<InviteMemberScreen> createState() => _InviteMemberScreenState();
}

class _InviteMemberScreenState extends ConsumerState<InviteMemberScreen> {
  final _phoneController = TextEditingController();
  bool _loading = false;

  @override
  void dispose() {
    _phoneController.dispose();
    super.dispose();
  }

  Future<void> _invite() async {
    final language = ref.read(languageProvider);
    final phone = _phoneController.text.trim();
    if (phone.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(language == 'bn' ? 'ফোন নম্বর দিন' : 'Enter phone number')),
      );
      return;
    }

    setState(() => _loading = true);
    try {
      await ref.read(profileActionsProvider).inviteFamilyMember(
            familyId: widget.familyId,
            phone: phone,
          );
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            language == 'bn' ? 'সদস্য যুক্ত হয়েছে' : 'Member has been added',
          ),
        ),
      );
      context.pop();
    } catch (error) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(error.toString())),
      );
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final language = ref.watch(languageProvider);

    return Scaffold(
      appBar: AppBar(
        title: Text(language == 'bn' ? 'সদস্য যোগ করুন' : 'Invite member'),
      ),
      body: ListView(
        padding: const EdgeInsets.all(AppSpacing.lg),
        children: [
          Text(
            language == 'bn'
                ? 'ফোন নম্বর দিয়ে সদস্য যোগ করুন'
                : 'Add a member using their phone number',
            style: AppTextStyles.bodyMedium,
          ),
          const SizedBox(height: AppSpacing.md),
          TextField(
            controller: _phoneController,
            keyboardType: TextInputType.phone,
            decoration: InputDecoration(
              labelText: language == 'bn' ? 'ফোন নম্বর' : 'Phone number',
              hintText: language == 'bn' ? '+8801XXXXXXXXX' : '+8801XXXXXXXXX',
            ),
          ),
          const SizedBox(height: AppSpacing.lg),
          FilledButton.icon(
            onPressed: _loading ? null : _invite,
            icon: const Icon(Icons.send_rounded),
            label: _loading
                ? const SizedBox(
                    height: 18,
                    width: 18,
                    child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                  )
                : Text(language == 'bn' ? 'আমন্ত্রণ পাঠান' : 'Send invite'),
          ),
        ],
      ),
    );
  }
}
