import { Injectable } from '@angular/core';
import { HelperService } from 'cocori-ng/src/feature-core';

import { Element, ListsItems } from '../models/todos.model';
import { CrudApiService } from './crud-api.service';
import { db, ISynchroRecordType, TodoItem, TodoList } from './db';

@Injectable()
export class SynchroService {

    constructor(
        private crudApiService: CrudApiService,
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
        const listsToAdd: TodoList[] = await db.todoLists.where({
            recordType: ISynchroRecordType.ADD,
        }).toArray()

        await Promise.all(listsToAdd.map(async (list: TodoList) => {
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
        const listsToAdd: TodoList[] = await db.todoLists.where({
            recordType: ISynchroRecordType.ADD,
        }).toArray()

        const itemsToAdd: TodoItem[] = await db.todoItems.where({
            recordType: ISynchroRecordType.ADD,
        }).toArray()

        const groupByListId: Object = itemsToAdd.reduce((r: any, a: TodoItem) => {
            r[a.todoListId] = r[a.todoListId] || [];
            r[a.todoListId].push(a);

            return r;
        }, Object.create(null));


        const itemsByListId: ListsItems[] = []

        Object.entries(groupByListId).forEach(([key, items]) => {
            const elements: Element[] = <Element[]>(<TodoItem[]>items).map(({ id, name }) => ({ id, name }))

            itemsByListId.push({ id: <string>key, name: '', items: elements })
        })

        console.log("listsToAdd >> ", listsToAdd)
        console.log("itemsByListId >> ", itemsByListId)

        await Promise.all(itemsByListId.map(async (listItems: ListsItems) => {

            const list: TodoList = <TodoList>listsToAdd.find((list: TodoList) => list.id === listItems.id)

            if (list) {
                await this.crudApiService.postListItems(listItems)
            } else {
                await Promise.all(listItems.items.map(async (item: Element) => {
                    await this.crudApiService.postItem(listItems.id, item.id, item.name)
                }));
            }
        }));

        console.log("🤬 lists>>>", this.crudApiService.lists)
        throw new Error("tamere000");

        // await Promise.all(itemsToAdd.map(async (item: TodoItem) => {
        //     await this.crudApiService.postItem(item.todoListId, item.id, item.name)
        // }));

    }
}