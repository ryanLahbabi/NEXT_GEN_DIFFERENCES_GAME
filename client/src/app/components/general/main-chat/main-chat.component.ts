// /* eslint-disable import/namespace */
// /* eslint-disable import/no-deprecated */
// import { Component, OnDestroy, OnInit } from '@angular/core';
// import { MatDialog } from '@angular/material/dialog';
// import { AcceptFriendsComponent } from '@app/components/general/accept-friends/accept-friends.component';
// import { FriendsComponent } from '@app/components/general/friends/friends.component';
// import { DIALOG_CUSTOM_CONFIG } from '@app/constants/dialog-config';
// import { INTERVAL_TIME } from '@app/constants/time-constants';
// import { AccountService } from '@app/services/account/account.service';
// import { HttpService } from '@app/services/communication/http.service';
// import { GifSelectionService } from '@app/services/divers/gif-selection.service';
// import { WindowService } from '@app/services/divers/window.service';
// import { FriendsService } from '@app/services/friends/friends.service';
// import { ChatService } from '@app/services/game-play/chat.service';
// import { GameDataService } from '@app/services/game-play/game-data.service';
// import { GameMode } from '@common/enums/game-play/game-mode';
// import { Language } from '@common/enums/user/language.enum';
// import { MessagesMainPage } from '@common/interfaces/game-play/message';
// import { Subscription } from 'rxjs';

// @Component({
//     selector: 'app-main-chat',
//     templateUrl: './main-chat.component.html',
//     styleUrls: ['./main-chat.component1.scss', './main-chat.component2.scss'],
// })
// export class MainChatComponent implements OnInit, OnDestroy {
//     // conversations = [{ title: 'Conversation Global', number: 1, lastMessage: 'aperçu' }];
//     isExpanded = false;
//     isOpen = false;
//     isArrow = 'chat-arrow-image-up';
//     chatMode: 'embedded' | 'detached';
//     cId: string = '0';
//     isChannel = false;
//     isUser = false;
//     listorChannel = true;
//     searchQuery = '';
//     openConversations: { id: string; name: string }[] = [];
//     showGifComponent: boolean = false;
//     private subscriptions = new Subscription();

//     // eslint-disable-next-line max-params
//     constructor(
//         public friendService: FriendsService,
//         public accountService: AccountService,
//         public chatService: ChatService,
//         public httpService: HttpService,
//         public gifSelectionService: GifSelectionService,
//         public gameData: GameDataService,
//         private dialog: MatDialog,
//         private windowService: WindowService, // private sanitizer: DomSanitizer,
//     ) {}

//     ngOnInit(): void {
//         setInterval(() => {
//             this.chatService.gameMode = GameMode.None;
//         }, INTERVAL_TIME);

//         this.subscriptions.add(
//             this.chatService.chatMode$.subscribe((mode) => {
//                 this.chatMode = mode;
//             }),
//         );
//     }

//     ngOnDestroy(): void {
//         this.subscriptions.unsubscribe();
//     }

//     openChatInNewWindow() {
//         this.windowService.openChatInNewWindow();
//     }

//     toggleChat() {
//         this.isExpanded = !this.isExpanded;
//         this.isArrow = this.isExpanded ? 'chat-arrow-image-down' : 'chat-arrow-image-up';
//         if (!this.isExpanded) {
//             this.isOpen = false;
//             this.openConversations = [];
//         }
//     }
//     closeConversation(conversationId: string) {
//         this.openConversations = this.openConversations.filter((conversation) => conversation.id !== conversationId);
//     }

//     openConversation(id: string, name: string) {
//         // const index = this.openConversations.findIndex((conversation) => conversation.id === id);
//         this.openConversations = [];

//         // Add the new conversation to the openConversations array
//         this.openConversations.push({ id, name });
//     }
//     // eslint-disable-next-line @typescript-eslint/member-ordering
//     get filteredChannels() {
//         return this.chatService.allChannels.filter((channel) => (channel.name?.toLowerCase() || '').includes(this.searchQuery.toLowerCase()));
//     }
//     requestFriendsAdding(): void {
//         this.friendService.init();
//         this.dialog.open(AcceptFriendsComponent, DIALOG_CUSTOM_CONFIG);
//     }
//     requestFriendsDemands(): void {
//         this.dialog.open(FriendsComponent, DIALOG_CUSTOM_CONFIG);
//     }

//     toggleChannel() {
//         this.isChannel = !this.isChannel;
//     }
//     toggleAllChannel() {
//         this.listorChannel = !this.listorChannel;
//     }
//     toggleIsUser() {
//         this.isUser = !this.isUser;
//     }
//     addUser(user: string) {
//         alert(user);
//         this.toggleIsUser();
//     }
//     createChannel(channelName: string) {
//         // const username = this.accountService.currentUser?.username || '';
//         // this.httpService.createChannel(channelName, username, (channelId: string) => {
//         //     if (channelId) {
//         //         // Update user data
//         //         if (this.accountService.currentUser) {
//         //             this.accountService.currentUser.channels.push(channelId);
//         //             this.accountService.saveUserData();
//         //         }
//         //         // Update chat conversations
//         //         this.chatService.conversations.push({
//         //             id: channelId,
//         //             messages: [],
//         //             name: channelName,
//         //             host: this.accountService.currentUser?.username,
//         //         });
//         //     } else {
//         //         // Handle error if channelId is not received
//         //         // eslint-disable-next-line no-console
//         //         console.error('Channel ID not received after creation.');
//         //     }
//         // });
//         // this.toggleChannel();
//     }
//     leaveChannel(channel: string) {
//         // const username = this.accountService.currentUser?.username || '';
//         // this.httpService.leaveChannel(
//         //     username,
//         //     channel,
//         //     () => {
//         //         // onSuccess callback
//         //         // Update user data in AccountService
//         //         const index = this.accountService.currentUser?.channels.indexOf(channel);
//         //         // eslint-disable-next-line @typescript-eslint/no-magic-numbers
//         //         if (index !== undefined && index !== -1) {
//         //             this.accountService.currentUser?.channels.splice(index, 1);
//         //             this.accountService.saveUserData();
//         //         }
//         //         // Remove the channel from chat conversations in ChatService
//         //         const conversationIndex = this.chatService.conversations.findIndex((c) => c.id === channel);
//         //         // eslint-disable-next-line @typescript-eslint/no-magic-numbers
//         //         if (conversationIndex !== -1) {
//         //             this.chatService.conversations.splice(conversationIndex, 1);
//         //         }
//         //     },
//         //     (error: unknown) => {
//         //         // onError callback
//         //         // eslint-disable-next-line no-console
//         //         console.error('Failed to leave channel:', error);
//         //     },
//         // );
//     }

//     deleteChannel(channel: string) {
//         const username = this.accountService.currentUser?.username || '';

//         // Call the deleteChannel method from the HTTP service
//         this.httpService.deleteChannel(channel, username);

//         // On success, remove the channel from user data in AccountService
//         const index = this.accountService.currentUser?.channels.indexOf(channel);
//         // eslint-disable-next-line @typescript-eslint/no-magic-numbers
//         if (index !== undefined && index !== -1) {
//             this.accountService.currentUser?.channels.splice(index, 1);
//             this.accountService.saveUserData();
//         }

//         // Remove the channel from chat conversations in ChatService
//         const conversationIndex = this.chatService.conversations.findIndex((c) => c.id === channel);
//         // eslint-disable-next-line @typescript-eslint/no-magic-numbers
//         if (conversationIndex !== -1) {
//             this.chatService.conversations.splice(conversationIndex, 1);
//         }
//     }
//     // Assuming this code is inside a method in your MainChatComponent
//     joinChannel(channelId: string, channelName: string, channelHost: string) {
//         // this.httpService.joinChannel(
//         //     this.accountService.currentUser?.username || '',
//         //     channelId,
//         //     () => {
//         //         // onSuccess callback
//         //         if (this.accountService.currentUser) {
//         //             if (!this.accountService.currentUser.channels.includes(channelId)) {
//         //                 this.accountService.currentUser.channels.push(channelId);
//         //                 this.accountService.saveUserData();
//         //             }
//         //             if (!this.chatService.conversations.some((c) => c.id === channelId)) {
//         //                 this.chatService.conversations.push({
//         //                     id: channelId,
//         //                     messages: [],
//         //                     name: channelName,
//         //                     host: channelHost,
//         //                 });
//         //             }
//         //             this.listorChannel = !this.listorChannel;
//         //         }
//         //     },
//         //     (error) => {
//         //         // eslint-disable-next-line no-console
//         //         console.error('Failed to join channel:', error);
//         //     },
//         // );
//     }

//     toggleGifComponent(): void {
//         this.showGifComponent = !this.showGifComponent;
//     }

//     // getGifImage(gifUrl: string): SafeHtml {
//     //     return this.sanitizer.bypassSecurityTrustHtml(gifUrl);
//     // }
//     getLatestMessage(conversation: { id: string; messages: MessagesMainPage[] }): string {
//         const latestMessage = conversation.messages[conversation.messages.length - 1];
//         if (latestMessage) {
//             return latestMessage.message;
//         } else {
//             if (this.accountService.userLanguage === Language.English) return 'No messages';
//             return 'Aucun messages';
//         }
//     }
// }
