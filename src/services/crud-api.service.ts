import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { HelperService, HttpService } from 'cocori-ng/src/feature-core';
import { firstValueFrom, Observable, Subject } from 'rxjs';

import { Element, Flags, ListItems, StatusSync } from '../models/todos.model';
import { CacheableService } from './cacheable';
import { ConnectionStatusService, IConnectionStatusValue } from './connection-status.service';
import { db } from './db';
import { DbService } from './db.service';
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
        private dbService: DbService,
        private connectionStatusService: ConnectionStatusService,
        private environmentService: EnvironmentService,
    ) { }

    public GetListsItemsAPI(): Observable<any> {
        this.lists.splice(0, this.lists.length)

        return this.httpClient.get(`${this.environmentService.jsonServer}/list`, {})
    }

    async postList(listId: string, listName: string, listItems: Element[] = []) {
        const newList: ListItems = <ListItems>{ id: listId, name: listName, items: listItems }

        if (this.connectionStatusService.networkStatus === IConnectionStatusValue.ONLINE) {
            await firstValueFrom(this.httpClient.post(`${this.environmentService.jsonServer}/list`, newList));
        } else {
            // this.lists.push(newList)
            // await this.cacheableService.cacheDatas('listsItems', this.lists)
            await this.dbService.addListDB(<ListItems>{ id: newList.id, name: newList.name, items: [] })
            await this.dbService.addFlags(<Flags>{ id: newList.id, items: [], status: StatusSync.ADD })
        }
    }

    async putList(list: ListItems) {
        await firstValueFrom(this.httpClient.put(`${this.environmentService.jsonServer}/list/${list.id}`, list));
    }

    async postItem(listId: string, itemId: string, itemTitle: string) {
        let newItem: Element = { id: itemId, name: itemTitle }

        // const list: ListItems = <ListItems>this.lists.find((list: Element) => list.id === listId)
        const listOfTheNewItem: ListItems = <ListItems>await db.lists.where('id').equals(listId).first()

        const apiUrl: string = `${this.environmentService.jsonServer}/list/${listId}`
        const urlPage: string = HelperService.enleverNomDomaineUrl(window.location.href)

        if (!listOfTheNewItem) throw 'error: liste introuvable pour ajouter l\'item';

        /**on va vérifier que si l'id de l'item à ajouter est déjà présent ou pas 
         * S'il est présent : c'est que l'item a été ajouté en offline
        */
        const findItem: number = listOfTheNewItem.items.findIndex((item: Element) => item.id === itemId)

        if (findItem === -1) listOfTheNewItem.items.push(newItem)

        if (this.connectionStatusService.networkStatus === IConnectionStatusValue.ONLINE) {
            await firstValueFrom(<any>this.httpClient.put(`${apiUrl}`, listOfTheNewItem));
        } else {
            // await this.cacheableService.cacheDatas('listsItems', this.lists)
            // await this.dbService.addListItem(<DbItem>{ ...datas, listId: listId, recordType: ISynchroRecordType.ADD, urlAPi: apiUrl, urlPage: urlPage })
            const item: Element = <Element>listOfTheNewItem.items.find((item: Element) => item.id === newItem.id)

            // item.sync = ISynchroRecordType.ADD
            // if (typeof listOfTheNewItem.sync === 'undefined') listOfTheNewItem.sync = ISynchroRecordType.PUT

            await this.dbService.putListItem(<ListItems>listOfTheNewItem)

            const listFlagged: Flags = <Flags>await db.flags.where('id').equals(listId).first()

            if (!listFlagged) {
                await this.dbService.addFlags(<Flags>{
                    id: listId, items: [
                        { id: newItem.id, status: StatusSync.ADD }
                    ],
                    status: StatusSync.MODIFY
                })
            } else {
                listFlagged.items.push({ id: newItem.id, status: StatusSync.ADD })

                await this.dbService.putFlags(listFlagged)
            }
        }
    }

    async postListItems(list: ListItems) {
        await firstValueFrom(<any>this.httpClient.put(`${this.environmentService.jsonServer}/list/${list.id}`, list));
    }

    public GetSelectTodos(): Observable<any> {
        return this.httpClient.get(`${this.environmentService.jsonServer}/selectTodos`, {})
    }
}