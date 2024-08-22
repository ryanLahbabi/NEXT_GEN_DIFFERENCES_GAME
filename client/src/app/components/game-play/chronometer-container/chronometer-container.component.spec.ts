import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormatTimePipe } from '@app/classes/pipes/format-time.pipe';
import { ChronometerContainerComponent } from './chronometer-container.component';

describe('ChronometerContainerComponent', () => {
    let component: ChronometerContainerComponent;
    let fixture: ComponentFixture<ChronometerContainerComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ChronometerContainerComponent, FormatTimePipe],
        }).compileComponents();

        fixture = TestBed.createComponent(ChronometerContainerComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
