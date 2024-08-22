import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:flutter_project/classes/communication-socket.dart';
import 'package:flutter_project/common/socket-event-constants.dart';
import 'package:flutter_project/dtos/channel-dto.dart';
import 'package:flutter_project/environnment.dart';
import 'package:flutter_project/pages/main-page.dart';
import 'package:flutter_project/service/friends-service.dart';
import 'package:flutter_project/service/game-list-manager-service.dart';
import 'package:flutter_project/service/message-service.dart';
import 'package:flutter_project/service/observer-service.dart';
import 'package:flutter_project/service/settings-service.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import 'package:socket_io_client/socket_io_client.dart';

class AuthService {
  final String baseUrl = Environnment.httpLink;

  static final AuthService _instance = AuthService._internal();
  String token = "";
  String username = "";

  late final SharedPreferences _prefs;

  AuthService._internal() {
    _init();
  }

  static AuthService get instance => _instance;

  Future<void> _init() async {}
  List<PrivateUserDataDTO> userData = [];
  Future<String> getUsername() async {
    username = await loadUsernameFromLocalStorage();
    return username;
  }

  Future<String> getToken() async {
    print("getting token");
    token = await loadTokenFromLocalStorage();
    print(token);
    return token;
  }

  bool get isLoggedIn => token.isNotEmpty;

  Future<Map<String, dynamic>> signUp(BuildContext context, String username,
      String password, String email, String avatar) async {
    final response = await http.post(Uri.parse('$baseUrl/auth/signup'), body: {
      'username': username,
      'hashedPassword': password,
      'email': email,
      'avatar': avatar,
    });
    await loadUsernameFromLocalStorage().then((loadedUsername) {
      username = loadedUsername;
    });

    return _handleResponse(response, context);
  }

  Future<Map<String, dynamic>> signIn(
      BuildContext context, String username, String password) async {
    print("this is username $username and password $password");
    final response = await http.post(Uri.parse('$baseUrl/auth/login'), body: {
      'username': username,
      'hashedPassword': password,
    });
    await loadUsernameFromLocalStorage().then((loadedUsername) {
      username = loadedUsername;
    });
    return _handleResponse(response, context);
  }

  Future<void> logout() async {
    token = "";
    username = "";
    CommunicationSocket.clearEventListeners();
    CommunicationSocket.disconnect();
  }

  Future<void> reconnectSocket() async {
    CommunicationSocket.clearEventListeners();
    CommunicationSocket.disconnect();
    await CommunicationSocket.instance.init().then((_) {
      CommunicationSocket.on(FromServer.START_APP, (data) async {
        print('START_APP');
        MessageService.instance.init();
        SettingsService.instance.initData();
        ObserverService.instance.init();
        GameListManagerService.instance.init();
        FriendsService.instance.init();
        FriendsService.instance.displayInitFriends();
      });
    });
  }

  static Socket? socket;
  void navigateToMainPage(BuildContext context) async {
    Navigator.of(context).pushReplacement(MaterialPageRoute(
      builder: (context) => const MainPage(),
    ));
  }

  Map<String, dynamic> _handleResponse(
      http.Response response, BuildContext context) {
    final Map<String, dynamic> responseBody = json.decode(response.body);

    if (response.statusCode == 200 || response.statusCode == 201) {
      token = responseBody['accessToken'];
      saveTokenToLocalStorage(token);
      loadTokenFromLocalStorage().then((loadedToken) {
        token = loadedToken;
      });
      navigateToMainPage(context);

      CommunicationSocket.instance.init().then((_) {
        CommunicationSocket.on(FromServer.START_APP, (data) async {
          print('START_APP');
          MessageService.instance.init();
          SettingsService.instance.initData();
          ObserverService.instance.init();
          GameListManagerService.instance.init();
          FriendsService.instance.init();
          FriendsService.instance.displayInitFriends();
        });
      });

      return responseBody;
    } else if (responseBody['name'] == 'USERNAME_IN_USE') {
      _showSnackBar(context,
          'Le pseudonyme est déjà utilisé. Veuillez en choisir un autre.');

      throw Exception(responseBody['message']);
    } else if (responseBody['name'] == 'EMAIL_IN_USE') {
      _showSnackBar(context,
          'Le courriel est déjà utilisé. Veuillez en choisir un autre.');

      throw Exception(responseBody['message']);
    } else if (responseBody['name'] == 'UnauthorizedException') {
      _showSnackBar(context,
          'Le mot de passe ou le pseudonyme est erroné. Veuillez réessayer.');

      throw Exception(responseBody['message']);
    } else if (responseBody['name'] == 'UnauthorizedException' ||
        responseBody['name'] == 'USER_NOT_FOUND') {
      _showSnackBar(context,
          'Le mot de passe ou le pseudonyme est erroné. Veuillez réessayer.');

      throw Exception(responseBody['message']);
    } else if (responseBody['name'] == 'USER_ALREADY_CONNECTED') {
      _showSnackBar(context,
          'Vous êtes déjà connecté à ce compte sur un autre appareil. Veuillez réessayer.');

      throw Exception(responseBody['message']);
    } else {
      print(responseBody);
      throw Exception(responseBody['message']);
    }
  }

  void _showSnackBar(BuildContext context, String message) {
    final snackBar = SnackBar(
      content: Text(message),
      duration: const Duration(seconds: 5),
      backgroundColor: Colors.red,
      dismissDirection: DismissDirection.up,
      behavior: SnackBarBehavior.floating,
      margin: EdgeInsets.only(bottom: MediaQuery.of(context).size.height - 73),
    );
    ScaffoldMessenger.of(context).showSnackBar(snackBar);
  }

  Future<void> saveTokenToLocalStorage(String token) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('token', token);
  }

  Future<String> loadTokenFromLocalStorage() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('token') ?? '';
  }

  Future<void> clearTokenFromLocalStorage() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('token');
    await prefs.clear();
  }

  Future<void> saveUsernameToLocalStorage(String username) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('username', username);
  }

  Future<String> loadUsernameFromLocalStorage() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('username') ?? '';
  }

  Future<void> clearUsernameFromLocalStorage() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('username');
    await prefs.clear();
  }
}
