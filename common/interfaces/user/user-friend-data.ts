import { GeneralGameStatistics } from "./general_game_statistics";

export default interface UserFriendData {
    username: string;
    avatar: string;
    biography: string;
    friends: string[];
    generalGameStatistics: GeneralGameStatistics;
}