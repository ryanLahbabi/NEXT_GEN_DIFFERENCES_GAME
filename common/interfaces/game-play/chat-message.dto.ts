export interface ChatMessageOutputDto {
    sender: string;
    message: string;
    timestamp?: number;
    lobbyId?: string;
}
