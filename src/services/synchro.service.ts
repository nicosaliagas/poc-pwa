import { Injectable } from '@angular/core';
import { HelperService } from 'cocori-ng/src/feature-core';

import { CrudApiService } from './crud-api.service';
import { db, ISynchroRecordType, TodoItem, TodoList } from './db';

@Injectable()
export class SynchroService {

    constructor(
        private crudApiService: CrudApiService,
        private helperService: HelperService) { }

    async serverToIndexedDB(listsToAdd: TodoList[]): Promise<any> {
        await Promise.all(listsToAdd.map(async (list: TodoList) => {

            const idListAdded: number = await db.todoLists.add({
                id: this.helperService.generateGuid(),
                title: list.title,
            })

            if (list.todoItems?.length) {
                await Promise.all(list.todoItems.map(async (item: TodoItem) => {
                    if (item.title) {
                        await db.todoItems.add({
                            title: item.title,
                            id: this.helperService.generateGuid(),
                            todoListId: idListAdded,
                        })
                    } else {
                        await 1
                    }
                }))
            }
        }))
    }

    async indexedDBToServer() {
        const newId: string = this.helperService.generateGuid()

        const listsToAdd: TodoList[] = await db.todoLists.where({
            recordType: ISynchroRecordType.ADD,
        }).toArray()

        await Promise.all(listsToAdd.map(async (list: TodoList) => {
            const listeName: string = list.title

            // await firstValueFrom(this.crudApiService.NewListRessouceX(listeName))
            await this.crudApiService.NewListRessouceX(listeName)

            const listItemsToAdd: TodoList[] = await db.todoItems.where({
                todoListId: list.id,            
                recordType: ISynchroRecordType.ADD,
            }).toArray()

            await Promise.all(listItemsToAdd.map(async (item: TodoItem) => {
                // await firstValueFrom(this.crudApiService.NewListRessouceX(listeName, item.title))
                await this.crudApiService.NewListRessouceX(listeName, item.title)
            }));
        }));
    }
}