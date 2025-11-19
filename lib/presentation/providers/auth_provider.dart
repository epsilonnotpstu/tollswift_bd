import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:tollswift_bd/data/repositories_impl/auth_repository_impl.dart';
import 'package:tollswift_bd/domain/entities/user_entity.dart';
import 'package:tollswift_bd/domain/repositories/auth_repository.dart';

// Provide the concrete implementation but type the provider as the interface
final authRepositoryProvider =
    Provider<AuthRepository>((ref) => AuthRepositoryImpl() as AuthRepository);

final authStateProvider = StreamProvider<UserEntity?>((ref) {
  final repo = ref.watch(authRepositoryProvider);
  return repo.user;
});

final currentUserProvider = Provider<UserEntity?>((ref) {
  return ref.watch(authStateProvider).value;
});
