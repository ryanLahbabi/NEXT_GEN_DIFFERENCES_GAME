import { ChannelDTO } from '@common/dto/channel/channel.dto';
import { ChannelUpdateType } from '../../enums/channel/channel-update-type.enum';

export interface ChannelUpdateDTO {
    type: ChannelUpdateType;
    channelData: ChannelDTO[];
}
