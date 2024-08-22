import { GameMode } from '@common/enums/game-play/game-mode';
import { CardFiles } from '@common/interfaces/game-card/card-files';
import { GameValues } from '@common/interfaces/game-play/game-values';
import { ObserverState } from '../../enums/game-play/observer-state.enum';
import { InGameMessageDTO } from './in-game-message.dto';

export interface ObserverStateDTO {
    state: ObserverState;
    data?: {
        gameId: string;
        cards: CardFiles[];
        observerNbr: number;
        foundDifferences?: string[];
        gameMode: GameMode;
        gameValues: GameValues;
        messages: InGameMessageDTO[];
        time: number;
        players: {
            name: string;
            score: number;
        }[];
    };
}
