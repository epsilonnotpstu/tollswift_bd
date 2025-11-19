// lib/presentation/screens/auth/login_screen.dart
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:tollswift_bd/presentation/providers/auth_provider.dart';

class LoginScreen extends ConsumerStatefulWidget {
  const LoginScreen({super.key});

  @override
  ConsumerState<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends ConsumerState<LoginScreen> {
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _isLoading = false;

  Future<void> _signInWithGoogle() async {
    setState(() => _isLoading = true);
    final result = await ref.read(authRepositoryProvider).signInWithGoogle();
    setState(() => _isLoading = false);

    result.fold(
      (error) => ScaffoldMessenger.of(context)
          .showSnackBar(SnackBar(content: Text(error))),
      (_) => null, // GoRouter will auto-redirect
    );
  }

  Future<void> _signInWithEmail() async {
    if (_emailController.text.isEmpty || _passwordController.text.isEmpty) {
      ScaffoldMessenger.of(context)
          .showSnackBar(const SnackBar(content: Text("Fill all fields")));
      return;
    }
    setState(() => _isLoading = true);
    final result =
        await ref.read(authRepositoryProvider).signInWithEmailAndPassword(
              _emailController.text.trim(),
              _passwordController.text,
            );
    setState(() => _isLoading = false);

    result.fold(
      (error) => ScaffoldMessenger.of(context)
          .showSnackBar(SnackBar(content: Text(error))),
      (_) => null,
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const SizedBox(height: 60),

              // Logo
              Center(
                child: Container(
                  padding: const EdgeInsets.all(20),
                  decoration: BoxDecoration(
                    gradient: const LinearGradient(
                        colors: [Color(0xFF1A73E8), Color(0xFF4285F4)]),
                    borderRadius: BorderRadius.circular(32),
                  ),
                  child: const Icon(Icons.account_balance_wallet_rounded,
                      size: 64, color: Colors.white),
                ),
              ),

              const SizedBox(height: 32),
              Text("Welcome Back",
                  style: Theme.of(context)
                      .textTheme
                      .headlineMedium
                      ?.copyWith(fontWeight: FontWeight.bold)),
              Text("Sign in to continue",
                  style: Theme.of(context).textTheme.titleMedium),

              const SizedBox(height: 40),

              // Google Sign In Button
              // In login_screen.dart → Replace Google button onPressed:
              ElevatedButton.icon(
                onPressed: _isLoading
                    ? null
                    : () async {
                        setState(() => _isLoading = true);
                        final user = await ref
                            .read(authRepositoryProvider)
                            .signInWithGoogle();
                        setState(() => _isLoading = false);

                        if (user != null) {
                          // GoRouter will auto redirect
                        } else {
                          ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(
                                content:
                                    Text("Google Sign In failed or cancelled")),
                          );
                        }
                      },
                icon: Image.asset("assets/images/google_logo.png",
                    width: 24, height: 24),
                label: const Text("Continue with Google"),
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.white,
                  foregroundColor: Colors.black87,
                  minimumSize: const Size(double.infinity, 56),
                  shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(16)),
                ),
              ),

              const SizedBox(height: 24),
              const Row(children: [
                Expanded(child: Divider()),
                Text("  or  "),
                Expanded(child: Divider())
              ]),
              const SizedBox(height: 24),

              // Email Field
              TextField(
                controller: _emailController,
                decoration: InputDecoration(
                  labelText: "Email",
                  prefixIcon: const Icon(Icons.email_outlined),
                  border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(16)),
                ),
                keyboardType: TextInputType.emailAddress,
              ),
              const SizedBox(height: 16),

              // Password Field
              TextField(
                controller: _passwordController,
                obscureText: true,
                decoration: InputDecoration(
                  labelText: "Password",
                  prefixIcon: const Icon(Icons.lock_outline),
                  border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(16)),
                ),
              ),
              const SizedBox(height: 24),

              // Sign In Button
              ElevatedButton(
                onPressed: _isLoading ? null : _signInWithEmail,
                style: ElevatedButton.styleFrom(
                  backgroundColor: Theme.of(context).colorScheme.primary,
                  minimumSize: const Size(double.infinity, 56),
                  shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(16)),
                ),
                child: _isLoading
                    ? const CircularProgressIndicator(color: Colors.white)
                    : const Text("Sign In",
                        style: TextStyle(fontSize: 16, color: Colors.white)),
              ),

              const SizedBox(height: 24),

              // Sign Up Link
              Center(
                child: TextButton(
                  onPressed: () => context.push('/auth/register'),
                  child: RichText(
                    text: TextSpan(
                      style: Theme.of(context).textTheme.bodyMedium,
                      children: const [
                        TextSpan(text: "Don't have an account? "),
                        TextSpan(
                            text: "Sign up",
                            style: TextStyle(
                                fontWeight: FontWeight.bold,
                                color: Color(0xFF1A73E8))),
                      ],
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
