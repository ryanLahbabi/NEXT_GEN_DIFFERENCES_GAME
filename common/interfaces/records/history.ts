import { TimeConcept } from '../general/time-concept';

export interface History {
    beginning: string;
    duration: TimeConcept;
    gameMode: string;
    player1: string;
    winner1: boolean;
    deserter1: boolean;
    player2?: string;
    winner2?: boolean;
    deserter2?: boolean;
}
