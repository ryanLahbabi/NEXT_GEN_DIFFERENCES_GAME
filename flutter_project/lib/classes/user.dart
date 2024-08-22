class User {
  final String imagePath;
  final String name;
  final String about;

  const User({
    required this.imagePath,
    required this.name,
    required this.about,
  });

  User copyWith({
    String? imagePath,
    String? name,
    String? about,
  }) {
    return User(
      imagePath: imagePath ?? this.imagePath,
      name: name ?? this.name,
      about: about ?? this.about,
    );
  }
}

//USER DUMMY
class UserPreferences {
  static const myUser = User(
    imagePath:
        'https://www.wfla.com/wp-content/uploads/sites/71/2023/05/GettyImages-1389862392.jpg?w=2560&h=1440&crop=1',
    name: 'The Cat',
    about: 'Certified Cat with years of experience.',
  );
}
