import 'dart:math';

import 'package:flutter/material.dart';
import 'package:flutter_project/classes/applocalization.dart';
import 'package:flutter_project/pages/login-page.dart';
import 'package:flutter_project/service/send-email.dart';

import '../dtos/channel-dto.dart';
import '../service/settings-service.dart';

class ResetPasswordScreen extends StatefulWidget {
  @override
  _ResetPasswordScreenState createState() => _ResetPasswordScreenState();
}

class _ResetPasswordScreenState extends State<ResetPasswordScreen> {
  final TextEditingController rePasswordController = TextEditingController();
  final TextEditingController passwordController = TextEditingController();
  final TextEditingController emailController = TextEditingController();
  final TextEditingController codeController = TextEditingController();
  final GlobalKey<FormState> _formKey = GlobalKey<FormState>();
  final SendMessageService sendMessageService = SendMessageService();
  String email = '';
  bool isValidEmail = false;
  bool isValidCode = false;
  String verificationCode = '';

  void onSubmitEmail(BuildContext context) {
    email = emailController.text;
    if (email.isNotEmpty && isValidEmailFormat(email)) {
      setState(() {
        isValidEmail = true;
        verificationCode = generateRandomCode();
        SendMessageService.sendEmail(email, verificationCode).then((_) {
          // Email sent successfully
        }).catchError((error) {
          // Handle error
        });
      });
    } else {
      // Show a Snackbar with an error message
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Incorrect email format. Please try again.'),
          backgroundColor: Colors.red,
          behavior: SnackBarBehavior.floating, // Set behavior to floating
        ),
      );
    }
  }

  void onSubmitCode(BuildContext context) {
    // Retrieve code from codeController
    String code = codeController.text;
    // Compare entered code with verification code
    if (code == verificationCode) {
      setState(() {
        isValidCode = true;
      });
    } else {
      // Show a Snackbar with an error message
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Incorrect verification code. Please try again.'),
          backgroundColor: Colors.red,
          behavior: SnackBarBehavior.floating, // Set behavior to floating
        ),
      );
    }
  }

  // _showSnackBar(context,
  //     'Le mot de passe ou le pseudonyme est erroné. Veuillez réessayer.');
  void onSubmitPassword(BuildContext context) {
    String password = passwordController.text;
    String rePassword = rePasswordController.text;
    // Check if passwords match
    if (password == rePassword && isValidPasswordFormat(password)) {
      // Passwords match, proceed with confirmation
      SendMessageService.updatePassword(email, rePassword);
      SendMessageService.sendConfirmation(email).then((_) {
        // Password confirmation successful
        // Navigate to login page
        Navigator.of(context).pushReplacement(
          MaterialPageRoute(
            builder: (context) =>
                AuthScreen(), // Replace LoginPage with your login page class
          ),
        );
        // Show success message (optional)
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Password confirmed successfully'),
            backgroundColor: Colors.green,
          ),
        );
      }).catchError((error) {
        // Handle confirmation error
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Error confirming password: $error'),
            backgroundColor: Colors.red,
          ),
        );
        // Navigate to login page on error
        Navigator.of(context).pushReplacement(
          MaterialPageRoute(
            builder: (context) =>
                AuthScreen(), // Replace LoginPage with your login page class
          ),
        );
      });
    } else {
      String errorMessage = '';
      // Passwords don't match or are empty
      if (password != rePassword) {
        errorMessage = 'RESET_MATCH';
      } else {
        errorMessage = 'SIGNUP_ERRORPASSWORD';
      }

      final AppLocalizations appLocalizations = AppLocalizations.of(context)!;
      // Show error message
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(appLocalizations.translate(errorMessage) ?? ""),
          backgroundColor: Colors.red,
        ),
      );
    }
  }

  bool isValidEmailFormat(String email) {
    return RegExp(r'^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$').hasMatch(email);
  }

  bool isValidPasswordFormat(String password) {
    bool isvalid = RegExp(r'^(?=.*\d)(?=.*[a-zA-Z])(?=.*[^a-zA-Z0-9]).+$')
        .hasMatch(password);
    return isvalid;
  }

  String generateRandomCode() {
    Random random = Random();
    int code = 10000 + random.nextInt(90000);
    return code.toString();
  }

  Widget _gap() => const SizedBox(height: 13);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      resizeToAvoidBottomInset: true,
      body: GestureDetector(
        onTap: () => FocusScope.of(context)
            .unfocus(), // Dismiss keyboard when tapping outside
        child: Container(
          decoration: BoxDecoration(
            image: DecorationImage(
              image: AssetImage(
                SettingsService.instance.theme == Themes.dark
                    ? 'assets/dark_background.png'
                    : 'assets/Postboard_background.png',
              ),
              fit: BoxFit.cover,
            ),
          ),
          child: Form(
            key: _formKey,
            child: Center(
              child: SingleChildScrollView(
                child: Padding(
                  padding: EdgeInsets.only(
                      bottom: MediaQuery.of(context).viewInsets.bottom),
                  child: LayoutBuilder(
                    builder: (context, constraints) {
                      final double cardWidth = constraints.maxWidth > 350
                          ? 630.0
                          : constraints.maxWidth * 0.9;
                      return Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Card(
                            elevation: 8,
                            child: Container(
                              width: cardWidth,
                              decoration: BoxDecoration(
                                color: const Color(0xFFabbeff),
                                borderRadius: BorderRadius.circular(0.0),
                              ),
                              padding: const EdgeInsets.all(28.0),
                              child: Column(
                                mainAxisSize: MainAxisSize.min,
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  Transform.translate(
                                    offset: const Offset(10, 45),
                                    child: const Text(
                                      "Reinitialiser le Mot de Passe",
                                      style: TextStyle(
                                        fontWeight: FontWeight.w700,
                                        fontSize: 29,
                                        color: Colors.black,
                                      ),
                                    ),
                                  ),
                                  Transform.translate(
                                    offset: const Offset(10, -43),
                                    child: Transform.rotate(
                                      angle: 0.65,
                                      child: Image.asset(
                                        'assets/push_pin.png',
                                        width: 33,
                                        height: 33,
                                      ),
                                    ),
                                  ),
                                  Padding(
                                    padding: const EdgeInsets.only(top: 8.0),
                                    child: Text(
                                      "",
                                      style:
                                          Theme.of(context).textTheme.caption,
                                      textAlign: TextAlign.center,
                                    ),
                                  ),
                                  _gap(),
                                  if (isValidEmail && !isValidCode)
                                    TextFormField(
                                      controller: codeController,
                                      validator: (value) {
                                        if (value == null || value.isEmpty) {
                                          return 'Entrez votre code';
                                        }
                                      },
                                      decoration: const InputDecoration(
                                        labelText: 'Code',
                                        hintText: 'Entrez votre code',
                                        prefixIcon: Icon(Icons.email_outlined),
                                        border: OutlineInputBorder(),
                                      ),
                                    ),
                                  _gap(),
                                  if (!isValidEmail)
                                    TextFormField(
                                      controller:
                                          emailController, // Use emailController here
                                      validator: (value) {
                                        if (value == null || value.isEmpty) {
                                          return 'Entrez votre courriel';
                                        }
                                        return null;
                                      },
                                      decoration: const InputDecoration(
                                        labelText:
                                            'Entrez votre courriel', // Change labelText to 'Email'
                                        hintText: 'Entrez votre courriel',
                                        prefixIcon: Icon(Icons.email_outlined),
                                        border: OutlineInputBorder(),
                                      ),
                                    ),
                                  _gap(),
                                  if (isValidCode && isValidCode)
                                    TextFormField(
                                      controller: passwordController,
                                      obscureText: true,
                                      validator: (value) {
                                        if (value == null || value.isEmpty) {
                                          return 'Re-entrez votre nouveau mot de passe';
                                        }
                                        bool emailValid = RegExp(
                                                r"^[a-zA-Z0-9.a-zA-Z0-9.!#$%&'*+-/=?^_`{|}~]+@[a-zA-Z0-9]+\.[a-zA-Z]+")
                                            .hasMatch(value);
                                        if (!emailValid) {
                                          return 'Entrez un courriel valide';
                                        }
                                        return null;
                                      },
                                      decoration: const InputDecoration(
                                        labelText:
                                            'Re-entrez votre  nouveau mot de passe', // Change labelText to 'Email'
                                        hintText:
                                            'Re-entrez votre  nouveau mot de passe',
                                        prefixIcon: Icon(Icons.lock_outline),
                                        border: OutlineInputBorder(),
                                      ),
                                    ),
                                  _gap(),
                                  if (isValidCode && isValidCode)
                                    TextFormField(
                                      controller:
                                          rePasswordController, // Use emailController here
                                      obscureText: true,
                                      validator: (value) {
                                        if (value == null || value.isEmpty) {
                                          return 'Re-entrez votre  nouveau mot de passe';
                                        }
                                        bool emailValid = RegExp(
                                                r"^[a-zA-Z0-9.a-zA-Z0-9.!#$%&'*+-/=?^_`{|}~]+@[a-zA-Z0-9]+\.[a-zA-Z]+")
                                            .hasMatch(value);
                                        if (!emailValid) {
                                          return 'Entrez un courriel valide';
                                        }
                                        return null;
                                      },
                                      decoration: const InputDecoration(
                                        labelText:
                                            'Re-entrez votre  nouveau mot de passe', // Change labelText to 'Email'
                                        hintText:
                                            'Re-entrez votre  nouveau mot de passe',
                                        prefixIcon: Icon(Icons.lock_outline),
                                        border: OutlineInputBorder(),
                                      ),
                                    ),
                                  _gap(),
                                  if (!isValidEmail)
                                    SizedBox(
                                      width: double.infinity,
                                      child: ElevatedButton(
                                        style: ElevatedButton.styleFrom(
                                          shape: RoundedRectangleBorder(
                                              borderRadius:
                                                  BorderRadius.circular(4)),
                                        ),
                                        child: const Padding(
                                          padding: EdgeInsets.all(10.0),
                                          child: Text(
                                            'Verify Email',
                                            style: TextStyle(
                                                color: Colors.black,
                                                fontSize: 16,
                                                fontWeight: FontWeight.bold),
                                          ),
                                        ),
                                        onPressed: () {
                                          onSubmitEmail(context);
                                        },
                                      ),
                                    ),
                                  if (isValidEmail && !isValidCode)
                                    SizedBox(
                                      width: double.infinity,
                                      child: ElevatedButton(
                                        style: ElevatedButton.styleFrom(
                                          shape: RoundedRectangleBorder(
                                              borderRadius:
                                                  BorderRadius.circular(4)),
                                        ),
                                        child: const Padding(
                                          padding: EdgeInsets.all(10.0),
                                          child: Text(
                                            'Verify Code',
                                            style: TextStyle(
                                                color: Colors.black,
                                                fontSize: 16,
                                                fontWeight: FontWeight.bold),
                                          ),
                                        ),
                                        onPressed: () {
                                          onSubmitCode(context);
                                        },
                                      ),
                                    ),
                                  if (isValidEmail && isValidCode)
                                    SizedBox(
                                      width: double.infinity,
                                      child: ElevatedButton(
                                        style: ElevatedButton.styleFrom(
                                          shape: RoundedRectangleBorder(
                                              borderRadius:
                                                  BorderRadius.circular(4)),
                                        ),
                                        child: const Padding(
                                          padding: EdgeInsets.all(10.0),
                                          child: Text(
                                            'Verify Password',
                                            style: TextStyle(
                                                color: Colors.black,
                                                fontSize: 16,
                                                fontWeight: FontWeight.bold),
                                          ),
                                        ),
                                        onPressed: () {
                                          onSubmitPassword(context);
                                        },
                                      ),
                                    ),
                                  Padding(
                                    padding: const EdgeInsets.only(
                                        left: 0, top: 8.0),
                                    child: Row(
                                      mainAxisAlignment:
                                          MainAxisAlignment.spaceBetween,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ),
                        ],
                      );
                    },
                  ),
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}
