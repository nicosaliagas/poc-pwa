import { Inject, Injectable } from '@angular/core';
import { HttpService, SkipHeaders } from 'cocori-ng/src/feature-core';
import { Observable, Subject } from 'rxjs';

import { TodoItem } from './db';
import { EnvironmentService } from './environment.service';

@Injectable({
    providedIn: 'root'
})
export class CrudApiService {
    public onCompteUpdated: Subject<boolean> = new Subject<boolean>();

    constructor(
        @Inject(HttpService) private httpService: HttpService,
        private environmentService: EnvironmentService,
    ) { }

    GetCrucrudInfos(listName: string): Observable<any> {
        return <any>this.httpService.get(`https://crudcrud.com/api/${this.environmentService.crudcrudKey}/${listName}`, {}, SkipHeaders.TRUE);
    }

    NewListRessouce(listName: string, itemTitle?: string): Observable<any> {
        let datas!: TodoItem

        if (listName && itemTitle) {
            datas = {
                title: itemTitle,
            }
        }

        return <any>this.httpService.post(`https://crudcrud.com/api/${this.environmentService.crudcrudKey}/${listName}`, datas, SkipHeaders.TRUE);
    }

    DeleteListRessource(listName: string): Observable<any> {
        return <any>this.httpService.delete(`https://crudcrud.com/api/${this.environmentService.crudcrudKey}/${listName}`, {}, SkipHeaders.TRUE);
    }
}