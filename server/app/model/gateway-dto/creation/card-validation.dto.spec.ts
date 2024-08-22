import { PaddingRadius } from '@common/enums/game-creation/padding-radius';
import { CardValidationFilter } from './card-validation.dto';

describe('CardValidationFilter', () => {
    let cardValidationInputDto: CardValidationFilter;

    beforeEach(() => {
        cardValidationInputDto = new CardValidationFilter();
    });

    it('should have originalImage property defined and of type string', () => {
        cardValidationInputDto.originalImage = 'originalImage.jpg';
        expect(cardValidationInputDto.originalImage).toBeDefined();
        expect(typeof cardValidationInputDto.originalImage).toEqual('string');
    });

    it('should have modifiedImage property defined and of type string', () => {
        cardValidationInputDto.modifiedImage = 'modifiedImage.jpg';
        expect(cardValidationInputDto.modifiedImage).toBeDefined();
        expect(typeof cardValidationInputDto.modifiedImage).toEqual('string');
    });

    it('should have range property defined and of type PaddingRadius', () => {
        cardValidationInputDto.range = PaddingRadius.FIVE;
        expect(cardValidationInputDto.range).toBeDefined();
        expect(cardValidationInputDto.range).toEqual(PaddingRadius.FIVE);
    });
});
