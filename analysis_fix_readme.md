This file was added by the assistant to document why code generation was run.

Run the following to regenerate `*.freezed.dart` and `*.g.dart` files if needed:

```bash
flutter pub get
flutter pub run build_runner build --delete-conflicting-outputs
```

These commands generate model serialization and freezed helper files required by the project.
