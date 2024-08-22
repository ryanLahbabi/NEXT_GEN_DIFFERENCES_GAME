export interface StartGameDTO {
    gameId: string;
    totalTime: number;
    addedTime: number;
    canCheat: boolean;
    penaltyTime: number;
}