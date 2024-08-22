import { Injectable } from '@angular/core';
import { GameSelection } from '@app/interfaces/game-card/game-selection';
import { CarouselType } from '@common/enums/carousel-type';
import { Subject } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class GameSelectorService {
    selectionValue: Subject<GameSelection> = new Subject<{ carouselType: CarouselType; id: string }>();

    setSelectionValue(carouselType: CarouselType, id: string) {
        this.selectionValue.next({ carouselType, id } as GameSelection);
    }
}
