import 'package:flutter_project/dtos/channel-dto.dart';

typedef FilterCallback = void Function(String query);

List<ConversationDTO> filterConversations(
    String query, List<ConversationDTO> conversations) {
  // Filtering logic to filter conversations based on a query
  List<ConversationDTO> filteredConversations = conversations
      .where((conversation) =>
          conversation.name.toLowerCase().contains(query.toLowerCase()))
      .toList();

  // You can perform any additional logic here based on your requirements

  // Return the filtered conversations
  return filteredConversations;
}
