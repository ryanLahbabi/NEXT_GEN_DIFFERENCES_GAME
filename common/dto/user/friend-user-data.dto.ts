import { PendingFriendRequestsDTO } from "./pending-friend-requests.dto";


export interface FriendUserDataDTO {
    username: string;
    avatar: string;
    biography: string;
    friends: string[];
    pendingFriendRequests?: PendingFriendRequestsDTO;
    isFriend?: boolean;
    isFriendRequested?: boolean;

}
