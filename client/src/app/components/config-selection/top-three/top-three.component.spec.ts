import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormatTimePipe } from '@app/classes/pipes/format-time.pipe';
import { FAKE_BEST_TIMES } from '@app/constants/game-selection-test-constants';
import { TopThreeComponent } from './top-three.component';

describe('TopThreeComponent', () => {
    let component: TopThreeComponent;
    let fixture: ComponentFixture<TopThreeComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [TopThreeComponent, FormatTimePipe],
        }).compileComponents();

        fixture = TestBed.createComponent(TopThreeComponent);
        component = fixture.componentInstance;
        component.soloScores = FAKE_BEST_TIMES;
        component.vsScores = FAKE_BEST_TIMES;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
