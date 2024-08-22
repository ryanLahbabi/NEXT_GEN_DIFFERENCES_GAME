import { GameMode } from '@common/enums/game-play/game-mode';
import { validate } from 'class-validator';
import { GameConnectionRequestFilter } from './game-connection-request.dto';

describe('GameConnectionRequestFilter', () => {
    it('should validate a valid input', async () => {
        const input = new GameConnectionRequestFilter();
        input.gameMode = GameMode.Classic1v1;
        input.playerName = 'Ryan';
        input.cardId = 'random-card-id-test-';
        const errors = await validate(input);
        expect(errors).toHaveLength(0);
    });
});
