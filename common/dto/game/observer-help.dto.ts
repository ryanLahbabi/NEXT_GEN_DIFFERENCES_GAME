import { ObserverHelpCoordinates } from './observer-help-coordinates.dto';

export interface ObserverHelpDTO {
    gameId: string;
    zoneCoordinates: ObserverHelpCoordinates;
    targetPlayerName?: string;
}
