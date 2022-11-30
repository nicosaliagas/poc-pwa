import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { HelperService, HttpService } from 'cocori-ng/src/feature-core';
import { firstValueFrom, map, Observable, of, Subject } from 'rxjs';

import { CacheableService } from './cacheable';
import { ConnectionStatusService, IConnectionStatusValue } from './connection-status.service';
import { CrudDbService } from './crud-db.service';
import { ISynchroRecordType, TodoItem, TodoList } from './db';
import { EnvironmentService } from './environment.service';

export interface NewTodo {
    todo: string;
    newtodo: string;
}

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

    private GetLists(): Observable<any> {
        return this.httpClient.get(`https://crudcrud.com/api/${this.environmentService.crudcrudKey}`, {});
    }

    private GetListDatas(listName: string): Observable<any> {
        return this.httpClient.get(`https://crudcrud.com/api/${this.environmentService.crudcrudKey}/${listName}`, {});
    }

    public GetListsItemsAPI(): Observable<any> {
        this.todoLists.splice(0, this.todoLists.length)

        return this.httpClient.get(`http://localhost:3000/list`, {})
        // return this.httpClient.get(`/assets/ressources/lists.json`, {})

        // return this.GetLists().pipe(
        //     mergeMap((lists: string[]) =>
        //         // `from` emits each contact separately
        //         from(lists).pipe(
        //             // load each contact
        //             mergeMap((list: string) => this.getListItems(list)),
        //             // collect all contacts into an array
        //             toArray(),
        //             // add the newly fetched data to original result
        //             map(todoLists => ({ ...this.todoLists, todoLists })),
        //         ))
        // )
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

                this.todoLists.push(<TodoList>{ id: listId, name: listId, items: [] })

                await this.cacheableService.cacheDatas(key, this.todoLists)

                await this.crudDbService.addList({ id: listId, name: listId, recordType: ISynchroRecordType.ADD })
            }
        }
    }

    async postItem(listId: string, itemTitle: string) {
        let datas!: TodoItem

        datas = { id: this.helperService.generateGuid(), name: itemTitle, todoListId: listId }

        try {
            // await firstValueFrom(<any>this.httpService.post(`https://crudcrud.com/api/${this.environmentService.crudcrudKey}/${listId}`, datas, SkipHeaders.TRUE));
            await firstValueFrom(<any>this.httpClient.post(`https://crudcrud.com/api/${this.environmentService.crudcrudKey}/${listId}`, datas));
        } catch {
            if (this.connectionStatusService.networkStatus === IConnectionStatusValue.OFFLINE) {
                const key = 'listsItems'
                const list: TodoList = <TodoList>this.todoLists.find((list: TodoList) => list.id === listId)

                list.items?.push(datas)

                await this.cacheableService.cacheDatas(key, this.todoLists)

                await this.crudDbService.addListItem({ ...datas, recordType: ISynchroRecordType.ADD })
            }
        }
    }

    DeleteListRessource(listName: string): Observable<any> {
        return this.httpClient.delete(`https://crudcrud.com/api/${this.environmentService.crudcrudKey}/${listName}`, {});
    }

    BadFakeRequest(): Observable<any> {
        return <any>this.httpClient.post(`https://crudcrud.com/api/XXXXXXXX`, {})
    }

    GetDefaultTodosList(): Observable<any> {
        const defaultTodos: any[] = [{
            "id": "c008eb2f-8286-4707-b42c-831b70bd8f70",
            "name": "Bread - Triangle White"
        }, {
            "id": "8e171150-549e-415e-b027-1ce8c7cbaa4e",
            "name": "Bread - Raisin Walnut Oval"
        }, {
            "id": "3e098f49-2623-4745-93a0-8a5e58c23532",
            "name": "Wanton Wrap"
        }, {
            "id": "fe5b8d0c-21ae-4461-a098-613d3dfc70b6",
            "name": "Chocolate - Liqueur Cups With Foil"
        }, {
            "id": "5575fa6e-5a5f-495c-8120-3ffc18442593",
            "name": "Truffle Cups Green"
        }]

        return of(defaultTodos);
    }
}