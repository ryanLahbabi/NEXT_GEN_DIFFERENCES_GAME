import 'dart:convert';

import 'package:flutter_project/environnment.dart';
import 'package:http/http.dart' as http;

class SendMessageService {
  static Future<void> sendEmail(String email, String verificationCode) async {
    final url =
        Uri.parse('${Environnment.httpLink}/auth/send-verification-email');
    final response = await http.post(
      url,
      body: jsonEncode({'email': email, 'verificationCode': verificationCode}),
      headers: {'Content-Type': 'application/json'},
    );

    if (response.statusCode == 200) {
      // Email sent successfully
      print('Email sent successfully');
    } else {
      // Error sending email
      throw Exception('Failed to send email');
    }
  }

  static Future<void> sendConfirmation(String email) async {
    final url =
        Uri.parse('${Environnment.httpLink}/auth/send-confirmation-email');
    final response = await http.post(
      url,
      body: jsonEncode({'email': email}),
      headers: {'Content-Type': 'application/json'},
    );

    if (response.statusCode == 200) {
      // Confirmation email sent successfully
      print('Confirmation email sent successfully');
    } else {
      // Error sending confirmation email
      throw Exception('Failed to send confirmation email');
    }
  }

  static Future<void> updatePassword(String email, String password) async {
    final apiUrl = Uri.parse('${Environnment.httpLink}/auth/update-password');

    final Map<String, String> headers = {
      'Content-Type': 'application/json',
    };

    final Map<String, dynamic> body = {
      'email': email,
      'password': password,
    };

    final http.Response response = await http.put(
      apiUrl,
      headers: headers,
      body: jsonEncode(body),
    );

    if (response.statusCode == 200) {
      // Password updated successfully
      print("password changed");
    } else {
      // Handle error
      throw Exception('Failed to update password: ${response.body}');
    }
  }
}
