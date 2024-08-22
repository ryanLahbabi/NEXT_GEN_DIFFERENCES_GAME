import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChannelToggleComponent } from './channel-toggle.component';

describe('ChannelToggleComponent', () => {
    let component: ChannelToggleComponent;
    let fixture: ComponentFixture<ChannelToggleComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ChannelToggleComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(ChannelToggleComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
