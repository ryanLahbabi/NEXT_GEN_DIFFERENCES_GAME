import { ChannelMessageType } from '../../enums/channel-message-type.enum';
import { TranslatedAction } from '../../types/translated-action.type';

export interface ChannelMessageDTO {
    type: ChannelMessageType;
    timestamp: number;
    channelId: string;
    sender?: string;
    message?: string;
    getGlobalMessage?: TranslatedAction;
    avatar?: string;
    // isAGif: boolean
}
