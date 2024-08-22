import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:flutter_project/common/socket-event-constants.dart';
import 'package:flutter_project/dtos/channel-dto.dart';
import 'package:flutter_project/dtos/channel-dto.dart';
import 'package:flutter_project/dtos/friends-dto.dart';
import 'package:flutter_project/service/authentication-service.dart';
import 'package:flutter_project/service/user-service.dart';
import 'package:http/http.dart' as http;

import '../classes/communication-socket.dart';

class FriendsService with ChangeNotifier {
  final CommunicationSocket communicationSocket = CommunicationSocket.instance;
  static final FriendsService _instance = FriendsService._internal();
  ValueNotifier<List<FriendUserDataDTO>> friendsFoundedNotifier =
      ValueNotifier([]);

  FriendsService._internal();

  static FriendsService get instance => _instance;

  final currentUsername = AuthService.instance.loadUsernameFromLocalStorage();
  List<FriendUserDataDTO> friendsFounded = [];
  String? searchTerm;
  List<FriendUserDataDTO> allFriends = [];
  List<String> selectedUserFriends = [];
  String? sender;
  List<String> pendingInvitations = [];
  String? selectedUsername;
  bool isFriendsListVisible = false;
  List<String > hasBlocked = [];
  List<String > blockedRelations = [];
  List<String > friends = [];
  List<PrivateUserDataDTO > allUsersData = [];
  List<FriendUserDataDTO> originalAllFriends = [];
  List<String> myPendingFriendRequests = [];

  List<PrivateUserDataDTO > allData = [];
  Future<Map<String, dynamic>>? _userDataFuture;

  Future<void> init() async {
    await fetchUserData();
    try {
      await CommunicationSocket().send(ToServer.USERS_DATA);
    } catch (error) {
      print("Error sending message: $error");
    }

    CommunicationSocket.on(FromServer.USERS_DATA, (data) {
      List<PrivateUserDataDTO> allData = (data as List<dynamic>)
          .map((userData) =>
              PrivateUserDataDTO.fromJson(userData as Map<String, dynamic>))
          .toList();

      List<FriendUserDataDTO> allUsers = (data as List<dynamic>)
          .map((userData) =>
              FriendUserDataDTO.fromJson(userData as Map<String, dynamic>))
          .toList();


      allFriends = List.from(allUsers);
      originalAllFriends = List.from(allUsers);
      updateFriendsFounded();
      allUsersData = List.from(allData);
      notifyListeners();
    });

    try {
      await CommunicationSocket().send(ToServer.SHOW_PENDING_FRIEND_REQUEST);
    } catch (error) {
      print("Error sending message: $error");
    }

    CommunicationSocket.on(FromServer.SHOW_PENDING_FRIEND_REQUEST,
        (data) async {
      if (data is List) {
        for (var item in data) {
          if (item is Map<String, dynamic>) {
            if (!pendingInvitations.contains(item['from'])) {
              pendingInvitations.add(item['from']);
              notifyListeners();
            }
          }
        }
      }
    });

    CommunicationSocket.on(FromServer.BLOCK_USER, (data) async {
      blockedRelations.add(data);
     });

    CommunicationSocket.on(FromServer.UNBLOCK_USER, (data) async {
      blockedRelations.remove(data);
      updateFriendsFounded();
      notifyListeners();
    });


    CommunicationSocket.on(FromServer.START_FRIEND_REQUEST, (data) {

      if (!pendingInvitations.contains(sender)) {
        pendingInvitations.add(sender!);
        notifyListeners();

      }
    });

    CommunicationSocket.on(FromServer.END_FRIEND_REQUEST, (data) {
    //  sender = data;
      print("data");
      print(data);
      final friendsToAdd = data["username"];
      final accepted = data["accepted"];

      if (pendingInvitations.contains(friendsToAdd)) {
        pendingInvitations.remove(friendsToAdd!);
        notifyListeners();
      }
      print("friendsToAdd");
      print(friendsToAdd);
      print("accepted");
      print(accepted);
      if(accepted) {
        friends.add(friendsToAdd);
        notifyListeners();
      }

    });


  }

  Future<Map<String, dynamic>> fetchUserData() async {
    try {
      Map<String, dynamic> userData =
          await UserDataService.instance.fetchUserData();
      hasBlocked = List<String>.from(userData['hasBlocked']);
      blockedRelations = List<String>.from(userData['blockRelations']);
      friends = List<String>.from(userData['friends']);
      myPendingFriendRequests = List<String>.from(userData['pendingRequests']);


      return userData;
    } catch (error) {
      print('Error fetching user data: $error');
      throw error;
    }
    notifyListeners();
  }

  void displayInitFriends() {
    updateFriendsFounded();
    friendsFounded = List.from(allFriends);
    friendsFoundedNotifier.value = List.from(allFriends);
    notifyListeners();
  }

  void setSelectedUserFriends(String username) {
    final user = allFriends.firstWhere((friend) => friend.username == username);
    if (user != null) {
      selectedUserFriends = user.friends;
    } else {
      selectedUserFriends = [];
    }
    selectedUsername = username;
    isFriendsListVisible =
        !isFriendsListVisible || selectedUsername != username;
    notifyListeners();
  }

  void listifyFriends(String? username) {
    updateFriendsFounded();
    this.friendsFounded = this.allFriends.map((friend) {
      friend.isFriend = friend.friends.contains(username ?? '');
      return friend;
    }).toList();
  }

  void searchFriends() {
    init();
    if (searchTerm != null && searchTerm!.isNotEmpty) {
      updateFriendsFounded();
      friendsFounded = allFriends
          .where((friend) =>
              friend.username.toLowerCase().contains(searchTerm!.toLowerCase()))
          .toList();
      friendsFoundedNotifier.value = friendsFounded;
    } else {
      updateFriendsFounded();
      friendsFounded = List.from(allFriends);
      friendsFoundedNotifier.value = friendsFounded;
    }

    updateFriendsFounded();
    if (allFriends.isNotEmpty) {
      notifyListeners();
    }
  }

  void isAFriend(String? username) {
    friendsFounded = allFriends.map((friend) {
      friend.isFriend = friend.friends.contains(username ?? '');
      return friend;
    }).toList();
    notifyListeners();
  }

  void isPending(String? username) {
    friendsFounded = allFriends.map((friend) {
      friend.isFriendRequested = friend.pendingFriendRequests?.received
              .any((request) => request.from.contains(username ?? '')) ??
          false;
      return friend;
    }).toList();
    notifyListeners();
  }

  bool isMyFriend(String username) {
    this.isAFriend(AuthService.instance.username);
    return allFriends.any(
        (friend) => friend.username == username && (friend.isFriend ?? false));
  }

  bool isMyPending(String username) {
    this.isPending(AuthService.instance.username);
    return allFriends.any((friend) =>
        friend.pendingFriendRequests?.sent
            .any((sentUsername) => sentUsername == username) ??
        false);
  }

  void removeFriend(String username) {
    friendsFounded = friendsFounded.map((friend) {
      if (friend.username == username) {

        return FriendUserDataDTO(
          username: friend.username,
          isFriend: false,
          avatar: friend.avatar,
          biography: friend.biography,
          friends: friend.friends,
        );
      }
      return friend;
    }).toList();
    updateFriendsFounded();
    friends.remove(username);
    communicationSocket.send(ToServer.REMOVE_FRIEND, username);
    notifyListeners();
  }

  void askToBeFriend(String username) {
    final friend = friendsFounded.firstWhere((f) => f.username == username);
    if (friend != null) {
      friend.isFriendRequested = true;
      friend.pendingFriendRequests?.sent.add(username);

      if (currentUsername != null &&
          friend.pendingFriendRequests?.sent.contains(currentUsername) ==
              true) {
        friend.isFriendRequested = true;
      }
    }
    communicationSocket.send(ToServer.START_FRIEND_REQUEST, username);
  }

  List<String> getFriends(String username) {
    final user = allFriends.firstWhere((friend) => friend.username == username);
    if (user != null) {
      return user.friends;
    }
    return [];
  }

  void answerInvitation(String username, bool accepted) {
    final answer = {'username': username, 'accepted': accepted};
    communicationSocket.send(ToServer.END_FRIEND_REQUEST, answer);
    notifyListeners();
  }

  Future<void> blockUser(String username) async {
    try {
      final token = await AuthService.instance.getToken();
      this.removeFriend(username);
      communicationSocket.send(ToServer.BLOCK_USER, username);
      final url = Uri.parse('${AuthService.instance.baseUrl}/user/block');
      final response = await http.post(
        url,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ${token}',
        },
        body: json.encode({'username': username}),
      );
      if (response.statusCode == 200 || response.statusCode == 201) {
        final isAlreadyBlocked = hasBlocked.contains(username) ?? false;
        if (!isAlreadyBlocked) {
          hasBlocked.add(username);
        }
      }
    } catch (e) {
      print("Erreur lors du blocage de l'utilisateur: $e");
    }
  }

  void unBlockUser(String username) async {
    try {
      final token = await AuthService.instance.getToken();
      communicationSocket.send(ToServer.UNBLOCK_USER, username);
      final url = Uri.parse('${AuthService.instance.baseUrl}/user/unblock');
      final response = await http.post(
        url,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ${token}',
        },
        body: json.encode({'username': username}),
      );
      if (response.statusCode == 200 || response.statusCode == 201) {
        final isAlreadyBlocked =
            UserDataService.instance.userData?.hasBlocked?.contains(username) ??
                false;
        if (!isAlreadyBlocked) {
          UserDataService.instance.userData?.hasBlocked.add(username);
        }
      }
    } catch (e) {
      print("Erreur lors du blocage de l'utilisateur: $e");
    }
  }

  void updateFriendsFounded() {
    allFriends = originalAllFriends.where((friend) {
      return !blockedRelations.contains(friend.username) ||
          (blockedRelations.contains(friend.username) &&
              hasBlocked.contains(friend.username));
    }).toList();
  }

  bool isBlocked(String username) {
    if (username == null) return false;
    return hasBlocked.any((blockedUsername) => blockedUsername == username) ??
        false;
  }

  PrivateUserDataDTO getUserStats(String username) {
    final user = allUsersData.firstWhere(
      (u) => u.username == username,
      orElse: () => throw FlutterError('User not found: $username'),
    );
    return user;
  }

}
