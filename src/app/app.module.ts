import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { APP_INITIALIZER, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ServiceWorkerModule } from '@angular/service-worker';
import { HttpService } from 'cocori-ng/src/feature-core';
import { LoadEnvironmentFactory } from 'src/services/app-factory';
import { CheckForUpdateService } from 'src/services/check-for-update.service';
import { HandleUnrecoverableStateService } from 'src/services/handle-unrecoverable-state.service';
import { PromptUpdateService } from 'src/services/prompt-update.service';

import { environment } from '../environments/environment';
import { DatasetsService } from '../services/datasets.service';
import { EnvironmentLoaderService } from '../services/environment-loader.service';
import { EnvironmentService } from '../services/environment.service';
import { ErrorInterceptorService } from '../services/error-interceptor.service';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    AppRoutingModule,
    ServiceWorkerModule.register('ngsw-worker.js', {
      enabled: environment.production,
      // Register the ServiceWorker as soon as the application is stable
      // or after 30 seconds (whichever comes first).
      registrationStrategy: 'registerWhenStable:30000'
      // registrationStrategy: 'registerImmediately'
    })
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: ErrorInterceptorService,
      multi: true
    },
    {
      provide: APP_INITIALIZER,
      useFactory: LoadEnvironmentFactory,
      deps: [EnvironmentLoaderService, PromptUpdateService, DatasetsService, HandleUnrecoverableStateService, CheckForUpdateService, EnvironmentService],
      multi: true
    },
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
  constructor(
    private httpService: HttpService,
  ) {
    this.httpService.withCredentials = false;

    console.log("🌱", environment)
  }
}
