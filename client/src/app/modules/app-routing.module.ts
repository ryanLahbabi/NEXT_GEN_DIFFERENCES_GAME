import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UsersProfileComponent } from '@app/components/general/users-profile/users-profile.component';
import { WindowChatComponent } from '@app/components/general/window-chat-component/window-chat-component.component';
import { AccountPageComponent } from '@app/pages/account-page/account-page.component';
import { AdminPageComponent } from '@app/pages/admin-page/admin-page.component';
import { ClassicSelectionPageComponent } from '@app/pages/classic-selection-page/classic-selection-page.component';
import { EditProfilePageComponent } from '@app/pages/edit-profile-page/edit-profile-page.component';
import { GameCreationPageComponent } from '@app/pages/game-creation-page/game-creation-page.component';
import { GamePageComponent } from '@app/pages/game-page/game-page.component';
import { LoginPageComponent } from '@app/pages/login-page/login-page.component';
import { MainPageComponent } from '@app/pages/main-page/main-page.component';
import { ResetPasswordPageComponent } from '@app/pages/reset-password-page/reset-password-page.component';
import { SignUpPageComponent } from '@app/pages/sign-up-page/sign-up-page.component';
import { TimedSelectionPageComponent } from '@app/pages/timed-selection-page/timed-selection-page.component';

const routes: Routes = [
    { path: '', redirectTo: '/login', pathMatch: 'full' },
    { path: 'home', component: MainPageComponent },
    { path: 'classic', component: ClassicSelectionPageComponent },
    { path: 'timed', component: TimedSelectionPageComponent },
    { path: 'admin', component: AdminPageComponent },
    { path: 'game', component: GamePageComponent },
    { path: 'login', component: LoginPageComponent },
    { path: 'sign-up', component: SignUpPageComponent },
    { path: 'reset-password', component: ResetPasswordPageComponent },
    { path: 'account', component: AccountPageComponent },
    { path: 'edit-profile', component: EditProfilePageComponent },
    { path: 'creation', component: GameCreationPageComponent },
    { path: 'window-chat', component: WindowChatComponent },
    { path: 'users-profile', component: UsersProfileComponent },
];

@NgModule({
    imports: [RouterModule.forRoot(routes, { useHash: true })],
    exports: [RouterModule],
})
export class AppRoutingModule {}
