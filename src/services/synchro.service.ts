import { Injectable } from '@angular/core';
import { firstValueFrom, Subject } from 'rxjs';

import { DbItem, DbList, Element, ISynchroRecordType, ListItems } from '../models/todos.model';
import { CacheableService } from './cacheable';
import { CrudApiService } from './crud-api.service';
import { db } from './db';
import { DbService } from './db.service';

export const FAKE_ID: string = 'FAKE_ID'

@Injectable({
    providedIn: 'root',
})
export class SynchroService {
    public onSynchroErrors: Subject<number> = new Subject<number>();
    public itemsOnErrors: DbItem[] = []

    constructor(
        private crudApiService: CrudApiService,
        private crudDbService: DbService,
        private cacheableService: CacheableService) { }

    async checkForSync(): Promise<boolean> {
        const numberListToSync: number = await db.listFlag.toCollection().count()
        const numberItemsListToSync: number = await db.itemFlag.toCollection().count()

        return numberListToSync > 0 || numberItemsListToSync > 0
    }

    async syncServerToDB() {
        await this.crudDbService.resetListTable()

        const datasFromServer = await firstValueFrom(this.crudApiService.GetListsItemsAPI())

        await this.crudDbService.addListsDB(datasFromServer)
    }

    async syncListsWithServer() {
        const listsToAdd: DbList[] = await db.listFlag.where({
            recordType: ISynchroRecordType.ADD,
        }).toArray()

        await Promise.all(listsToAdd.map(async (list: DbList) => {
            await this.crudApiService.postList(list.id, list.name)
                .then(async () => {
                    await db.listFlag.where('id').equals(list.id).delete();
                })
                .catch(_ => { })
        }));
    }

    async syncItemsWithServer() {
        const listsToAdd: DbList[] = await db.listFlag.where({
            recordType: ISynchroRecordType.ADD,
        }).toArray()

        const itemsToAdd: DbItem[] = await db.itemFlag.where({
            recordType: ISynchroRecordType.ADD,
        }).toArray()

        /** on regroupe les items à synchroniser par id de liste */
        const itemsGroupedByListId: Object = itemsToAdd.reduce((r: any, a: DbItem) => {
            r[a.listId] = r[a.listId] || [];
            r[a.listId].push(a);

            return r;
        }, Object.create(null));

        const listsItemsToAdd: ListItems[] = []

        /** on converti le regroupement d'items en tableau d'objet list/items */
        Object.entries(itemsGroupedByListId).forEach(([key, items]) => {
            const elements: Element[] = <Element[]>(<DbItem[]>items).map(({ id, name }) => ({ id, name }))

            /** name à vide car pas dispo à cet étape */
            // listsItemsToAdd.push({ id: <string>key, name: '', items: elements })
        })

        /** on synchronise suivant si c'est une nouvelle liste ou seulement des ajouts d'item sur des listes existantes */
        await Promise.all(listsItemsToAdd.map(async (listItems: ListItems) => {
            const list: DbList = <DbList>listsToAdd.find((list: DbList) => list.id === listItems.id)

            if (list) {
                /** name à vide car pas dispo à cet instant */
                listItems.name = list.name

                await this.crudApiService.postListItems(listItems)
            } else {
                await Promise.all(listItems.items.map(async (item: Element) => {

                    /** on teste si l'id de l'item passé en paramêtre existe toujours en bdd */
                    if (!item.name) {
                        const defaultTodos: Element[] = await this.cacheableService.getCacheDatas('selectTodos', [])

                        const defaultTodoFound: number = defaultTodos.findIndex((todo: Element) => todo.id === item.id)

                        if (defaultTodoFound === -1) {
                            console.log(`💩 L'id ${item.id} n'existe pas !`)

                            // await this.crudApiService.postItem(listItems.id, item.id, item.name, true)
                            //     .then(_ => { console.log("succès") })
                            //     .catch(_ => { console.log("failure") })

                            console.log("Suite de la synchro .... 👌")
                            return;
                        }
                    }

                    await this.crudApiService.postItem(listItems.id, item.id, item.name)
                        .then(async () => await db.itemFlag.where('id').equals(item.id).delete())
                        .catch(_ => { })
                }));
            }
        }));
    }

    async addFakeItemSelect() {
        const defaultTodos: Element[] = await this.cacheableService.getCacheDatas('selectTodos', [])

        defaultTodos.push({ id: FAKE_ID, name: "élément supprimé" })

        await this.cacheableService.cacheDatas('selectTodos', defaultTodos)
    }

    async removeFakeItemSelect() {
        const defaultTodos: Element[] = await this.cacheableService.getCacheDatas('selectTodos', [])

        const defaultTodoFound: number = defaultTodos.findIndex((todo: Element) => todo.id === FAKE_ID)

        if (defaultTodoFound !== -1) {
            defaultTodos.splice(defaultTodoFound, 1);
        }

        await this.cacheableService.cacheDatas('selectTodos', defaultTodos)
    }


}