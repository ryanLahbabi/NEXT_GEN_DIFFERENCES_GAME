import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormatTimePipe } from '@app/classes/pipes/format-time.pipe';
import { SafeUrlPipe } from '@app/classes/pipes/safe-url-pipe';
import { ArrowGameSelectionComponent } from '@app/components/config-selection/arrow-game-selection/arrow-game-selection.component';
import { AwaitingPlayersModalComponent } from '@app/components/config-selection/awaiting-players-modal/awaiting-players-modal.component';
import { CarouselViewComponent } from '@app/components/config-selection/carousel-view/carousel-view.component';
import { GameConstantsComponent } from '@app/components/config-selection/game-constants/game-constants.component';
import { GameSelectComponent } from '@app/components/config-selection/game-select/game-select.component';
import { TopThreeComponent } from '@app/components/config-selection/top-three/top-three.component';
import { UserNameDialogComponent } from '@app/components/config-selection/user-name-dialog/user-name-dialog.component';
import { WarnPlayerModalComponent } from '@app/components/config-selection/warn-player-modal/warn-player-modal.component';
import { DrawingAreaComponent } from '@app/components/game-creation/drawing-area/drawing-area.component';
import { GameCreationDialogComponent } from '@app/components/game-creation/game-creation-dialog/game-creation-dialog.component';
import { ImageEditionZoneComponent } from '@app/components/game-creation/image-edition-zone/image-edition-zone.component';
import { ImagePickerComponent } from '@app/components/game-creation/image-picker/image-picker.component';
import { ToolBarComponent } from '@app/components/game-creation/tool-bar/tool-bar.component';
import { ChronometerContainerComponent } from '@app/components/game-play/chronometer-container/chronometer-container.component';
import { CongratsMessageCoopComponent } from '@app/components/game-play/congrats-message-coop/congrats-message-coop.component';
import { CongratsMessageComponent } from '@app/components/game-play/congrats-message/congrats-message.component';
import { DifferencesFoundComponent } from '@app/components/game-play/differences-found/differences-found.component';
import { DisplayScoreComponent } from '@app/components/game-play/display-score/display-score.component';
import { PlayAreaComponent } from '@app/components/game-play/play-area/play-area.component';
import { PageTitleComponent } from '@app/components/general/page-title/page-title.component';
import { PaperButtonComponent } from '@app/components/general/paper-button/paper-button.component';
import { PostItComponent } from '@app/components/general/post-it/post-it.component';
import { TopBarComponent } from '@app/components/general/top-bar/top-bar.component';
import { AppRoutingModule } from '@app/modules/app-routing.module';
import { AppMaterialModule } from '@app/modules/material.module';
import { AdminPageComponent } from '@app/pages/admin-page/admin-page.component';
import { AppComponent } from '@app/pages/app/app.component';
import { ClassicSelectionPageComponent } from '@app/pages/classic-selection-page/classic-selection-page.component';
import { GameCreationPageComponent } from '@app/pages/game-creation-page/game-creation-page.component';
import { GamePageComponent } from '@app/pages/game-page/game-page.component';
import { MainPageComponent } from '@app/pages/main-page/main-page.component';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { ChannelConversationComponent } from './components/channel/channel-conversation/channel-conversation/channel-conversation.component';
import { ChannelSelectionComponent } from './components/channel/channel-selection/channel-selection/channel-selection.component';
import { ChannelToggleComponent } from './components/channel/channel-toggle/channel-toggle/channel-toggle.component';
import { ChannelComponent } from './components/channel/channel/channel.component';
import { AdminModalComponent } from './components/config-selection/admin-modal/admin-modal.component';
import { HistoryComponent } from './components/config-selection/history/history.component';
import { PlayerListComponent } from './components/config-selection/player-list/player-list.component';
import { ReplayListComponent } from './components/config-selection/replay-list/replay-list.component';
import { TabComponent } from './components/config-selection/tab/tab.component';
import { TabsComponent } from './components/config-selection/tabs/tabs.component';
import { TimedSelectionModalComponent } from './components/config-selection/timed-selection-modal/timed-selection-modal.component';
import { WarningDialogComponent } from './components/config-selection/warning-dialog/warning-dialog.component';
import { BanUserComponent } from './components/game-creation/ban-user/ban-user.component';
import { ChatboxComponent } from './components/game-play/chatbox/chatbox.component';
import { CongratsMessageTimeLimitedComponent } from './components/game-play/congrats-message-time-limited/congrats-message-time-limited.component';
import { InteractionComponent } from './components/game-play/interaction/interaction.component';
import { ReplayAreaComponent } from './components/game-play/replay-area/replay-area.component';
import { AcceptFriendsComponent } from './components/general/accept-friends/accept-friends.component';
import { AvatarComponent } from './components/general/avatar/avatar.component';
import { FriendsComponent } from './components/general/friends/friends.component';
import { GifComponent } from './components/general/gif/gif.component';
import { WindowChatComponent } from './components/general/window-chat-component/window-chat-component.component';
import { SettingsComponent } from './components/settings/settings.component';
import { AccountPageComponent } from './pages/account-page/account-page.component';
import { EditProfilePageComponent } from './pages/edit-profile-page/edit-profile-page.component';
import { LoginPageComponent } from './pages/login-page/login-page.component';
import { ResetPasswordPageComponent } from './pages/reset-password-page/reset-password-page.component';
import { SignUpPageComponent } from './pages/sign-up-page/sign-up-page.component';
import { TimedSelectionPageComponent } from './pages/timed-selection-page/timed-selection-page.component';
import { UsersProfileComponent } from './components/general/users-profile/users-profile.component';
import { LoadingComponent } from './components/config-selection/loading/loading.component';
import { ConfirmDialogComponent } from './components/config-selection/components/confirm-dialog/confirm-dialog.component';

// eslint-disable-next-line prefer-arrow/prefer-arrow-functions
export function httpLoaderFactory(http: HttpClient) {
    return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}
/**
 * Main module that is used in main.ts.
 * All automatically generated components will appear in this module.
 * Please do not move this module in the module folder.
 * Otherwise Angular Cli will not know in which module to put new component
 */
@NgModule({
    declarations: [
        AppComponent,
        GamePageComponent,
        MainPageComponent,
        PlayAreaComponent,
        TopBarComponent,
        PageTitleComponent,
        PostItComponent,
        AdminPageComponent,
        ClassicSelectionPageComponent,
        ArrowGameSelectionComponent,
        UserNameDialogComponent,
        TopThreeComponent,
        GameCreationPageComponent,
        FormatTimePipe,
        ReplayAreaComponent,
        ImageEditionZoneComponent,
        SafeUrlPipe,
        GameSelectComponent,
        ImagePickerComponent,
        DisplayScoreComponent,
        PaperButtonComponent,
        PaperButtonComponent,
        GameCreationDialogComponent,
        GameConstantsComponent,
        CongratsMessageComponent,
        DifferencesFoundComponent,
        ChronometerContainerComponent,
        CarouselViewComponent,
        ChatboxComponent,
        AwaitingPlayersModalComponent,
        ToolBarComponent,
        DrawingAreaComponent,
        WarnPlayerModalComponent,
        CongratsMessageCoopComponent,
        TimedSelectionModalComponent,
        HistoryComponent,
        WarningDialogComponent,
        CongratsMessageTimeLimitedComponent,
        LoginPageComponent,
        SignUpPageComponent,
        AccountPageComponent,
        SettingsComponent,
        FriendsComponent,
        AcceptFriendsComponent,
        AdminModalComponent,
        WindowChatComponent,
        ChannelComponent,
        TabsComponent,
        TabComponent,
        PlayerListComponent,
        TimedSelectionPageComponent,
        ReplayListComponent,
        ResetPasswordPageComponent,
        InteractionComponent,
        BanUserComponent,
        GifComponent,
        ChannelToggleComponent,
        ChannelConversationComponent,
        ChannelSelectionComponent,
        ChannelConversationComponent,
        ChannelSelectionComponent,
        ChannelToggleComponent,
        AvatarComponent,
        EditProfilePageComponent,
        UsersProfileComponent,
        LoadingComponent,
        ConfirmDialogComponent,
    ],
    imports: [
        AppMaterialModule,
        AppRoutingModule,
        BrowserAnimationsModule,
        BrowserModule,
        FormsModule,
        HttpClientModule,
        MatGridListModule,
        MatDialogModule,
        MatProgressSpinnerModule,
        CommonModule,
        TranslateModule.forRoot({
            loader: {
                provide: TranslateLoader,
                useFactory: httpLoaderFactory,
                deps: [HttpClient],
            },
        }),
    ],
    providers: [],
    bootstrap: [AppComponent],
})
export class AppModule {}
