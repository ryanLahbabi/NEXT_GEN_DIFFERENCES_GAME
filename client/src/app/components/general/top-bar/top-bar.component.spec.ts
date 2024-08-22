/* eslint-disable max-classes-per-file */
import { Component, Input } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PostItComponent } from '@app/components/general/post-it/post-it.component';
import { TopBarComponent } from './top-bar.component';

@Component({ selector: 'app-btn-back-to-main-page', template: '' })
class BtnBackToMainPageStubComponent {}
@Component({ selector: 'app-page-title', template: '' })
class PageTitleStubComponent {
    @Input() pageTitle: string;
}

describe('TopBarComponent', () => {
    let component: TopBarComponent;
    let fixture: ComponentFixture<TopBarComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [TopBarComponent, BtnBackToMainPageStubComponent, PageTitleStubComponent, PostItComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(TopBarComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
