import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ArrowGameSelectionComponent } from './arrow-game-selection.component';

describe('ArrowGameSelectionComponent', () => {
    let component: ArrowGameSelectionComponent;
    let fixture: ComponentFixture<ArrowGameSelectionComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ArrowGameSelectionComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(ArrowGameSelectionComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should emit event when activated button is clicked', () => {
        spyOn(component.buttonClick, 'emit');
        component.activated = true;
        component.onClick();
        expect(component.buttonClick.emit).toHaveBeenCalled();
    });

    it('should not emit event when deactivated button is clicked', () => {
        spyOn(component.buttonClick, 'emit');
        component.activated = false;
        component.onClick();
        expect(component.buttonClick.emit).not.toHaveBeenCalled();
    });
});
