import 'package:flutter/material.dart';
import 'package:flutter_project/classes/message-bubble.dart';
import 'package:flutter_project/dtos/channel-dto.dart';
import 'package:flutter_project/service/authentication-service.dart';
import 'package:flutter_project/service/message-service.dart';
import 'package:flutter_project/service/settings-service.dart';
import 'package:flutter_project/widget/profile/avatar-widget.dart';
import 'package:intl/intl.dart';

import '../classes/applocalization.dart';
import 'gif-widget.dart';

class MessageWidget extends StatefulWidget {
  const MessageWidget({Key? key}) : super(key: key);

  @override
  _MessageWidgetState createState() => _MessageWidgetState();
}

class _MessageWidgetState extends State<MessageWidget> {
  bool isSelected = false;
  final TextEditingController _messageController = TextEditingController();
  final TextEditingController _searchController = TextEditingController();

  bool _isSendingMessage = false;
  bool _keyboardVisible = false;
  bool isJoinChannel = false;
  bool isFilter = false;
  List<ChannelDTO> filteredConversations = [];

  List<Conversation> _myChannels = [];
  List<ChannelDTO> _otherChannels = [];

  void updateChannels() {
    setState(() {
      _myChannels = MessageService.instance.myChannels;
      _otherChannels = MessageService.instance.otherChannels;
    });
  }

  @override
  void initState() {
    super.initState();
    // filterConversations(filterConversations);
    MessageService.instance.setDrawerVisibility(true);
    updateChannels();
    MessageService.instance.channelChangeCallBack = updateChannels;
  }

  List<Message1> getMessages() {
    List<Message1> messages =
        List.from(MessageService.instance.getFocusedMessages());
    messages.sort(
        (Message1 m1, Message1 m2) => m1.timestamp.compareTo(m2.timestamp));
    return messages;
  }

  @override
  void dispose() {
    MessageService.instance.setDrawerVisibility(false);
    MessageService.instance.focusedConversationId = '';
    MessageService.instance.channelChangeCallBack = null;
    super.dispose();
  }

  Future<void> _sendMessage(String? conversationId) async {
    final String messageText = _messageController.text.trim();
    if (messageText.isEmpty) return;

    setState(() {
      _isSendingMessage = true;
    });

    MessageService.instance.sendMessage(messageText, conversationId);
    _messageController.clear();

    setState(() {
      _isSendingMessage = false;
    });
  }

  Future<void> _sendGif(String? conversationId, String gifUrl) async {
    setState(() {
      _isSendingMessage = true;
    });

    MessageService.instance.sendGif(gifUrl, conversationId);

    setState(() {
      _isSendingMessage = false;
    });
  }

  Future<void> _findChannel() async {
    setState(() {
      isJoinChannel = !isJoinChannel;
    });
  }

  void filterConversations(String query) {
    setState(() {
      isFilter = query.isNotEmpty;
      filteredConversations = MessageService.instance.otherChannels
          .where((conversation) =>
              conversation.name!.toLowerCase().contains(query.toLowerCase()))
          .toList();
    });
  }

  @override
  Widget build(BuildContext context) {
    _keyboardVisible = MediaQuery.of(context).viewInsets.bottom != 0;
    return Drawer(
      width: 700,
      child: Column(
        children: <Widget>[
          SizedBox(
            height: 100,
            width: double.infinity,
            child: DrawerHeader(
              decoration: BoxDecoration(
                color: SettingsService.instance.theme == Themes.dark
                    ? Color.fromARGB(255, 105, 117, 158)
                    : const Color(0xFFabbeff),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Visibility(
                    visible: isSelected,
                    child: IconButton(
                      icon: Icon(
                        Icons.arrow_back,
                        color: SettingsService.instance.theme == Themes.dark
                            ? Colors.white
                            : const Color.fromARGB(255, 49, 49, 49),
                      ),
                      onPressed: () {
                        setState(() {
                          isSelected = false;
                        });
                      },
                    ),
                  ),
                  Text(
                    isSelected
                        ? MessageService.instance.focusedConversation.name
                        : SettingsService.instance.language == Language.fr
                            ? "Salons de clavardage"
                            : "Chat Room",
                    //appLocalizations.translate('CHAT_ROOM')  ?? '',
                    style: TextStyle(
                      fontSize: 20,
                      color: SettingsService.instance.theme == Themes.dark
                          ? Colors.white
                          : const Color.fromARGB(255, 49, 49, 49),
                      fontWeight: FontWeight.bold,
                    ),
                    textAlign: TextAlign.center,
                  ),
                  Container(),
                ],
              ),
            ),
          ),
          if (!isSelected)
            Padding(
              padding: const EdgeInsets.only(bottom: 10.0, top: 10.0),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                children: [
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 8.0),
                    child: ElevatedButton.icon(
                      icon: const Icon(Icons.add),
                      label: Text(
                          SettingsService.instance.language == Language.fr
                              ? "Créer un canal"
                              : "Create a channel"),
                      style: ElevatedButton.styleFrom(
                        fixedSize: const Size(190, 45),
                        primary: Colors.blue,
                        onPrimary: Colors.white,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(30.0),
                        ),
                        padding: const EdgeInsets.symmetric(
                            horizontal: 20, vertical: 10),
                      ),
                      onPressed: () {
                        showDialog(
                          context: context,
                          builder: (BuildContext context) {
                            return SmallWidget(
                              onCreateChannel: (String channelName) {
                                MessageService.instance
                                    .createChannel(channelName);
                                setState(() {
                                  isJoinChannel = false;
                                });
                              },
                            );
                          },
                        );
                      },
                    ),
                  ),
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 16.0),
                    child: ElevatedButton.icon(
                      icon: isJoinChannel
                          ? const Icon(Icons.chat)
                          : const Icon(Icons.search),
                      label: isJoinChannel
                          ? Text(
                              SettingsService.instance.language == Language.fr
                                  ? "Mes canaux"
                                  : "My channels")
                          : Text(
                              SettingsService.instance.language == Language.fr
                                  ? "Trouver un canal"
                                  : "Find a channel"),
                      style: ElevatedButton.styleFrom(
                        fixedSize: const Size(190, 45),
                        primary: Colors.green,
                        onPrimary: Colors.white,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(30.0),
                        ),
                        padding: const EdgeInsets.symmetric(
                            horizontal: 20, vertical: 10),
                      ),
                      onPressed: () {
                        _findChannel();
                      },
                    ),
                  ),
                ],
              ),
            ),
          if (isJoinChannel)
            Padding(
              padding: const EdgeInsets.all(16.0),
              child: TextField(
                controller: _searchController,
                onChanged: (query) {
                  filterConversations(query);
                },
                decoration: InputDecoration(
                  hintText: SettingsService.instance.language == Language.fr
                      ? "Chercher des canaux"
                      : "Search channels",
                  //appLocalizations.translate('SEARCH_CHANNEL')  ?? '',
                  prefixIcon: Icon(Icons.search),
                ),
              ),
            ),
          if (isJoinChannel)
            Container(
              height: MediaQuery.of(context).size.height * 0.65,
              child: ListView.builder(
                itemCount: isFilter
                    ? filteredConversations.length
                    : MessageService.instance.otherChannels.length,
                itemBuilder: (BuildContext context, int index) {
                  ChannelDTO conversation = isFilter
                      ? filteredConversations[index]
                      : MessageService.instance.otherChannels[index];
                  return ListTile(
                    title: Row(
                      children: [
                        const SizedBox(width: 16),
                        // Use Expanded widget to make the text take remaining space
                        Expanded(
                          child: Text(
                            conversation.name!,
                            style: const TextStyle(fontSize: 20),
                            overflow: TextOverflow.ellipsis,
                            maxLines: 1,
                          ),
                        ),
                        const SizedBox(width: 16),
                        ElevatedButton(
                          onPressed: () {
                            MessageService.instance
                                .joinChannel(conversation.id);
                            setState(() {
                              isJoinChannel = false;
                            });
                          },
                          child: Text(
                              SettingsService.instance.language == Language.fr
                                  ? "Joindre Canal"
                                  : "Join channel"),
                          //Text(appLocalizations.translate('JOIN_CHANNEL')  ?? ''),
                        ),
                      ],
                    ),
                  );
                },
              ),
            ),
          if (!isSelected && !isJoinChannel)
            Expanded(
              child: ValueListenableBuilder<Map<String, int>>(
                valueListenable: MessageService.instance.unreadMessagesPerChat,
                builder: (context, unreadCounts, child) {
                  return ListView.builder(
                    itemCount: MessageService.instance.myChannels.length,
                    itemBuilder: (BuildContext context, int index) {
                      Conversation conversation =
                          MessageService.instance.myChannels[index];
                      bool hasUnread = unreadCounts[conversation.id] != null &&
                          unreadCounts[conversation.id]! > 0;
                      return Container(
                        padding: const EdgeInsets.symmetric(vertical: 0),
                        child: ListTile(
                          title: Container(
                            width: double.infinity,
                            height: 80,
                            decoration: BoxDecoration(
                              borderRadius: BorderRadius.circular(20),
                              color: const Color.fromARGB(255, 231, 237, 248),
                            ),
                            child: Row(
                              children: [
                                const SizedBox(width: 16),
                                Expanded(
                                  child: Text(
                                    conversation.name,
                                    style: const TextStyle(fontSize: 20),
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                ),
                                if (hasUnread)
                                  Container(
                                    margin: const EdgeInsets.only(left: 5),
                                    width: 10,
                                    height: 10,
                                    decoration: const BoxDecoration(
                                      color: Colors.red,
                                      shape: BoxShape.circle,
                                    ),
                                  ),
                                const SizedBox(width: 16),
                                if (index > 0)
                                  PopupMenuButton<String>(
                                    icon: const Icon(Icons.more_vert),
                                    onSelected: (String choice) {
                                      String channelId = conversation.id;
                                      switch (choice) {
                                        case 'delete':
                                          if (conversation.host ==
                                              AuthService.instance.username) {
                                            MessageService.instance
                                                .deleteChannel(channelId);
                                          }
                                          break;
                                        case 'leave':
                                          MessageService.instance
                                              .leaveChannel(channelId);
                                          break;
                                      }
                                    },
                                    itemBuilder: (BuildContext context) {
                                      List<PopupMenuEntry<String>> menuItems =
                                          [];
                                      if (conversation.host ==
                                          AuthService.instance.username) {
                                        menuItems.add(
                                          PopupMenuItem<String>(
                                            value: 'delete',
                                            child: Row(
                                              children: [
                                                Icon(Icons.delete),
                                                SizedBox(width: 8),
                                                Text(SettingsService.instance
                                                            .language ==
                                                        Language.fr
                                                    ? "Joindre le canal"
                                                    : "Delete channel"),
                                              ],
                                            ),
                                          ),
                                        );
                                      }
                                      menuItems.add(
                                        PopupMenuItem<String>(
                                          value: 'leave',
                                          child: Row(
                                            children: [
                                              Icon(Icons.exit_to_app),
                                              SizedBox(width: 8),
                                              Text(SettingsService
                                                          .instance.language ==
                                                      Language.fr
                                                  ? "Quitter le canal"
                                                  : "Leave channel"),
                                            ],
                                          ),
                                        ),
                                      );
                                      return menuItems;
                                    },
                                  ),
                              ],
                            ),
                          ),
                          onTap: () {
                            setState(() {
                              isSelected = true;
                              MessageService.instance
                                  .selectChannel(conversation.id);

                              MessageService.instance
                                  .markMessagesAsRead(conversation.id);
                            });
                          },
                        ),
                      );
                    },
                  );
                },
              ),
            ),
          if (isSelected)
            Expanded(
                child: ValueListenableBuilder<List<Message1>>(
                    valueListenable: MessageService.instance.messages,
                    builder: (context, messages, _) {
                      return ListView.builder(
                        reverse: true,
                        itemCount:
                            MessageService.instance.messages.value.length,
                        itemBuilder: (context, index) {
                          String messageContent = messages[index].content;
                          if (messageContent.contains('<img src="') &&
                              messageContent.contains('" alt="GIF" />')) {
                            int startIndex =
                                messageContent.indexOf('<img src="') +
                                    '<img src="'.length;
                            int endIndex =
                                messageContent.indexOf('" alt="GIF" />');
                            String imageUrl =
                                messageContent.substring(startIndex, endIndex);
                            MessageBubble sentMessage = MessageBubble(
                              message: '',
                              mediaUrl: imageUrl,
                              isSent: messages[index].sentByMe,
                              time: messages[index].timestamp,
                              senderName: messages[index].sender,
                            );
                            return MessageBubbleWidget(sentMessage);
                          } else if (messageContent.startsWith("https:")) {
                            print("Displaying GIF from URL: $messageContent");
                            MessageBubble sentMessage = MessageBubble(
                              message: '',
                              mediaUrl: messageContent,
                              isSent: messages[index].sentByMe,
                              time: messages[index].timestamp,
                              senderName: messages[index].sender,
                            );
                            return MessageBubbleWidget(sentMessage);
                          } else {
                            return MessageBubbleWidget(MessageBubble(
                                avatar: messages[index].avatar,
                                message: messages[index].content,
                                isSent: messages[index].sentByMe,
                                time: messages[index].timestamp,
                                senderName: messages[index].sender));
                          }
                        },
                      );
                    })),
          if (isSelected)
            Padding(
              padding: _keyboardVisible
                  ? const EdgeInsets.only(bottom: 350)
                  : const EdgeInsets.only(bottom: 0),
              child: MessageTextField(
                messageController: _messageController,
                sendMessage: _sendMessage,
                sendGif: _sendGif,
                isSendingMessage: _isSendingMessage,
                selectedConversationId:
                    MessageService.instance.focusedConversationId,
              ),
            ),
        ],
      ),
    );
  }
}

class MessageBubbleWidget extends StatelessWidget {
  final MessageBubble messageBubble;

  const MessageBubbleWidget(this.messageBubble, {super.key});

  @override
  Widget build(BuildContext context) {
    final isSent = messageBubble.isSent;
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4, horizontal: 8),
      child: Align(
        alignment: isSent ? Alignment.centerRight : Alignment.centerLeft,
        child: Container(
          constraints: BoxConstraints(
            minWidth: 200,
            maxWidth: MediaQuery.of(context).size.width * 0.8,
          ),
          margin: const EdgeInsets.symmetric(vertical: 5),
          padding: const EdgeInsets.all(10),
          decoration: BoxDecoration(
            color: isSent
                ? const Color.fromARGB(255, 240, 155, 255)
                : messageBubble.senderName == 'GLOBAL MESSAGE'
                    ? Color.fromARGB(255, 145, 145, 145)
                    : const Color.fromARGB(255, 117, 232, 255),
            borderRadius: BorderRadius.circular(20),
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              if (messageBubble.avatar != null &&
                  messageBubble.senderName != 'GLOBAL MESSAGE')
                AvatarWidget(imagePath: messageBubble.avatar!, size: 50),
              if (messageBubble.avatar != null &&
                  messageBubble.senderName != 'GLOBAL MESSAGE')
                const SizedBox(width: 20),
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  if (messageBubble.senderName != 'GLOBAL MESSAGE')
                    Text(
                      messageBubble.senderName,
                      style: const TextStyle(
                        color: Colors.white,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  messageBubble.mediaUrl.isNotEmpty
                      ? Image.network(messageBubble.mediaUrl)
                      : const SizedBox(height: 4),
                  Text(
                    messageBubble.message,
                    style: const TextStyle(
                      color: Colors.white,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    DateFormat('HH:mm:ss').format(
                        DateTime.fromMillisecondsSinceEpoch(
                            messageBubble.time)),
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 12,
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class SmallWidget extends StatefulWidget {
  final Function(String) onCreateChannel;

  const SmallWidget({Key? key, required this.onCreateChannel})
      : super(key: key);

  @override
  _SmallWidgetState createState() => _SmallWidgetState();
}

class _SmallWidgetState extends State<SmallWidget> {
  TextEditingController _channelNameController = TextEditingController();

  @override
  Widget build(BuildContext context) {
    final AppLocalizations appLocalizations = AppLocalizations.of(context)!;

    return Dialog(
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              appLocalizations.translate('CHANNEL_NAME') ?? '',
              style: const TextStyle(
                fontWeight: FontWeight.bold,
                fontSize: 18,
              ),
            ),
            const SizedBox(height: 16),
            Container(
              width: 300, // Set the width to 300px
              child: TextField(
                controller: _channelNameController,
                decoration: InputDecoration(
                  hintText: appLocalizations.translate('ENTER_CHANNEL') ?? '',
                  border: OutlineInputBorder(),
                ),
              ),
            ),
            const SizedBox(height: 16),
            ElevatedButton(
              onPressed: () {
                // Handle button press
                String channelName = _channelNameController.text;
                widget
                    .onCreateChannel(channelName); // Call the callback function
                Navigator.pop(context); // Close the dialog
              },
              child: Text(appLocalizations.translate('CREATE_CHANNEL') ?? ''),
            ),
          ],
        ),
      ),
    );
  }

  @override
  void dispose() {
    _channelNameController.dispose();
    super.dispose();
  }
}

class MessageTextField extends StatefulWidget {
  final TextEditingController messageController;
  final Function(String?) sendMessage;
  final Function(String?, String) sendGif;
  final bool isSendingMessage;
  final String? selectedConversationId;

  const MessageTextField({
    Key? key,
    required this.messageController,
    required this.sendMessage,
    required this.sendGif,
    required this.isSendingMessage,
    required this.selectedConversationId,
  }) : super(key: key);

  @override
  _MessageTextFieldState createState() => _MessageTextFieldState();
}

class _MessageTextFieldState extends State<MessageTextField> {
  final FocusNode _messageFocusNode = FocusNode();

  void _handleGifSelection() async {
    final result = await Navigator.push(
      context,
      MaterialPageRoute(builder: (context) => const GifWidget()),
    );
    if (result != null) {
      widget.sendGif(widget.selectedConversationId, result);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(40),
      child: Row(
        children: [
          Expanded(
            child: TextField(
              focusNode: _messageFocusNode,
              controller: widget.messageController,
              decoration: const InputDecoration(
                hintText: 'Message ...',
                border: OutlineInputBorder(),
              ),
              onEditingComplete: () {
                _messageFocusNode.requestFocus();
              },
            ),
          ),
          IconButton(
            icon: const Icon(Icons.send),
            onPressed: widget.isSendingMessage
                ? null
                : () {
                    widget.sendMessage(widget.selectedConversationId);
                    _messageFocusNode.requestFocus();
                  },
          ),
          GestureDetector(
            onTap: _handleGifSelection,
            child: const Icon(
              Icons.gif,
              size: 50,
              color: Colors.black,
            ),
          ),
        ],
      ),
    );
  }

  @override
  void dispose() {
    _messageFocusNode.dispose();
    super.dispose();
  }
}
