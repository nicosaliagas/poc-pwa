import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { HelperService, HttpService } from 'cocori-ng/src/feature-core';
import { firstValueFrom, Observable, Subject } from 'rxjs';

import { DbItem, DbList, Element, ISynchroRecordType, ListItems } from '../models/todos.model';
import { CacheableService } from './cacheable';
import { ConnectionStatusService, IConnectionStatusValue } from './connection-status.service';
import { CrudDbService } from './crud-db.service';
import { EnvironmentService } from './environment.service';

@Injectable({
    providedIn: 'root'
})
export class CrudApiService {
    public onRefreshList: Subject<void> = new Subject<void>();
    public lists: ListItems[] = [];

    constructor(
        @Inject(HttpService) private httpService: HttpService,
        private httpClient: HttpClient,
        private helperService: HelperService,
        private cacheableService: CacheableService,
        private crudDbService: CrudDbService,
        private connectionStatusService: ConnectionStatusService,
        private environmentService: EnvironmentService,
    ) { }

    public GetListsItemsAPI(): Observable<any> {
        this.lists.splice(0, this.lists.length)

        return this.httpClient.get(`${this.environmentService.jsonServer}/list`, {})
    }

    async postList(listId: string, listName: string) {
        const newList: ListItems = <ListItems>{ id: listId, name: listName, items: [] }

        try {
            await firstValueFrom(this.httpClient.post(`${this.environmentService.jsonServer}/list`, newList));
        } catch {
            if (this.connectionStatusService.networkStatus === IConnectionStatusValue.OFFLINE) {
                this.lists.push(newList)

                await this.cacheableService.cacheDatas('listsItems', this.lists)

                await this.crudDbService.addList(<DbList>{ id: newList.id, name: newList.name, recordType: ISynchroRecordType.ADD })
            }

            throw 'error';
        }
    }

    async postItem(listId: string, itemId: string, itemTitle: string, flagErrorHttp: boolean = false) {
        let datas: Element = { id: itemId, name: itemTitle }

        const list: ListItems = <ListItems>this.lists.find((list: Element) => list.id === listId)
        const apiUrl: string = `${this.environmentService.jsonServer}/${flagErrorHttp ? 'listxxx' : 'list'}/${listId}`
        const urlPage: string = HelperService.enleverNomDomaineUrl(window.location.href)

        if (!list) {
            throw 'error: liste introuvable pour ajouter l\'item';
        }

        /**on va vérifier que si l'id de l'item à ajouter est déjà présent ou pas 
         * S'il est présent : c'est que l'item a été ajouté en offline
        */
        const findItem: number = list.items.findIndex((item: Element) => item.id === itemId)

        if (findItem === -1) {
            list.items.push(datas)
        }

        try {
            await firstValueFrom(<any>this.httpClient.put(`${apiUrl}`, list));
        } catch {
            if (this.connectionStatusService.networkStatus === IConnectionStatusValue.OFFLINE) {
                await this.cacheableService.cacheDatas('listsItems', this.lists)
                await this.crudDbService.addListItem(<DbItem>{ ...datas, listId: listId, recordType: ISynchroRecordType.ADD, urlAPi: apiUrl, urlPage: urlPage })
            }

            throw 'error';
        }
    }

    async postListItems(list: ListItems) {
        await firstValueFrom(<any>this.httpClient.put(`${this.environmentService.jsonServer}/list/${list.id}`, list));
    }

   public GetSelectTodos(): Observable<any> {
        return this.httpClient.get(`${this.environmentService.jsonServer}/selectTodos`, {})
    }
}