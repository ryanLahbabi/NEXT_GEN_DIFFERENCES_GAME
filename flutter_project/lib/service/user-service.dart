import 'dart:convert';

import 'package:flutter_project/environnment.dart';
import 'package:flutter_project/service/authentication-service.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

import '../dtos/channel-dto.dart';

class UserDataService {
  static final UserDataService _instance = UserDataService._internal();
  final String baseUrl = Environnment.httpLink;
  String username = "";
  String biography = "";
  String avatar = "";
  List<String> channels = [];
  PrivateUserDataDTO? userData;

  SharedPreferences? _prefs;

  UserDataService._internal();

  static UserDataService get instance => _instance;

  Future<void> init() async {
    _prefs = await SharedPreferences.getInstance();
    print('Initialized UserDataService');
    await fetchUserData();
  }

  Future<Map<String, dynamic>> fetchUserData() async {
    final token = await AuthService.instance.getToken();
    final response = await http.get(
      Uri.parse('${Environnment.httpLink}/user/me'),
      headers: {'Authorization': 'Bearer $token'},
    );

    if (response.statusCode == 201) {
      final Map<String, dynamic> userData = json.decode(response.body);
      saveUserDataToLocalStorage(userData);
      List<String> channels = List<String>.from(userData['channels']);
      this.channels = channels;

      return userData;
    } else {
      print('Failed to fetch user data. Status code: ${response.statusCode}');
      print('Response body: ${response.body}');
      throw Exception('Failed to fetch user data');
    }
  }

  Future<String> getUsername() async {
    username = await loadUsernameFromLocalStorage();
    print('Fetched username: $username');
    return username;
  }

  Future<String> getBiography() async {
    biography = await loadBiographyFromLocalStorage();
    print('Fetched biography: $biography');
    return biography;
  }

  Future<String> getAvatar() async {
    avatar = await loadAvatarFromLocalStorage();
    print('Fetched avatar: $avatar');
    return avatar;
  }

  Future<void> saveUserDataToLocalStorage(Map<String, dynamic> userData) async {
    _prefs?.setString('username', userData['username']);
    _prefs?.setString('biography', userData['biography']);
    _prefs?.setString('avatar', userData['avatar']);
  }

  Future<String> loadUsernameFromLocalStorage() async {
    final username = _prefs?.getString('username') ?? '';
    print('Loaded username from local storage: $username');
    return username;
  }

  Future<String> loadBiographyFromLocalStorage() async {
    final biography = _prefs?.getString('biography') ?? '';
    print('Loaded biography from local storage: $biography');
    return biography;
  }

  Future<String> loadAvatarFromLocalStorage() async {
    final avatar = _prefs?.getString('avatar') ?? '';
    print('Loaded avatar from local storage: $avatar');
    return avatar;
  }

  Future<void> saveBiography(String biography) async {
    try {
      final token = await AuthService.instance.getToken();
      final response = await http.put(
        Uri.parse('$baseUrl/user/biography'),
        headers: {
          'Authorization': 'Bearer $token',
          'Content-Type': 'application/json',
        },
        body: json.encode({'biography': biography}),
      );

      if (response.statusCode == 200) {
        print('Biography updated successfully');
      } else {
        print('Error updating biography: ${response.body}');
      }
    } catch (error) {
      print('Error updating biography: $error');
    }
  }

  Future<void> saveAvatar(String avatar) async {
    try {
      final token = await AuthService.instance.getToken();
      final response = await http.put(
        Uri.parse('$baseUrl/user/avatar'),
        headers: {
          'Authorization': 'Bearer $token',
          'Content-Type': 'application/json', // Specify content type
        },
        body: json.encode({'avatar': avatar}), // Encode data to JSON
      );

      if (response.statusCode == 200) {
        print('avatar updated successfully');
      } else {
        print('Error updating avatar: ${response.body}');
      }
    } catch (error) {
      print('Error updating avatar: $error');
    }
  }

  Future<(String, String)> postUsername(String username) async {
    try {
      final token = await AuthService.instance.getToken();
      final response = await http.post(
        Uri.parse('$baseUrl/user/username'),
        headers: {
          'Authorization': 'Bearer $token',
          'Content-Type': 'application/json',
        },
        body: json.encode({'newUsername': username}),
      );

      if (response.statusCode == 200) {
        final Map<String, dynamic> responseBody = json.decode(response.body);
        return (
          responseBody['username'].toString(),
          responseBody['token'].toString()
        );
      } else {
        throw Exception(response.body);
      }
    } catch (error) {
      throw Exception(error);
    }
  }

  Future<void> putLanguage(Language language, {Function()? onSuccess}) async {
    try {
      final token = await AuthService.instance.getToken();
      final response = await http.put(
        Uri.parse('$baseUrl/user/language'),
        headers: {
          'Authorization': 'Bearer $token',
          'Content-Type': 'application/json',
        },
        body: json.encode(
            {'language': language.toString().split('.').last.toLowerCase()}),
      );

      if (response.statusCode == 200) {
        print('Language updated successfully');
        onSuccess?.call();
      } else {
        print('Error updating language: ${response.body}');
      }
    } catch (error) {
      print('Error updating language: $error');
    }
  }

  Future<void> putTheme(Themes theme, {Function()? onSuccess}) async {
    try {
      final token = await AuthService.instance.getToken();
      final response = await http.put(
        Uri.parse('$baseUrl/user/theme'),
        headers: {
          'Authorization': 'Bearer $token',
          'Content-Type': 'application/json',
        },
        body: json
            .encode({'theme': themeToJson(theme)}), // Use themeToJson function
      );

      if (response.statusCode == 200) {
        print('Theme updated successfully');
        onSuccess?.call();
      } else {
        print('Error updating theme: ${response.body}');
      }
    } catch (error) {
      print('Error updating theme: $error');
    }
  }

  Future<void> putSuccess(String success, {Function()? onSuccess}) async {
    print('this is success put $success');
    try {
      final token = await AuthService.instance.getToken();
      final response = await http.put(
        Uri.parse('$baseUrl/user/success'),
        headers: {
          'Authorization': 'Bearer $token',
          'Content-Type': 'application/json',
        },
        body: json.encode({'success': success}),
      );

      if (response.statusCode == 200) {
        print('Success updated successfully');
        onSuccess?.call();
      } else {
        print('Error updating success: ${response.body}');
      }
    } catch (error) {
      print('Error updating success: $error');
    }
  }

  Future<void> putFailure(String failure, {Function()? onFailure}) async {
    print('this is failure put $failure');
    try {
      final token = await AuthService.instance.getToken();
      final response = await http.put(
        Uri.parse('$baseUrl/user/failure'),
        headers: {
          'Authorization': 'Bearer $token',
          'Content-Type': 'application/json',
        },
        body: json.encode({'failure': failure}),
      );

      if (response.statusCode == 200) {
        print('failure updated successfully');
        onFailure?.call();
      } else {
        print('Error updating failure: ${response.body}');
      }
    } catch (error) {
      print('Error updating failure: $error');
    }
  }
}

String themeToJson(Themes theme) {
  return theme.toString().split('.').last.toLowerCase();
}
