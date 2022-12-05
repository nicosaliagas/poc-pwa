import { Injectable } from '@angular/core';
import { HelperService } from 'cocori-ng/src/feature-core';

import { DbItem, DbList, Element, ISynchroRecordType, ListItems } from '../models/todos.model';
import { CacheableService } from './cacheable';
import { CrudApiService } from './crud-api.service';
import { db } from './db';

@Injectable()
export class SynchroService {

    constructor(
        private crudApiService: CrudApiService,
        private cacheableService: CacheableService,
        private helperService: HelperService) { }

    // async serverToIndexedDB(listsToAdd: TodoList[]): Promise<any> {
    //     await Promise.all(listsToAdd.map(async (list: TodoList) => {

    //         const idListAdded: number = await db.todoLists.add({
    //             id: this.helperService.generateGuid(),
    //             name: list.name,
    //         })

    //         if (list.items?.length) {
    //             await Promise.all(list.items.map(async (item: TodoItem) => {
    //                 if (item.name) {
    //                     await db.todoItems.add({
    //                         name: item.name,
    //                         id: this.helperService.generateGuid(),
    //                         todoListId: idListAdded,
    //                     })
    //                 } else {
    //                     await 1
    //                 }
    //             }))
    //         }
    //     }))
    // }

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

            // const listItemsToAdd: TodoList[] = await db.todoItems.where({
            //     todoListId: list.id,
            //     recordType: ISynchroRecordType.ADD,
            // }).toArray()

            // await Promise.all(listItemsToAdd.map(async (item: TodoItem) => {
            //     // await firstValueFrom(this.crudApiService.NewListRessouceX(listeName, item.title))
            //     await this.crudApiService.postItem(listeName, item.title)
            // }));
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

                            return;
                        }
                    }

                    await this.crudApiService.postItem(listItems.id, item.id, item.name).then(async () => {
                        await db.todoItems.where('id').equals(item.id).delete();
                    })
                }));
            }
        }));
    }
}