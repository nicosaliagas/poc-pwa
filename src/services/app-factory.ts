import { firstValueFrom } from 'rxjs';

import { CheckForUpdateService } from './check-for-update.service';
import { DatasetsService } from './datasets.service';
import { EnvironmentLoaderService } from './environment-loader.service';
import { EnvironmentService } from './environment.service';
import { HandleUnrecoverableStateService } from './handle-unrecoverable-state.service';
import { PromptUpdateService } from './prompt-update.service';

export function LoadEnvironmentFactory(
    environmentLoader: EnvironmentLoaderService,
    promptUpdateService: PromptUpdateService,
    datasetsService: DatasetsService,
    checkForUpdateService: CheckForUpdateService,
    handleUnrecoverableStateService: HandleUnrecoverableStateService,
    environmentService: EnvironmentService,
) {
    // return () => environmentLoader.loadAppSettings()
    return () => environmentLoader.loadAppSettings().then(() => {
        if (environmentService.init_datasets) {
            return firstValueFrom(datasetsService.InitListCountries())
        } else {
            return true
        }
    })
}