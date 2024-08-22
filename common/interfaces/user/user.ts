import { GeneralGameStatistics } from "../../../server/app/model/database/interfaces/user/general-game-statistics.interface";
import { InterfacePrefences } from "../../../server/app/model/database/interfaces/user/interface-preferences.interface";

export interface User {
    username: string;
    hashedPassword: string;
    email: string;
    avatar: string;
    biography: string;
    blockedUsers: string[];
    friends: string[];
    interfacePreference: InterfacePrefences;
    generalGameStatistics: GeneralGameStatistics;
}
