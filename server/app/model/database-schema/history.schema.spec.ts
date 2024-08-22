import { getModelToken } from '@nestjs/mongoose';
import { Test } from '@nestjs/testing';
import { Model } from 'mongoose';
import { RecordDocument, recordSchema } from '@app/model/database-schema/history.schema';

describe('RecordSchema', () => {
    let recordModel: Model<RecordDocument>;

    beforeEach(async () => {
        await Test.createTestingModule({
            providers: [
                {
                    provide: getModelToken('Record'),
                    useValue: recordModel,
                },
            ],
        }).compile();
    });

    it('should be defined', () => {
        expect(recordSchema).toBeDefined();
    });
});
