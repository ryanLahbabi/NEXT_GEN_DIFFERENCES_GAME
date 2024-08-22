import { GeneralGameStatisticsDTO } from './general-game-statistics.dto';
import { InterfacePreferencesDTO } from './interface-preferences.dto';
import { PendingFriendRequestsDTO } from './pending-friend-requests.dto';

export interface PrivateUserDataDTO {
    username: string;
    email: string;
    avatar: string;
    biography: string;
    friends: string[];
    success: string;
    failure: string;
    elo: number;
    generalGameStatistics: GeneralGameStatisticsDTO;
    blockRelations: string[];
    pendingFriendRequests: PendingFriendRequestsDTO;
    interfacePreference: InterfacePreferencesDTO;
    hasBlocked: string[];
    channels: string[];
    likedCards: string[];
    dislikedCards: string[];
}
