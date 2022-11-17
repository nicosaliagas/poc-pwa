import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { CrudApiService } from './crud-api.service';
import { db, ISynchroRecordType, TodoItem, TodoList } from './db';

@Injectable()
export class SynchroService {

    constructor(private crudApiService: CrudApiService) { }

    // public serverToIndexedDB(lists: TodoList[]): Observable<any> {
    //     return from(lists).pipe(
    //         map((list: TodoList) => {
    //             return from(liveQuery(() => db.todoLists.add({
    //                 title: list.title,
    //             }))).pipe(
    //                 map((id: number) => list.todoItems?.map((item: TodoItem) => {
    //                     if (item.title) {
    //                         /** création des items pour chaque liste */
    //                         return from(liveQuery(() => db.todoItems.add({
    //                             title: item.title,
    //                             todoListId: id,
    //                         }))).subscribe()
    //                     } else {
    //                         return of(true)
    //                     }
    //                 }))
    //             )
    //         }),
    //         switchMap(newListsObservables => {
    //             return forkJoin(newListsObservables)
    //         }),
    //     )
    // }

    async serverToIndexedDB(listsToAdd: TodoList[]): Promise<any> {

        await Promise.all(listsToAdd.map(async (list: TodoList) => {

            const idListAdded: number = await db.todoLists.add({
                title: list.title,
            })

            console.log("id list juts added", idListAdded)
            
            if (list.todoItems?.length) {
                await Promise.all(list.todoItems.map(async (item: TodoItem) => {
                    if (item.title) {
                        
                        console.log("item just added", item.title)

                        await db.todoItems.add({
                            title: item.title,
                            todoListId: idListAdded,
                        })
                    } else {
                        await 1
                    }
                }))
            }
        }))

        // return from(listsToAdd).pipe(
        //     map((list: TodoList) => {
        //         return from(liveQuery(() => db.todoLists.add({
        //             title: list.title,
        //         }))).pipe(
        //             map((id: number) => list.todoItems?.map((item: TodoItem) => {
        //                 if (item.title) {
        //                     /** création des items pour chaque liste */
        //                     return from(liveQuery(() => db.todoItems.add({
        //                         title: item.title,
        //                         todoListId: id,
        //                     }))).subscribe()
        //                 } else {
        //                     return of(true)
        //                 }
        //             }))
        //         )
        //     }),
        //     switchMap(newListsObservables => {
        //         return forkJoin(newListsObservables)
        //     }),
        // )
    }

    // public serverToIndexedDBXX(lists: TodoList[]): Observable<any> {
    //     let createListPromises: Promise<TodoList>[] = []
    //     let createItemsPromises: Promise<any>[] = []

    //     /** construire un tableau de Promise avec l'id de la liste créé */
    //     lists.forEach((list: TodoList) => {
    //         console.log("try 1")
    //         createListPromises.push(db.todoLists.add({
    //             title: list.title,
    //         }).then((listId: number) => {

    //             list.id = listId

    //             return list
    //         }))
    //     })

    //     /** une fois que toutes les listes ont été crées, on s'occupe de créer pour chacune d'elle leurs items */
    //     return forkJoin(createListPromises).pipe(
    //         map((lists: TodoList[]) => {
    //             lists.forEach((list: TodoList) => {
    //                 list.todoItems?.forEach((item: TodoItem) => {
    //                     if (item.title) {
    //                         createItemsPromises.push(db.todoItems.add({
    //                             title: item.title,
    //                             todoListId: list.id,
    //                         }))
    //                     }
    //                 })
    //             })
    //         }),
    //         map(() => forkJoin(createItemsPromises))
    //     )
    // }

    async indexedDBToServer() {
        const listsToAdd: TodoList[] = await db.todoLists.where({
            recordType: ISynchroRecordType.ADD,
        }).toArray()

        console.log("lists to add ", listsToAdd)

        await Promise.all(listsToAdd.map(async (list: TodoList) => {
            const listeName: string = list.title

            await firstValueFrom(this.crudApiService.NewListRessouce(listeName))

            console.log(`list added ${list.title}`)

            const listItemsToAdd: TodoList[] = await db.todoItems.where({
                todoListId: list.id,
                recordType: ISynchroRecordType.ADD,
            }).toArray()

            console.log(`items for the list ${list.title}`, listItemsToAdd)

            await Promise.all(listItemsToAdd.map(async (item: TodoItem) => {
                console.log(`item added for the list ${list.title}`, item.title)
                await firstValueFrom(this.crudApiService.NewListRessouce(listeName, item.title))
            }));
        }));
    }

    // public indexedDBToServerXX(): Observable<any> {
    //     return from(liveQuery(() => db.todoLists.where({
    //         recordType: ISynchroRecordType.ADD,
    //     }).toArray())).pipe(
    //         /** création des listes */
    //         map((listsToAdd: TodoList[]) => listsToAdd.map((data: TodoList) => {
    //             const listeName: string = data.title

    //             return from(this.crudApiService.NewListRessouce(listeName).pipe(
    //                 map(() => {
    //                     return db.todoItems.where({
    //                         todoListId: data.id,
    //                         recordType: ISynchroRecordType.ADD,
    //                     }).toArray().then((itemsToAdd: TodoItem[]) => {
    //                         itemsToAdd.forEach((todoItem: TodoItem) => {
    //                             console.log("todoItem >> ", todoItem)
    //                             return this.crudApiService.NewListRessouce(listeName, todoItem.title).subscribe()
    //                         })
    //                     })
    //                 })
    //             ))
    //         })),
    //         switchMap(newListsObservables => {
    //             console.log("indexedDBToServer.newListsObservables", newListsObservables)
    //             if (newListsObservables.length) {
    //                 return forkJoin(newListsObservables)
    //             } else {
    //                 return of(true)
    //             }
    //         }),
    //     )
    // }
}