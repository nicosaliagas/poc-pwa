import { Injectable } from '@angular/core';
import { HelperService } from 'cocori-ng/src/feature-core';
import { liveQuery } from 'dexie';
import { forkJoin, from, map, Observable, switchMap } from 'rxjs';
import { db, ISynchroRecordType, TodoItem, TodoList } from 'src/services/db';

@Injectable({
    providedIn: 'root'
})
export class CrudDbService {

    constructor(private helperService: HelperService) {
    }

    public getRecords(): Observable<TodoList[]> {
        return from(liveQuery(() => db.todoLists.toArray())).pipe(
            map((lists: TodoList[]) => lists.map((list: TodoList) => {
                const listeName: string = list.title

                return db.todoItems.where({
                    todoListId: list.id,
                }).toArray().then((todoItems: TodoItem[]) => {
                    return { id: list.id, title: listeName, todoItems: todoItems }
                })
            })),
            switchMap(newListsObservables => {
                return forkJoin(newListsObservables)
            }),
        )
    }

    public getItemsFromOneList(listId: any): Observable<TodoItem[]> {
        return from(liveQuery(() => db.todoItems.where({
            todoListId: listId,
        }).toArray()))
    }

    public addListAncien(listName: string): Observable<any> {
        return from(db.todoLists.add({
            id: listName,
            title: listName,
            recordType: ISynchroRecordType.ADD,
        }))
    }

    public addListItemAncien(listId: any, itemName: string): Observable<any> {
        return from(db.todoItems.add({
            id: this.helperService.generateGuid(),
            title: itemName,
            todoListId: listId,
            recordType: ISynchroRecordType.ADD,
        }))
    }

    async addList(item: TodoList): Promise<any> {
        return db.todoLists.add(item)
    }

    async addListItem(item: TodoItem): Promise<any> {
        return db.todoItems.add(item)
    }

    async resetDatabase(): Promise<any> {
        return db.resetDatabase()
    }
}