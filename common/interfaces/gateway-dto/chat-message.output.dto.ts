import { ChatMessageType } from '../../enums/game-play/chat-message-type';

export interface ChatMessageOutputDto {
    sender: string;
    type: ChatMessageType;
    message: string;
}
