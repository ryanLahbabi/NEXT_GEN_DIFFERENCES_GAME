import 'package:flutter/material.dart';
import 'package:flutter_project/pages/administration.dart';
import 'package:flutter_project/pages/main-page.dart';
import 'package:flutter_project/widget/tools-widgets/paper-button-widget.dart';

class CustomDialog extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Dialog(
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(10),
      ),
      elevation: 0,
      backgroundColor: Colors.transparent,
      child: contentBox(context),
    );
  }

  contentBox(context) {
    return ConstrainedBox(
      constraints: const BoxConstraints(
        minWidth: 300,
        maxWidth: 700,
        minHeight: 200,
        maxHeight: 400,
      ),
      child: Stack(
        children: <Widget>[
          Container(
            padding:
                const EdgeInsets.only(left: 60, top: 45, right: 60, bottom: 20),
            margin: const EdgeInsets.only(top: 45),
            decoration: BoxDecoration(
              shape: BoxShape.rectangle,
              color: Colors.pink.shade200,
              borderRadius: BorderRadius.circular(10),
              boxShadow: [
                const BoxShadow(
                    color: Colors.black, offset: Offset(0, 10), blurRadius: 10),
              ],
            ),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: <Widget>[
                const Text(
                  "Veuillez saisir le mot de passe pour accéder à la vue d'administration des jeux:",
                  style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 15),
                const TextField(
                  obscureText: true, // Active le masquage du texte
                  decoration: InputDecoration(
                    border: InputBorder.none,
                    fillColor: Colors.white,
                    filled: true,
                    hintText:
                        'Entrez votre mot de passe', // Vous pouvez ajouter un placeholder si nécessaire
                  ),
                ),
                const SizedBox(height: 10),
                Row(
                  crossAxisAlignment: CrossAxisAlignment.center,
                  children: [
                    Expanded(
                      // Ensures buttons take up equal space
                      child: PaperButtonWidget(
                        text: 'Annuler',
                        width: 250,
                        height: 50,
                        widthPin: 15,
                        onTap: () {
                          Navigator.push(
                            context,
                            MaterialPageRoute(
                                builder: (context) => const MainPage()),
                          );
                        },
                      ),
                    ),
                    const SizedBox(width: 80),
                    Expanded(
                      child: PaperButtonWidget(
                        text: 'Confirmer',
                        width: 250,
                        height: 50,
                        widthPin: 15,
                        onTap: () {
                          Navigator.push(
                            context,
                            MaterialPageRoute(
                                builder: (context) => const AdminPage()),
                          );
                        },
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ), // Bottom part
          Positioned(
            top: 50,
            left: 15,
            child: Image.asset('assets/green_pin.png', width: 32, height: 32),
          ),
          Positioned(
            top: 50,
            right: 5,
            child: Image.asset('assets/green_pin.png', width: 32, height: 32),
          ),
          Positioned(
            bottom: 10,
            left: 15,
            child: Image.asset('assets/green_pin.png', width: 32, height: 32),
          ),
          Positioned(
            bottom: 10,
            right: 5,
            child: Image.asset('assets/green_pin.png', width: 32, height: 32),
          ),
        ],
      ),
    );
  }
}
