// lib/data/repositories_impl/auth_repository_impl.dart
import 'package:firebase_auth/firebase_auth.dart';
import 'package:google_sign_in/google_sign_in.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:tollswift_bd/domain/entities/user_entity.dart';

class AuthRepositoryImpl {
  final FirebaseAuth _auth = FirebaseAuth.instance;
  final GoogleSignIn _googleSignIn = GoogleSignIn();
  final FirebaseFirestore _firestore = FirebaseFirestore.instance;

  Stream<UserEntity?> get user => _auth.authStateChanges().asyncMap((firebaseUser) async {
    if (firebaseUser == null) return null;
    final doc = await _firestore.collection('users').doc(firebaseUser.uid).get();
    if (!doc.exists) return null;
    return UserEntity.fromJson(doc.data()!).copyWith(uid: firebaseUser.uid);
  });

  Future<UserEntity?> signInWithGoogle() async {
    try {
      // Trigger the authentication flow
      final GoogleSignInAccount? googleUser = await _googleSignIn.signIn();

      if (googleUser == null) {
        // User canceled
        return null;
      }

      // Obtain the auth details from the request
      final GoogleSignInAuthentication googleAuth = await googleUser.authentication;

      // Create a new credential
      final credential = GoogleAuthProvider.credential(
        accessToken: googleAuth.accessToken,
        idToken: googleAuth.idToken,
      );

      // Sign in to Firebase with the Google credential
      final UserCredential userCredential = await _auth.signInWithCredential(credential);
      final User? user = userCredential.user;

      if (user != null) {
        await _createUserIfNotExists(user);
        final doc = await _firestore.collection('users').doc(user.uid).get();
        return UserEntity.fromJson(doc.data()!).copyWith(uid: user.uid);
      }
      return null;
    } catch (e) {
      print("Google Sign-In Error: $e");
      return null;
    }
  }

  Future<void> _createUserIfNotExists(User firebaseUser) async {
    final docRef = _firestore.collection('users').doc(firebaseUser.uid);
    final doc = await docRef.get();

    if (!doc.exists) {
      await docRef.set({
        'uid': firebaseUser.uid,
        'name': firebaseUser.displayName ?? 'User',
        'email': firebaseUser.email!,
        'phone': firebaseUser.phoneNumber,
        'photoUrl': firebaseUser.photoURL,
        'walletBalance': 0.0,
        'isPremium': false,
        'hasCompletedOnboarding': false,
        'createdAt': FieldValue.serverTimestamp(),
      });
    }
  }

  Future<void> signOut() async {
    await _googleSignIn.signOut();
    await _auth.signOut();
  }

  // Email login/register methods remain same as before
}