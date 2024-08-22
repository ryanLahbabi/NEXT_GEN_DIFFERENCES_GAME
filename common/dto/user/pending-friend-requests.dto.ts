import { ReceivedFriendRequestDTO } from "./received-friend-request.dto";

export interface PendingFriendRequestsDTO {
    sent: string[];
    received: ReceivedFriendRequestDTO[];
}