import { AuthService } from '@app/services/authentification/auth.service';
import { ConnectionsService } from '@app/services/authentification/connections.service';
import ChannelManagerService from '@app/services/chat/channel-manager.service';
import ChannelDBService from '@app/services/chat/channel.db.service';
import MongoDBService from '@app/services/mongodb/mongodb.service';
import UserDBService from '@app/services/user/user.db.service';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthController } from './controllers/auth.controller';
import { ChannelController } from './controllers/channel.controller';
import UserController from './controllers/user.controller';
import CardGateway from './gateways/card.gateway';
import ChannelGateway from './gateways/channel.gateway';
import GameGateway from './gateways/game.gateway';
import OutputFilterGateway from './gateways/output-filters.gateway';
import RecordGateway from './gateways/record.gateway';
import UserGateway from './gateways/user.gateway';
import { jwtConstants } from './guards/auth.constants';
import { CardDocument, cardSchema } from './model/database-schema/card.schema';
import { Channel, channelSchema } from './model/database-schema/channel/channel.schema';
import { RecordDocument, recordSchema } from './model/database-schema/history.schema';
import { User, userSchema } from './model/database-schema/user/user.schema';

import { EventEmitter } from 'stream';
// eslint-disable-next-line import/no-deprecated, import/namespace
import { CardController } from './controllers/card.controller';
import { ReplayController } from './controllers/replay.controller';
import { Video, videoSchema } from './model/database-schema/video/video.schema';
import { ReplayService } from './services/replay/replay.service';

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        MongooseModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: async (config: ConfigService) => ({
                uri: config.get<string>('DATABASE_CONNECTION_STRING'), // Loaded from .env
            }),
        }),
        JwtModule.register({
            global: true,
            secret: jwtConstants.secret,
            signOptions: { expiresIn: '1000000000s' },
        }),
        MongooseModule.forFeature([{ name: User.name, schema: userSchema }]),
        MongooseModule.forFeature([{ name: CardDocument.name, schema: cardSchema }]),
        MongooseModule.forFeature([{ name: RecordDocument.name, schema: recordSchema }]),
        MongooseModule.forFeature([{ name: Channel.name, schema: channelSchema }]),
        MongooseModule.forFeature([{ name: Video.name, schema: videoSchema }]),
    ],
    controllers: [UserController, AuthController, ChannelController, ReplayController, CardController],
    providers: [
        MongoDBService,
        GameGateway,
        CardGateway,
        RecordGateway,
        OutputFilterGateway,
        UserDBService,
        AuthService,
        UserGateway,
        ConnectionsService,
        ChannelGateway,
        ChannelManagerService,
        ChannelDBService,
        ReplayService,
    ],
})
export class AppModule {
    constructor() {
        const maxListeners = 1000;
        EventEmitter.setMaxListeners(maxListeners);
    }
}
