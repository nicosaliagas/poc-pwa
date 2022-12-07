import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

import { DbItem, DbList, Element, ISynchroRecordType, ListItems } from '../models/todos.model';
import { CacheableService } from './cacheable';
import { CrudApiService } from './crud-api.service';
import { db } from './db';

@Injectable({
    providedIn: 'root',
})
export class SynchroService {
    public onSynchroErrors: Subject<number> = new Subject<number>();
    public itemsOnErrors: DbItem[] = []

    constructor(
        private crudApiService: CrudApiService,
        private cacheableService: CacheableService) { }

    async checkForSync(): Promise<boolean> {
        const numberListToSync: number = await db.todoLists.toCollection().count()
        const numberItemsListToSync: number = await db.todoItems.toCollection().count()

        return numberListToSync > 0 || numberItemsListToSync > 0
    }

    async syncListsWithServer() {
        const listsToAdd: DbList[] = await db.todoLists.where({
            recordType: ISynchroRecordType.ADD,
        }).toArray()

        await Promise.all(listsToAdd.map(async (list: DbList) => {
            await this.crudApiService.postList(list.id, list.name)
                .then(async () => {
                    await db.todoLists.where('id').equals(list.id).delete();
                })
                .catch(_ => { })
        }));
    }

    async syncItemsWithServer() {
        const listsToAdd: DbList[] = await db.todoLists.where({
            recordType: ISynchroRecordType.ADD,
        }).toArray()

        const itemsToAdd: DbItem[] = await db.todoItems.where({
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
            listsItemsToAdd.push({ id: <string>key, name: '', items: elements })
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
                        const defaultTodos: Element[] = await this.cacheableService.getApiCacheable(() => this.crudApiService.GetSelectTodos(), 'selectTodos', [])

                        const defaultTodoFound: number = defaultTodos.findIndex((todo: Element) => todo.id === item.id)

                        if (defaultTodoFound === -1) {
                            console.log(`💩 L'id ${item.id} n'existe pas !`)

                            await this.crudApiService.postItem(listItems.id, item.id, item.name, true)
                                .then(_ => { console.log("succès") })
                                .catch(_ => { console.log("failure") })

                            console.log("Suite de la synchro .... 👌")
                            return;
                        }
                    }

                    await this.crudApiService.postItem(listItems.id, item.id, item.name)
                        .then(async () => await db.todoItems.where('id').equals(item.id).delete())
                        .catch(_ => { })
                }));
            }
        }));
    }
}