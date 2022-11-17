import { Injectable } from '@angular/core';
import { loadSettings } from 'src/environments/loadSettings';

import { EnvironmentService, IConfigEnvironment } from './environment.service';

@Injectable({
  providedIn: 'root'
})
export class EnvironmentLoaderService {
  constructor(
    private environmentService: EnvironmentService
  ) {
    
  }

  loadAppSettings(): Promise<any> {
    return loadSettings().then((config: IConfigEnvironment) => {
      return this.environmentService.conf = config
    })
  }
}
