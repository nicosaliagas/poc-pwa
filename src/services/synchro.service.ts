import { Injectable } from '@angular/core';
import { HelperService } from 'cocori-ng/src/feature-core';

import { CrudApiService } from './crud-api.service';
import { db, ISynchroRecordType, TodoList } from './db';

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
            await this.crudApiService.postList(list.name)

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
        const listItemsToAdd: TodoList[] = await db.todoItems.where({
            recordType: ISynchroRecordType.ADD,
        }).toArray()

        // await Promise.all(listItemsToAdd.map(async (item: TodoItem) => {
        //     await this.crudApiService.postItem(item.todoListId, item.name)
        // }));
    }
}