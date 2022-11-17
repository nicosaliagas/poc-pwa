import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { loadSettings } from './environments/loadSettings';


loadSettings().then((environment: any) => {
  if (environment['production']) {
    // window.console.log = () => { }

    enableProdMode();
  }

  platformBrowserDynamic().bootstrapModule(AppModule);
});

