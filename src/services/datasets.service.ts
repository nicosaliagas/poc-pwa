import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { HttpService } from 'cocori-ng/src/feature-core';
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
        private httpClient: HttpClient,
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
                this.httpClient.post(`https://crudcrud.com/api/${this.environmentService.crudcrudKey}/${this.listCountries}`, { "name": data.name })
            )
        })

        return forkJoin(listCountryApis)
    }

    GetListCountries(): Observable<any> {
        return this.httpClient.get(`https://crudcrud.com/api/${this.environmentService.crudcrudKey}/${this.listCountries}`, {});
    }

    GetListCountriesTwo(): Observable<any> {
        return this.httpClient.get(`https://crudcrud.com/api/${this.environmentService.crudcrudKey}/${this.listCountriesTwo}`, {});
    }

    PostCountry(name: string): Observable<any> {
        var subject = new Subject<any>();

        (this.httpClient.post(`https://crudcrud.com/api/${this.environmentService.crudcrudKey}/${this.listCountries}`, { "name": name })).pipe(
            catchError(err => {
                console.log("🤮🤮🤮 datas >>", { "name": name })

                return throwError(() => err.error)
            }),
        ).subscribe((datas: any) => subject.next(datas))

        return subject.asObservable();
    }

    PostCountryTwo(name: string): Observable<any> {
        return this.httpClient.post(`https://crudcrud.com/api/${this.environmentService.crudcrudKey}/${this.listCountriesTwo}`, { "name": name });
    }
}