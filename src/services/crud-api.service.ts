import { Inject, Injectable } from '@angular/core';
import { HttpService, SkipHeaders } from 'cocori-ng/src/feature-core';
import { Observable, of, Subject, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { ConnectionStatusService, IConnectionStatusValue } from './connection-status.service';
import { CrudDbService } from './crud-db.service';
import { TodoItem } from './db';
import { EnvironmentService } from './environment.service';

@Injectable({
    providedIn: 'root'
})
export class CrudApiService {
    public onCompteUpdated: Subject<boolean> = new Subject<boolean>();

    constructor(
        @Inject(HttpService) private httpService: HttpService,
        private crudDbService: CrudDbService,
        private connectionStatusService: ConnectionStatusService,
        private environmentService: EnvironmentService,
    ) { }

    GetCrucrudInfos(listName: string): Observable<any> {
        return <any>this.httpService.get(`https://crudcrud.com/api/${this.environmentService.crudcrudKey}/${listName}`, {}, SkipHeaders.TRUE);
    }

    NewListRessouce(listName: string, itemTitle?: string, listId?: number) {
        let datas!: TodoItem

        if (listName && itemTitle) {
            datas = { title: itemTitle }
        }

        var subject = new Subject<any>();

        (<any>this.httpService.post(`https://crudcrud.com/api/${this.environmentService.crudcrudKey}/${listName}`, datas, SkipHeaders.TRUE)).pipe(
            catchError(err => {
                if (this.connectionStatusService.networkStatus === IConnectionStatusValue.OFFLINE) {

                    /** + rajouter l'élément dans la table cacheable ce qui permet de rafraichir la liste */

                    if (listName && !itemTitle) {
                        this.crudDbService.addList(listName)
                    } else {
                        this.crudDbService.addListItem(listId, <string>itemTitle)
                    }
                    return of(true)
                } else {
                    return throwError(() => err.error)
                }
            }),
        ).subscribe((datas: any) => subject.next(datas))

        return subject.asObservable();
    }

    DeleteListRessource(listName: string): Observable<any> {
        return <any>this.httpService.delete(`https://crudcrud.com/api/${this.environmentService.crudcrudKey}/${listName}`, {}, SkipHeaders.TRUE);
    }
}