import { PlayerRecordDocument, playerRecordSchema } from '@app/model/database-schema/player-record.schema';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { Model } from 'mongoose';

describe('PlayerRecord', () => {
    let playerRecordModel: Model<PlayerRecordDocument>;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                {
                    provide: getModelToken('PlayerRecord'),
                    useValue: Model,
                },
                {
                    provide: 'PLAYER_RECORD_MODEL',
                    useValue: playerRecordSchema,
                },
            ],
        }).compile();

        playerRecordModel = module.get<Model<PlayerRecordDocument>>(getModelToken('PlayerRecord'));
    });

    it('should be defined', () => {
        expect(playerRecordModel).toBeDefined();
    });
});
