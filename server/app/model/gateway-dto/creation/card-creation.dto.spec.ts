import { NAME_MAX_LENGTH, NAME_MIN_LENGTH } from '@app/model/gateway-dto/game/game.constants';
import { PaddingRadius } from '@common/enums/game-creation/padding-radius';
import { CardCreationFilter } from './card-creation.dto';

describe('CardCreationFilter', () => {
    let cardCreationInputDto: CardCreationFilter;

    beforeEach(() => {
        cardCreationInputDto = new CardCreationFilter();
    });

    it('should have originalImage property defined and of type string', () => {
        cardCreationInputDto.originalImage = 'originalImage.jpg';
        expect(cardCreationInputDto.originalImage).toBeDefined();
        expect(typeof cardCreationInputDto.originalImage).toEqual('string');
    });

    it('should have modifiedImage property defined and of type string', () => {
        cardCreationInputDto.modifiedImage = 'modifiedImage.jpg';
        expect(cardCreationInputDto.modifiedImage).toBeDefined();
        expect(typeof cardCreationInputDto.modifiedImage).toEqual('string');
    });

    it('should have range property defined and of type PaddingRadius', () => {
        cardCreationInputDto.range = PaddingRadius.THREE;
        expect(cardCreationInputDto.range).toBeDefined();
        expect(cardCreationInputDto.range).toEqual(PaddingRadius.THREE);
    });

    it('should have name property defined and of type string with length within NAME_MIN_LENGTH and NAME_MAX_LENGTH', () => {
        cardCreationInputDto.name = 'Card Name';
        expect(cardCreationInputDto.name).toBeDefined();
        expect(typeof cardCreationInputDto.name).toEqual('string');
        expect(cardCreationInputDto.name.length).toBeGreaterThanOrEqual(NAME_MIN_LENGTH);
        expect(cardCreationInputDto.name.length).toBeLessThanOrEqual(NAME_MAX_LENGTH);
    });
});
