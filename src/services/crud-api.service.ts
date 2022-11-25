import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { HelperService, HttpService } from 'cocori-ng/src/feature-core';
import { firstValueFrom, from, map, mergeMap, Observable, Subject, toArray } from 'rxjs';

import { CacheableService } from './cacheable';
import { ConnectionStatusService, IConnectionStatusValue } from './connection-status.service';
import { CrudDbService } from './crud-db.service';
import { ISynchroRecordType, TodoItem, TodoList } from './db';
import { EnvironmentService } from './environment.service';

@Injectable({
    providedIn: 'root'
})
export class CrudApiService {
    public onRefreshList: Subject<void> = new Subject<void>();
    public todoLists: TodoList[] = [];

    constructor(
        @Inject(HttpService) private httpService: HttpService,
        private httpClient: HttpClient,
        private helperService: HelperService,
        private cacheableService: CacheableService,
        private crudDbService: CrudDbService,
        private connectionStatusService: ConnectionStatusService,
        private environmentService: EnvironmentService,
    ) { }

    private GetListsItems(): Observable<any> {
        return this.httpClient.get(`https://crudcrud.com/api/${this.environmentService.crudcrudKey}`, {});
    }

    private GetListDatas(listName: string): Observable<any> {
        return this.httpClient.get(`https://crudcrud.com/api/${this.environmentService.crudcrudKey}/${listName}`, {});
    }

    public GetListsItemsAPI(): Observable<any> {
        this.todoLists.splice(0, this.todoLists.length)

        return this.GetListsItems().pipe(
            mergeMap((lists: string[]) =>
                // `from` emits each contact separately
                from(lists).pipe(
                    // load each contact
                    mergeMap((list: string) => this.getListItems(list)),
                    // collect all contacts into an array
                    toArray(),
                    // add the newly fetched data to original result
                    map(todoLists => ({ ...this.todoLists, todoLists })),
                ))
        )
    }

    private getListItems(listName: string) {
        return this.GetListDatas(listName).pipe(
            map(todoItems => ({ id: listName, title: listName, todoItems: todoItems }))
        )
    }

    async postList(listId: string) {
        try {
            await firstValueFrom(this.httpClient.post(`https://crudcrud.com/api/${this.environmentService.crudcrudKey}/${listId}`, {}));
        } catch {
            if (this.connectionStatusService.networkStatus === IConnectionStatusValue.OFFLINE) {
                const key = 'listsItems'

                this.todoLists.push(<TodoList>{ id: listId, title: listId, todoItems: [] })

                await this.cacheableService.cacheDatas(key, this.todoLists)

                await this.crudDbService.addList({ id: listId, title: listId, recordType: ISynchroRecordType.ADD })
            }
        }
    }

    async postItem(listId: string, itemTitle: string) {
        let datas!: TodoItem

        datas = { id: this.helperService.generateGuid(), title: itemTitle, todoListId: listId }

        try {
            // await firstValueFrom(<any>this.httpService.post(`https://crudcrud.com/api/${this.environmentService.crudcrudKey}/${listId}`, datas, SkipHeaders.TRUE));
            await firstValueFrom(<any>this.httpClient.post(`https://crudcrud.com/api/${this.environmentService.crudcrudKey}/${listId}`, datas));
        } catch {
            if (this.connectionStatusService.networkStatus === IConnectionStatusValue.OFFLINE) {
                const key = 'listsItems'
                const list: TodoList = <TodoList>this.todoLists.find((list: TodoList) => list.id === listId)

                list.todoItems?.push(datas)

                await this.cacheableService.cacheDatas(key, this.todoLists)

                await this.crudDbService.addListItem({ ...datas, recordType: ISynchroRecordType.ADD })
            }
        }
    }

    DeleteListRessource(listName: string): Observable<any> {
        return this.httpClient.delete(`https://crudcrud.com/api/${this.environmentService.crudcrudKey}/${listName}`, {});
    }
}