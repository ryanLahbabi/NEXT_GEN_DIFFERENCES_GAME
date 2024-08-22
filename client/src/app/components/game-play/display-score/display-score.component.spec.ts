// import { ComponentFixture, TestBed } from '@angular/core/testing';

// import { DisplayScoreComponent } from './display-score.component';

// describe('DisplayScoreComponent', () => {
//     let component: DisplayScoreComponent;
//     let fixture: ComponentFixture<DisplayScoreComponent>;

//     beforeEach(async () => {
//         await TestBed.configureTestingModule({
//             declarations: [DisplayScoreComponent],
//         }).compileComponents();

//         fixture = TestBed.createComponent(DisplayScoreComponent);
//         component = fixture.componentInstance;
//         fixture.detectChanges();
//     });

//     it('should create', () => {
//         expect(component).toBeTruthy();
//     });
//     it('get differencesLeft should return Math.ceil((gameService.totalDifferences + 1) / 2) when nbOPlayers = 2', () => {
//         component.gameService.totalDifferences = 3;
//         component.gameData.nbOfPlayers = 2;
//         expect(component.differencesLeft).toEqual(2);
//     });
//     it('get differencesLeft should return gameService.totalDifferences when nbOPlayers = 1', () => {
//         component.gameService.totalDifferences = 1;
//         component.gameData.nbOfPlayers = 1;
//         expect(component.differencesLeft).toEqual(1);
//     });
// });
