import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { HelperService, HttpService } from 'cocori-ng/src/feature-core';
import { firstValueFrom, lastValueFrom, Observable, Subject } from 'rxjs';

import { Element, Flag, ListItems, StatusSync, TypeSync } from '../models/todos.model';
import { CacheableService } from './cacheable';
import { ConnectionStatusService, IConnectionStatusValue } from './connection-status.service';
import { db } from './db';
import { DbService } from './db.service';
import { EnvironmentService } from './environment.service';

@Injectable({
    providedIn: 'root'
})
export class ApiService {
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

    public GetRegulAPI(): Observable<any> {
        return this.httpClient.get(`${this.environmentService.jsonServer}/regul`, {})
    }

    public GetListsItemsAPI(): Observable<any> {
        this.lists.splice(0, this.lists.length)

        return this.httpClient.get(`${this.environmentService.jsonServer}/lists`, {})
    }

    async postElement(tableDb: string, listId: string, listName: string, listItems: Element[] = []) {
        const newList: ListItems = <ListItems>{ id: listId, name: listName, items: listItems }

        if (this.connectionStatusService.networkStatus === IConnectionStatusValue.ONLINE) {
            await firstValueFrom(this.httpClient.post(`${this.environmentService.jsonServer}/${tableDb}`, newList));
        } else {
            await this.dbService.addElementDB(tableDb, <ListItems>{ id: newList.id, name: newList.name, items: [] })
            await this.dbService.addFlagsDB(<Flag>{ id: newList.id, status: StatusSync.NOT_SYNC, type: TypeSync.ADD, table: tableDb })
        }
    }

    async putElement(tableDb: string, datas: any) {
        return await lastValueFrom(this.httpClient.put(`${this.environmentService.jsonServer}/${tableDb}/${datas.id}`, datas));
    }

    async postItemList(tableDb: string, listId: string, itemId: string, itemTitle: string) {
        let newItem: Element = { id: itemId, name: itemTitle }

        const listOfTheNewItem: ListItems = <ListItems>await db.table(tableDb).where('id').equals(listId).first()

        const apiUrl: string = `${this.environmentService.jsonServer}/${tableDb}/${listId}`
        // const urlPage: string = HelperService.enleverNomDomaineUrl(window.location.href)

        if (!listOfTheNewItem) throw 'error: liste introuvable pour ajouter l\'item';

        /**on va vérifier que si l'id de l'item à ajouter est déjà présent ou pas 
         * S'il est présent : c'est que l'item a été ajouté en offline
        */
        const findItem: number = listOfTheNewItem.items.findIndex((item: Element) => item.id === itemId)

        if (findItem === -1) listOfTheNewItem.items.push(newItem)

        if (this.connectionStatusService.networkStatus === IConnectionStatusValue.ONLINE) {
            await firstValueFrom(<any>this.httpClient.put(`${apiUrl}`, listOfTheNewItem));
        } else {
            await this.dbService.putElementDB(tableDb, <ListItems>listOfTheNewItem)

            const listFlagged: Flag = <Flag>await db.flags.where('id').equals(listId).first()

            if (!listFlagged) {
                await this.dbService.addFlagsDB(<Flag>{
                    id: listId, status: StatusSync.NOT_SYNC, type: TypeSync.MODIFY, table: tableDb
                })
            }
        }
    }

    async postListItems(list: ListItems) {
        await firstValueFrom(<any>this.httpClient.put(`${this.environmentService.jsonServer}/lists/${list.id}`, list));
    }

    public GetSelectTodos(): Observable<any> {
        return this.httpClient.get(`${this.environmentService.jsonServer}/selectTodos`, {})
    }
}