import { Injectable } from '@angular/core';
import { AbstractTool } from '@app/classes/game-creation/abstract-tool';

@Injectable({
    providedIn: 'root',
})
export class SelectedToolService {
    selectedTool: AbstractTool;
}
