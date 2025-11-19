import 'package:fpdart/fpdart.dart';
import 'package:tollswift_bd/domain/entities/user_entity.dart';

abstract class AuthRepository {
  Stream<UserEntity?> get user;
  Future<Either<String, UserEntity>> signInWithGoogle();
  Future<Either<String, UserEntity>> registerWithEmailAndPassword({
    required String email,
    required String password,
    required String name,
    String? phone,
  });
  Future<Either<String, UserEntity>> signInWithEmailAndPassword(String email, String password);
  Future<Either<String, Unit>> signOut();
}