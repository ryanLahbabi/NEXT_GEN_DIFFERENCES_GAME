

class FriendUserDataDTO {
  final String username;
  final String avatar;
  final String biography;
  final List<String> friends;
  final PendingFriendRequestsDTO? pendingFriendRequests;
  bool? isFriend;
  bool? isFriendRequested;

  FriendUserDataDTO({
    required this.username,
    required this.avatar,
    required this.biography,
    required this.friends,
    this.pendingFriendRequests,
    this.isFriend,
    this.isFriendRequested,
  });

  factory FriendUserDataDTO.fromJson(Map<String, dynamic> json) {
    return FriendUserDataDTO(
      username: json['username'] as String,
      avatar: json['avatar'] as String,
      biography: json['biography'] as String,
      friends: List<String>.from(json['friends']),
      pendingFriendRequests: json['pendingFriendRequests'] != null ? PendingFriendRequestsDTO.fromJson(json['pendingFriendRequests']) : null,
      isFriend: json['isFriend'],
      isFriendRequested: json['isFriendRequested'],
    );
  }
}

class PendingFriendRequestsDTO {
  List<ReceivedFriendRequestDTO> received;
  List<String> sent;

  PendingFriendRequestsDTO({required this.received, required this.sent});

  factory PendingFriendRequestsDTO.fromJson(Map<String, dynamic> json) {
    return PendingFriendRequestsDTO(
      received: (json['received'] as List)
          .map((e) => ReceivedFriendRequestDTO.fromJson(e as Map<String, dynamic>))
          .toList(),
      sent: List<String>.from(json['sent']),
    );
  }
}




class ReceivedFriendRequestDTO {
  final String from;
  final bool seen;

  ReceivedFriendRequestDTO({required this.from, required this.seen});

  factory ReceivedFriendRequestDTO.fromJson(Map<String, dynamic> json) {
    return ReceivedFriendRequestDTO(
      from: json['from'],
      seen: json['seen'],
    );
  }
}
