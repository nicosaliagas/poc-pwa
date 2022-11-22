import { Inject, Injectable } from '@angular/core';
import { HttpService, SkipHeaders } from 'cocori-ng/src/feature-core';
import { catchError, forkJoin, Observable, Subject, throwError } from 'rxjs';

import { EnvironmentService } from './environment.service';

@Injectable({
    providedIn: 'root'
})
export class DatasetsService {
    private listCountries: string = "countries"
    private listCountriesTwo: string = "countries2"

    constructor(
        @Inject(HttpService) private httpService: HttpService,
        private environmentService: EnvironmentService,
    ) { }

    InitListCountries(): Observable<any> {
        console.log("💪 InitListCountry")

        const listCountryApis: Observable<any>[] = []

        const listCountryDatas = [{
            "name": "China"
        }, {
            "name": "Albania"
        }, {
            "name": "Thailand"
        }, {
            "name": "France"
        }, {
            "name": "Ireland"
        }, {
            "name": "Syria"
        }, {
            "name": "Indonesia"
        }, {
            "name": "Brazil"
        }, {
            "name": "Peru"
        }, {
            "name": "Brazil"
        }]

        listCountryDatas.forEach((data) => {
            listCountryApis.push(
                <any>this.httpService.post(`https://crudcrud.com/api/${this.environmentService.crudcrudKey}/${this.listCountries}`, { "name": data.name }, SkipHeaders.TRUE)
            )
        })

        return forkJoin(listCountryApis)
    }

    GetListCountries(): Observable<any> {
        return <any>this.httpService.get(`https://crudcrud.com/api/${this.environmentService.crudcrudKey}/${this.listCountries}`, {}, SkipHeaders.TRUE);
    }

    GetListCountriesTwo(): Observable<any> {
        return <any>this.httpService.get(`https://crudcrud.com/api/${this.environmentService.crudcrudKey}/${this.listCountriesTwo}`, {}, SkipHeaders.TRUE);
    }

    PostCountry(name: string): Observable<any> {
        // return <any>this.httpService.post(`https://crudcrud.com/api/${this.environmentService.crudcrudKey}/${this.listCountries}`, { "name": name }, SkipHeaders.TRUE);
        var subject = new Subject<any>();

        (<any>this.httpService.post(`https://crudcrud.com/api/${this.environmentService.crudcrudKey}/${this.listCountries}`, { "name": name }, SkipHeaders.TRUE)).pipe(
            catchError(err => {
                console.log("🤮🤮🤮 datas >>", { "name": name })

                return throwError(() => err.error)
            }),
        ).subscribe((datas: any) => subject.next(datas))

        return subject.asObservable();
    }

    PostCountryTwo(name: string): Observable<any> {
        return <any>this.httpService.post(`https://crudcrud.com/api/${this.environmentService.crudcrudKey}/${this.listCountriesTwo}`, { "name": name }, SkipHeaders.TRUE);
        // return <any>this.httpService.post(`https://crudcrud.com/api/${this.environmentService.crudcrudKey}/${this.listCountries}?ngsw-bypass`, { "name": name }, SkipHeaders.TRUE);
    }
}