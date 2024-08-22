import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter_project/service/friends-service.dart';
import 'package:flutter_project/widget/main-page-widget.dart';
import 'package:flutter_project/widget/tools-widgets/title-widget.dart';

import '../../classes/applocalization.dart';

class AskFriendWidget extends StatefulWidget {
  @override
  _AskFriendWidgetState createState() => _AskFriendWidgetState();
}

class _AskFriendWidgetState extends State<AskFriendWidget> {
  @override
  void initState() {
    super.initState();
    FriendsService.instance.init();
  }

  @override
  Widget build(BuildContext context) {
    Color backgroundColor = Color(0xFFDEB887);
    final AppLocalizations appLocalizations = AppLocalizations.of(context)!;

    return Scaffold(
      backgroundColor: backgroundColor,
      body: SingleChildScrollView(
        child: Column(
          children: [
            Padding(
              padding: const EdgeInsets.only(top: 20.0, left: 500.0),
              child: Container(
                width: MediaQuery.of(context).size.width * 0.9,
                height: 60,
                child:  CustomPaperWidget(
                  text: appLocalizations.translate('PENDING_REQUEST')  ?? '',
                ),
              ),
            ),
            FriendsService.instance.pendingInvitations.isEmpty
                ? Padding(
              padding: EdgeInsets.only(top: 200, left: 150),
              child: Container(
                padding: EdgeInsets.symmetric(horizontal: 8.0, vertical: 4.0),
                width: MediaQuery.of(context).size.width * 0.8,
                height: 400,
                decoration:  BoxDecoration(
                  image: DecorationImage(
                    image: AssetImage(appLocalizations.translate('NO_PENDING_REQUEST')  ?? ''),
                    fit: BoxFit.cover,
                  ),
                ),
              ),
            )
                : Container(
              height: MediaQuery.of(context).size.height * 0.5,
              child: Expanded(
                child: ListView.builder(
               itemCount: FriendsService.instance.pendingInvitations.length,
                itemBuilder: (context, index) {
                  return Material(
                    child: ListTile(
                      leading: CircleAvatar(),
                      title: Text(FriendsService.instance.pendingInvitations[index]),
                      trailing: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          IconButton(
                            icon: Image.asset('assets/green_checkmark.png'),
                            onPressed: ()  {
                              FriendsService.instance.answerInvitation(FriendsService.instance.pendingInvitations[index], true);
                              setState(() {
                                FriendsService.instance.pendingInvitations.removeAt(index);
                              });
                            },
                          ),
                          IconButton(
                            icon: Image.asset('assets/reset.png'),
                            onPressed: () {
                              FriendsService.instance.answerInvitation(FriendsService.instance.pendingInvitations[index], false);
                              setState(() {
                                FriendsService.instance.pendingInvitations.removeAt(index);
                              });
                            },
                          ),
                        ],
                      ),
                    ),
                  );
                },
              ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
