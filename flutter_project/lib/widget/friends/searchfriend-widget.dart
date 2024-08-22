import 'package:flutter/material.dart';
import 'package:flutter_project/classes/communication-socket.dart';
import 'package:flutter_project/dtos/friends-dto.dart';
import 'package:flutter_project/service/friends-service.dart';
import 'package:flutter_project/widget/profile/users-widget.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import 'dart:async';

import '../../classes/applocalization.dart';
import '../../common/socket-event-constants.dart';
import '../../service/authentication-service.dart';
import '../../service/user-service.dart';
import '../profile/avatar-widget.dart';

class SearchFriendWidget extends StatefulWidget {
  @override
  _SearchFriendWidgetState createState() => _SearchFriendWidgetState();
}

class _SearchFriendWidgetState extends State<SearchFriendWidget> {
  TextEditingController searchController = TextEditingController();
  List<String> hasBlocked = [];
  Future<Map<String, dynamic>>? _userDataFuture;

  @override
  void initState() {
    super.initState();
    _userDataFuture = fetchUserData();
    FriendsService.instance.displayInitFriends();
    CommunicationSocket.on(FromServer.START_FRIEND_REQUEST, (data) {
        Timer(Duration(milliseconds: 100), () => setState(() {
        }));
    });

    CommunicationSocket.on(FromServer.START_FRIEND_REQUEST, (data) {
        Timer(Duration(milliseconds: 100), () => setState(() {
        }));
      });
  }

  Future<Map<String, dynamic>> fetchUserData() async {
    try {
      Map<String, dynamic> userData =
          await UserDataService.instance.fetchUserData();
      hasBlocked = List<String>.from(userData['hasBlocked']);

      return userData;
    } catch (error) {
      print('Error fetching user data: $error');
      throw error;
    }
  }

  @override
  Widget build(BuildContext context) {
    Color backgroundColor = Color.fromARGB(255, 223, 181, 132);
    final AppLocalizations appLocalizations = AppLocalizations.of(context)!;

    return Scaffold(
      appBar: AppBar(
        backgroundColor: backgroundColor,
        title: Text(appLocalizations.translate('SEARCH_USERS') ?? ''),
        actions: [],
      ),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(8.0),
            child: TextField(
              controller: searchController,
              decoration: InputDecoration(
                hintText: appLocalizations.translate('SEARCH_A_USER') ?? '',
                suffixIcon: IconButton(
                  icon: Icon(Icons.search),
                  onPressed: () {
                    setState(() {
                      FriendsService.instance.searchTerm =
                          searchController.text;
                      FriendsService.instance.searchFriends();
                    });
                  },
                ),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(20),
                  borderSide: BorderSide(color: Colors.grey.shade800),
                ),
                fillColor: Colors.white,
                filled: true,
              ),
              onSubmitted: (value) {
                setState(() {
                  FriendsService.instance.searchTerm = value;
                  FriendsService.instance.searchFriends();
                });
              },
            ),
          ),
          Expanded(
            child: ValueListenableBuilder<List<FriendUserDataDTO>>(
              valueListenable: FriendsService.instance.friendsFoundedNotifier,
              builder: (context, friendsFounded, child) {
                return ListView.separated(
                  itemCount: friendsFounded.length,
                  itemBuilder: (context, index) {
                    final friend = friendsFounded[index];
                    return Container(
                      height: 60,
                      color: FriendsService.instance.friends.contains(friend.username)
                          ? Colors.green
                          : (FriendsService.instance.isBlocked(friend.username)
                              ? Colors.red
                              : (friend.username ==
                                      AuthService.instance.username
                                  ? Colors.blue
                                  : Colors.white)),
                      child: ListTile(
                        leading: InkWell(
                          onTap: () {
                            Navigator.of(context).push(MaterialPageRoute(
                                builder: (context) =>
                                    UsersWidget(username: friend.username)));
                          },
                          child: Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: <Widget>[
                              Container(
                                width: 31,
                                height: 31,
                                child: CircleAvatar(
                                  backgroundColor: Colors.transparent,
                                  child: AvatarWidget(
                                    imagePath: FriendsService.instance
                                        .getUserStats(friend.username)
                                        .avatar,
                                    size: 150,
                                  ),
                                ),
                              ),
                              SizedBox(height: 2),
                              Text(
                                appLocalizations.translate('CHECK_PROFILE') ??
                                    'Voir Profil',
                                style: TextStyle(
                                    fontSize: 10,
                                    fontWeight: FontWeight.bold,
                                    color: Colors.black),
                              ),
                            ],
                          ),
                        ),
                        title: Text(friend.username),
                        subtitle: Text(
                          friend.username == AuthService.instance.username
                              ? appLocalizations.translate('YOU') ?? 'You'
                              : (FriendsService.instance
                                      .isMyFriend(friend.username)
                                  ? appLocalizations.translate('FRIEND') ??
                                      'Friend'
                                  : (FriendsService.instance
                                          .isBlocked(friend.username)
                                      ? appLocalizations.translate('BLOCKED') ??
                                          'Blocked'
                                      : appLocalizations
                                              .translate('NOT_FRIEND') ??
                                          'Friend')),
                        ),
                        trailing: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            friend.username == AuthService.instance.username
                                ? SizedBox.shrink()
                                : InkWell(
                                    onTap: () {
                                      if (FriendsService.instance
                                          .isBlocked(friend.username)) {
                                        FriendsService.instance
                                            .unBlockUser(friend.username);
                                      } else {
                                        FriendsService.instance
                                            .blockUser(friend.username);
                                      }
                                      setState(() {
                                        if (FriendsService.instance
                                            .isBlocked(friend.username)) {
                                          FriendsService.instance.hasBlocked
                                              .remove(friend.username);
                                          FriendsService.instance
                                              .unBlockUser(friend.username);
                                        } else {
                                          FriendsService.instance.hasBlocked
                                              .add(friend.username);
                                          FriendsService.instance
                                              .blockUser(friend.username);
                                        }
                                      });
                                      setState(() {
                                        FriendsService.instance
                                            .isMyFriend(friend.username);
                                      });
                                    },
                                    child: Icon(

                                      FriendsService.instance
                                              .isBlocked(friend.username)
                                          ? FontAwesomeIcons.unlock
                                          : FontAwesomeIcons.lock,
                                    ),

                                  ),
                            SizedBox(width: 25),
                            friend.username == AuthService.instance.username
                                ? SizedBox.shrink()
                                : InkWell(
                                    onTap: () {
                                      if (friend.isFriend == true) {
                                        FriendsService.instance
                                            .removeFriend(friend.username);
                                        friend.isFriend = false;
                                      } else {
                                        FriendsService.instance
                                            .askToBeFriend(friend.username);
                                      }
                                      setState(() {
                                        friend.isFriend = !friend.isFriend!;
                                        FriendsService.instance
                                            .isMyFriend(friend.username);
                                      });
                                    },
                                    child: FriendsService.instance
                                            .myPendingFriendRequests.contains(friend.username)
                                        ? Image.asset(
                                            'assets/pending-request.png')
                                        : (FriendsService.instance
                                                .friends.contains(friend.username)
                                            ? const Icon(
                                                FontAwesomeIcons.userMinus,
                                              )
                                            : (FriendsService.instance
                                                    .isBlocked(friend.username)
                                                ? SizedBox.shrink()
                                                : const Icon(
                                                    FontAwesomeIcons.userPlus,
                                                    color: Colors.grey,
                                                  ))),
                                  ),
                            SizedBox(width: 25),
                            InkWell(
                              onTap: () {
                                FriendsService.instance
                                    .setSelectedUserFriends(friend.username);
                                showDialog(
                                  context: context,
                                  builder: (BuildContext context) {
                                    var friendsOfSelectedUser = FriendsService
                                        .instance
                                        .getFriends(friend.username);
                                    return AlertDialog(
                                      title: Text((appLocalizations
                                                  .translate('FRIEND_OF') ??
                                              '') +
                                          '${friend.username}'),
                                      content: SingleChildScrollView(
                                        child: ListBody(
                                          children:
                                              friendsOfSelectedUser.isNotEmpty
                                                  ? friendsOfSelectedUser
                                                      .map((friendName) {
                                                      return Column(
                                                        children: [
                                                          Row(
                                                            children: [
                                                              Text(friendName),
                                                              SizedBox(
                                                                  width: 120),
                                                              InkWell(
                                                                onTap: () {
                                                                  if (FriendsService
                                                                          .instance
                                                                          .isMyFriend(
                                                                              friendName) ==
                                                                      true) {
                                                                    FriendsService
                                                                        .instance
                                                                        .removeFriend(
                                                                        friendName);
                                                                    friend.isFriend =
                                                                        false;
                                                                  } else {
                                                                    FriendsService
                                                                        .instance
                                                                        .askToBeFriend(
                                                                        friendName);
                                                                  }
                                                                },
                                                                child: (FriendsService
                                                                        .instance
                                                                        .isMyFriend(
                                                                            friendName)
                                                                    ? Icon(
                                                                        FontAwesomeIcons
                                                                            .userMinus,
                                                                      )
                                                                    : FriendsService.instance.myPendingFriendRequests.contains(friendName) ==
                                                                            true
                                                                        ? Image
                                                                            .asset(
                                                                            'assets/pending-request.png',
                                                                            width:
                                                                                40,
                                                                          )
                                                                        : Icon(
                                                                            FontAwesomeIcons.userPlus,
                                                                            color:
                                                                                Colors.grey,
                                                                          )),
                                                              ),
                                                            ],
                                                          ),
                                                        ],
                                                      );
                                                    }).toList()
                                                  : [
                                                      Text(appLocalizations
                                                              .translate(
                                                                  'NO_FRIENDS_USER') ??
                                                          '')
                                                    ],
                                        ),
                                      ),
                                      actions: <Widget>[
                                        TextButton(
                                          child: Text(appLocalizations
                                                  .translate('CLOSE') ??
                                              ''),
                                          onPressed: () {
                                            Navigator.of(context).pop();
                                          },
                                        ),
                                      ],
                                    );
                                  },
                                );
                              },
                              child: Icon(
                                color: Colors.blueGrey,
                                FontAwesomeIcons.userGroup,
                              ),
                            ),
                          ],
                        ),
                      ),
                    );
                  },
                  separatorBuilder: (context, index) => Divider(
                    color: Colors.grey,
                    thickness: 3,
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}
