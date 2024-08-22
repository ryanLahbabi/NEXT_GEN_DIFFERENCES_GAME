import { ObserverHelpResponseDTO } from '@common/dto/game/observer-help-response.dto';
import { GameMode } from '@common/enums/game-play/game-mode';
import { GameClickOutputDto } from '@common/interfaces/game-play/game-click.dto';
import { EndgameOutputDto } from '@common/interfaces/game-play/game-endgame.dto';
import { Message } from '@common/interfaces/game-play/message';
import { Coordinates } from '../general/coordinates';
import { DifferenceImages } from './difference-images';
import { GameValues } from './game-values';

export type ReplayInput =
    | number
    | string
    | undefined
    | ObserverHelpResponseDTO
    | GameClickOutputDto
    | EndgameOutputDto
    | Message
    | boolean
    | DifferenceImages
    | Coordinates
    | (string | undefined)[];

export interface GameInformationForReplay {
    recordedTimes: number[];
    players: string[];
    totalTime: number;
    initialTime: number;
    elapsedTime: number;
    originalUrl: string;
    modifiedUrl: string;
    finalTime: number;
    gameName: string;
    difficulty: string;
    gameId: string;
    nbOfPlayers: number;
    gameMode: GameMode;
    totalDifferences: number;
    gameValues: GameValues;
    timeToStart: number;
    originalDifferencesUrls: string[];
    flashingDifferencesUrls: string[];
    cheatImages: (string | undefined)[];
    isObserving: boolean;
}

export interface ReplayListInfo {
    createdAt: string;
    gameName: string;
    players: string[];
    difficulty: string;
    totalDifferences: number;
}

export interface ReplayAction {
    time: number; // in seconds
    category: string; // function called
    input: ReplayInput;
}

export interface GameStateSnapshot {
    time: number; // in seconds
    state: GameState;
}

export interface GameState {
    totalDifferences: number;
    differencesFoundTotal: number;
    originalDifferencesUrls: string[];
}

export interface ReplayInformationToRestore {
    gameDetails: GameInformationForReplay;
    actions: ReplayAction[];
    snapshots: GameStateSnapshot[];
}

export interface Replay {
    gameDetails: GameInformationForReplay;
    actions: ReplayAction[];
    snapshots: GameStateSnapshot[];
    createdAt: Date;
    createdBy: string;
}

export interface CompressedReplay {
    gameDetails: string; // Compressed GameInformationForReplay
    actions: string; // Compressed ReplayAction[]
    snapshots: string; // Compressed GameStateSnapshot[]
    createdAt: Date;
    createdBy: string;
}
