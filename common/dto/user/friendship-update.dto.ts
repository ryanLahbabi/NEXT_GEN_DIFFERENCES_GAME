import { FriendshipUpdate } from "../../enums/user/friendship-update.enum";
import { FriendUserDataDTO } from "./friend-user-data.dto";

export interface FriendshipUpdateDTO {
    username: string;
    friendshipUpdate: FriendshipUpdate;
    friendData?: FriendUserDataDTO;
}
