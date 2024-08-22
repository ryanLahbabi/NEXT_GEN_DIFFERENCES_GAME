import { Card } from './card';
import { CardBase64Files } from './card-base64-files';

export interface GameplayCard {
    data: Card;
    files: CardBase64Files;
}
