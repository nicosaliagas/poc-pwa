import { EnvironmentLoaderService } from './environment-loader.service';
import { EnvironmentService } from './environment.service';
import { ReguleAppService } from './regule-app.service';

export function LoadEnvironmentFactory(
    environmentLoader: EnvironmentLoaderService,
    refactoUpdateService: ReguleAppService,
    environmentService: EnvironmentService,
) {
    // return () => environmentLoader.loadAppSettings()
    return () => environmentLoader.loadAppSettings().then(() => {
        return refactoUpdateService.init()

        // if (environmentService.init_datasets) {
        //     return firstValueFrom(datasetsService.InitListCountries())
        // } else {
        //     return true
        // }
    })
}