import { enableProdMode, Injector } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppModule } from './app/app.module';
import { environment } from './environments/environment';
import { SettingsService } from '@app/services/divers/settings.service';
import { Theme } from '@common/enums/user/theme.enum';


if (environment.production) {
    enableProdMode();
}

platformBrowserDynamic()
    .bootstrapModule(AppModule)
    .then((moduleRef) => {
        const injector: Injector = moduleRef.injector;
        const settingService = injector.get(SettingsService);
            setInterval(() => {
                const theme = settingService.theme;
                let backgroundImageUrl = '';
                switch (theme) {
                  case Theme.Light:
                    backgroundImageUrl = './assets/Postboard_background.png';
                    break;
                  case Theme.Dark:
                    backgroundImageUrl = './assets/dark_background.png';
                    break;
                  default:
                    backgroundImageUrl = './assets/Postboard_background.png';
                }
                          document.documentElement.style.setProperty('--background-image-url', `url(${backgroundImageUrl})`);
              }, 300); 
    })
    .catch((err) => console.error(err));
