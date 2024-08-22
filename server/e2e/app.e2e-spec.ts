import { AppModule } from '@app/example-server/app.module';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';

describe('AppController (e2e)', () => {
    let app: INestApplication;

    beforeEach(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        await app.init();
    });

    // Making sure our server starts well and we are able to get the date
    it('GET /date', async () => {
        return request(app.getHttpServer()).get('/date').expect(HttpStatus.OK);
    });
});
