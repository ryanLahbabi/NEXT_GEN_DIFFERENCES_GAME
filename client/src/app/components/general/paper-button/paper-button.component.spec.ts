import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaperButtonComponent } from './paper-button.component';

describe('PaperButtonComponent', () => {
    let component: PaperButtonComponent;
    let fixture: ComponentFixture<PaperButtonComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [PaperButtonComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(PaperButtonComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
