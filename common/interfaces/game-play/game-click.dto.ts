export interface GameClickOutputDto {
    valid: boolean;
    playerName?: string;
    penaltyTime?: number;
    differenceNaturalOverlay?: string;
    differenceFlashOverlay?: string;
}

export interface GameDifferenceImages {
    differenceNaturalOverlay: string;
    differenceFlashOverlay: string;
    index: number;
}