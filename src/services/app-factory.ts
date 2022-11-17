import { CheckForUpdateService } from './check-for-update.service';
import { EnvironmentLoaderService } from './environment-loader.service';
import { HandleUnrecoverableStateService } from './handle-unrecoverable-state.service';
import { PromptUpdateService } from './prompt-update.service';

export function LoadEnvironmentFactory(
    environmentLoader: EnvironmentLoaderService,
    promptUpdateService: PromptUpdateService,
    checkForUpdateService: CheckForUpdateService,
    handleUnrecoverableStateService: HandleUnrecoverableStateService,
) {
    return () => environmentLoader.loadAppSettings()
}