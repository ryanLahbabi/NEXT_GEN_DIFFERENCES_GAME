import { Injectable } from '@angular/core';
import { HttpService } from '@app/services/communication/http.service';
import { SocketClientService } from '@app/services/communication/socket-client.service';
import { FriendUserDataDTO } from '@common/dto/user/friend-user-data.dto';
import { PrivateUserDataDTO } from '@common/dto/user/private-user-data.dto';
import { ReceivedFriendRequestDTO } from '@common/dto/user/received-friend-request.dto';
import { FromServer, ToServer } from '@common/socket-event-constants';

@Injectable({
    providedIn: 'root',
})
export class FriendsService {
    friendsFounded: FriendUserDataDTO[] = [];
    searchTerm: string;
    allFriends: FriendUserDataDTO[] = [];
    allUsersData: PrivateUserDataDTO[] = [];
    selectedUserFriends: string[] = [];
    sender: string;
    pendingInvitations: string[] = [];
    selectedUsername: string | null = null;
    isFriendsListVisible = false;

    private userData: PrivateUserDataDTO;

    constructor(public socketService: SocketClientService, public httpService: HttpService) {}

    init(userData?: PrivateUserDataDTO) {
        if (userData) this.userData = userData;
        else if (!this.userData) throw new Error('User Data should have been defined');
        this.socketService.send(ToServer.USERS_DATA);
        this.socketService.on(FromServer.USERS_DATA, (data: any) => {
            this.allFriends = data;
            this.allUsersData = data;
            this.isAFriend(this.userData.username);
            this.isPending(this.userData.username);
        });

        this.socketService.on(FromServer.BLOCK_USER, (data: string) => {
            this.userData.blockRelations.push(data);
        });

        this.socketService.on(FromServer.UNBLOCK_USER, (data: string) => {
            if (this.userData.blockRelations) {
                this.userData.blockRelations = this.userData.blockRelations.filter((blockedUser) => blockedUser !== data);
            }
        });

        this.socketService.send(ToServer.SHOW_PENDING_FRIEND_REQUEST);
        this.socketService.on(FromServer.SHOW_PENDING_FRIEND_REQUEST, (data: ReceivedFriendRequestDTO[]) => {
            data.forEach((request) => {
                if (!this.pendingInvitations.includes(request.from)) {
                    this.pendingInvitations.push(request.from);
                }
            });
        });

        this.socketService.on(FromServer.START_FRIEND_REQUEST, (data: string) => {
            this.sender = data;
            if (!this.pendingInvitations.includes(this.sender)) {
                this.pendingInvitations.push(this.sender);
            }
        });
    }

    setSelectedUserFriends(username: string): void {
        const user = this.allFriends.find((friend) => friend.username === username);
        if (user) {
            this.selectedUserFriends = user ? user.friends : [];
        } else {
            this.selectedUserFriends = [];
        }

        this.selectedUsername = username;
        this.isFriendsListVisible = !this.isFriendsListVisible || this.selectedUsername !== username;
    }

    getFriends(username: string): string[] {
        const user = this.allFriends.find((friend) => friend.username === username);
        if (user) return user?.friends;
        else return [];
    }

    getUserStats(username: string): PrivateUserDataDTO {
        // eslint-disable-next-line @typescript-eslint/no-shadow
        const user = this.allUsersData.find((user) => user.username === username);
        if (!user) {
            throw new Error(`User not found: ${username}`);
        }
        return user;
    }

    searchFriends(): void {
        if (this.searchTerm) {
            this.friendsFounded = this.allFriends.filter((friend) => friend.username.toLowerCase().includes(this.searchTerm.toLowerCase()));
        } else this.friendsFounded = [...this.allFriends];
        this.updateFriendsFounded();
    }

    isAFriend(username?: string) {
        this.friendsFounded = this.allFriends.map((friend) => {
            friend.isFriend = friend.friends.includes(username || '');
            return friend;
        });
        this.updateFriendsFounded();
    }

    isPending(username?: string) {
        this.friendsFounded = this.allFriends.map((friend) => {
            friend.isFriendRequested = friend.pendingFriendRequests?.received.some((request) => request.from.includes(username || ''));
            return friend;
        });
        this.updateFriendsFounded();
    }

    isBlocked(username?: string) {
        return this.userData.hasBlocked?.some((blockedUsername) => blockedUsername === username) || false;
    }

    isMyFriend(username: string): boolean {
        return this.allFriends.some((friend) => friend.username === username && friend.isFriend);
    }

    isMyPending(username: string): boolean {
        return this.pendingInvitations.some((request) => request === username);

        // let result = this.allFriends.some((friend) => friend.pendingFriendRequests?.sent.some((sentUsername) => sentUsername === username))
        // console.log("username:"+ result );
        // console.log("All friends:", JSON.stringify(this.allFriends, null, 2));
        // let result = this.allFriends.some(friend =>
        //     friend.username === username &&
        //     friend.pendingFriendRequests?.received.some(receivedUsername => receivedUsername === currentUserUsername)
        // );

        // return this.allFriends.some((friend) => friend.pendingFriendRequests?.sent.some((sentUsername) => this.userData.username === username));
    }

    removeFriend(username: string) {
        this.socketService.send(ToServer.REMOVE_FRIEND, username);
        this.friendsFounded = this.friendsFounded.map((friend) => {
            if (friend.username === username) {
                return { ...friend, isFriend: false };
            }
            return friend;
        });
    }

    askToBeFriend(username: string) {
        const friend = this.friendsFounded.find((f) => f.username === username);
        if (friend) {
            friend.isFriendRequested = true;

            friend.pendingFriendRequests?.sent.push(username);

            if (friend.pendingFriendRequests?.sent.includes(this.userData.username ?? '')) {
                friend.isFriendRequested = true;
            }
        }
        this.socketService.send(ToServer.START_FRIEND_REQUEST, username);
    }

    answerInvitation(username: string, accepted: boolean) {
        const answer = {
            username,
            accepted,
        };
        this.socketService.send(ToServer.END_FRIEND_REQUEST, answer);
        this.pendingInvitations = this.pendingInvitations.filter((user) => user !== username);
    }

    blockUser(username: string) {
        this.removeFriend(username);
        this.httpService.blockUser(username).subscribe();
        this.socketService.send(ToServer.BLOCK_USER, username);
        const isAlreadyBlocked = this.userData.hasBlocked.some((blockedUsername) => blockedUsername === username);
        if (!isAlreadyBlocked) {
            this.userData.hasBlocked.push(username);
        }
    }

    unBlockUser(username: string) {
        this.httpService.unBlockUser(username).subscribe();
        this.socketService.send(ToServer.UNBLOCK_USER, username);
        if (this.userData.hasBlocked) {
            this.userData.hasBlocked = this.userData.hasBlocked.filter((blockedUsername) => blockedUsername !== username);
        }
    }

    updateFriendsFounded(): void {
        this.friendsFounded = this.friendsFounded.filter(
            (friend) =>
                !this.userData.blockRelations.includes(friend.username) ||
                (this.userData.blockRelations.includes(friend.username) && this.userData.hasBlocked.includes(friend.username)),
        );
    }
}
