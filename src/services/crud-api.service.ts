import { Inject, Injectable } from '@angular/core';
import { HelperService, HttpService, SkipHeaders } from 'cocori-ng/src/feature-core';
import { firstValueFrom, from, map, mergeMap, Observable, Subject, toArray } from 'rxjs';

import { ConnectionStatusService, IConnectionStatusValue } from './connection-status.service';
import { CrudDbService } from './crud-db.service';
import { Cacheable, db, ISynchroRecordType, TodoItem, TodoList } from './db';
import { EnvironmentService } from './environment.service';

@Injectable({
    providedIn: 'root'
})
export class CrudApiService {
    public onRefreshList: Subject<void> = new Subject<void>();
    public todoLists: TodoList[] = [];

    constructor(
        @Inject(HttpService) private httpService: HttpService,
        private helperService: HelperService,
        private crudDbService: CrudDbService,
        private connectionStatusService: ConnectionStatusService,
        private environmentService: EnvironmentService,
    ) { }

    private GetListsItems(): Observable<any> {
        return <any>this.httpService.get(`https://crudcrud.com/api/${this.environmentService.crudcrudKey}`, {}, SkipHeaders.TRUE);
    }

    private GetListDatas(listName: string): Observable<any> {
        return <any>this.httpService.get(`https://crudcrud.com/api/${this.environmentService.crudcrudKey}/${listName}`, {}, SkipHeaders.TRUE);
    }

    public GetListsItemsAPI(): Observable<any> {
        this.todoLists.splice(0, this.todoLists.length)

        return this.GetListsItems().pipe(
            mergeMap((lists: string[]) =>
                // `from` emits each contact separately
                from(lists).pipe(
                    // load each contact
                    mergeMap((list: string) => this.getListItems(list)),
                    // collect all contacts into an array
                    toArray(),
                    // add the newly fetched data to original result
                    map(todoLists => ({ ...this.todoLists, todoLists })),
                ))
        )
    }

    private getListItems(listName: string) {
        return this.GetListDatas(listName).pipe(
            map(todoItems => ({ id: listName, title: listName, todoItems: todoItems }))
        )
    }

    async postList(listId: string) {
        const key = 'listsItems'

        const cached: Cacheable[] = await db.cacheable.where({
            key: key,
        }).toArray()

        try {
            // retrieve the data from backend.
            await firstValueFrom(<any>this.httpService.post(`https://crudcrud.com/api/${this.environmentService.crudcrudKey}/${listId}`, {}, SkipHeaders.TRUE));

            console.log("post api")
        } catch {
            if (this.connectionStatusService.networkStatus === IConnectionStatusValue.OFFLINE) {

                console.log("Post fail, je suis hors ligne")

                this.todoLists.push(<TodoList>{ id: listId, title: listId, todoItems: [] })

                console.log("toutes les listes >> ", this.todoLists)

                if (!cached.length) {
                    await db.cacheable.add({
                        key: key,
                        value: JSON.stringify({ todoLists: this.todoLists }),
                    })
                } else {
                    await db.cacheable.update(key, {
                        key: key,
                        value: JSON.stringify({ todoLists: this.todoLists }),
                    })
                }

                await this.crudDbService.addList({ id: listId, title: listId, recordType: ISynchroRecordType.ADD })
            }
        }
    }

    async postItem(listId: string, itemTitle: string) {
        let datas!: TodoItem
        const key = 'listsItems'

        datas = { id: this.helperService.generateGuid(), title: itemTitle, todoListId: listId }

        const cached: Cacheable[] = await db.cacheable.where({
            key: key,
        }).toArray()

        try {
            // retrieve the data from backend.
            await firstValueFrom(<any>this.httpService.post(`https://crudcrud.com/api/${this.environmentService.crudcrudKey}/${listId}`, datas, SkipHeaders.TRUE));

            console.log("post api")
        } catch {
            if (this.connectionStatusService.networkStatus === IConnectionStatusValue.OFFLINE) {

                console.log("Post fail, je suis hors ligne")

                console.log("todoLists >> ", listId, this.todoLists)

                const list: TodoList = <TodoList>this.todoLists.find((list: TodoList) => list.id === listId)

                if (list) {
                    list.todoItems?.push(datas)
                }

                console.log("list à jour >> ", list)
                console.log("toutes les listes >> ", this.todoLists)

                if (!cached.length) {
                    await db.cacheable.add({
                        key: key,
                        value: JSON.stringify({ todoLists: this.todoLists }),
                    })
                } else {
                    await db.cacheable.update(key, {
                        key: key,
                        value: JSON.stringify({ todoLists: this.todoLists }),
                    })
                }

                await this.crudDbService.addListItem({ ...datas, recordType: ISynchroRecordType.ADD })
            }
        }
    }

    // NewListRessouce(listName: string, itemTitle?: string, listId?: string) {
    //     let datas!: TodoItem

    //     if (listName && itemTitle) {
    //         datas = {
    //             title: itemTitle
    //         }
    //     }

    //     var subject = new Subject<any>();

    //     (<any>this.httpService.post(`https://crudcrud.com/api/${this.environmentService.crudcrudKey}/${listName}`, datas, SkipHeaders.TRUE)).pipe(
    //         catchError(err => {
    //             if (this.connectionStatusService.networkStatus === IConnectionStatusValue.OFFLINE) {

    //                 /** + rajouter l'élément dans la table cacheable ce qui permet de rafraichir la liste */

    //                 console.log("datas >> ", this.todoLists)

    //                 if (listName && !itemTitle) {
    //                     this.crudDbService.addList(listName)
    //                 } else {
    //                     this.crudDbService.addListItem(listId, <string>itemTitle)
    //                 }
    //                 return of(true)
    //             } else {
    //                 return throwError(() => err.error)
    //             }
    //         }),
    //     ).subscribe((datas: any) => subject.next(datas))

    //     return subject.asObservable();
    // }

    DeleteListRessource(listName: string): Observable<any> {
        return <any>this.httpService.delete(`https://crudcrud.com/api/${this.environmentService.crudcrudKey}/${listName}`, {}, SkipHeaders.TRUE);
    }
}