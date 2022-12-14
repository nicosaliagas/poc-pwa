import { Injectable } from '@angular/core';

import { Flags, ListItems } from '../models/todos.model';
import { db } from './db';

@Injectable({
    providedIn: 'root'
})
export class DbService {
    async addListDB(list: ListItems): Promise<any> {
        return db.lists.add(list)
    }
    
    async putListItem(list: ListItems): Promise<any> {
        return db.lists.put(list)
    }
    
    async addFlags(list: Flags): Promise<any> {
        return db.flags.add(list)
    }

    async putFlags(list: Flags): Promise<any> {
        return db.flags.put(list)
    }

    /** doc : https://dexie.org/docs/Table/Table.bulkAdd() */
    async addListsDB(lists: ListItems[]): Promise<any> {
        return db.lists.bulkAdd(lists)
    }

    async resetDatabase(): Promise<any> {
        return db.resetDatabase()
    }

    async resetListTable(): Promise<any> {
        return db.lists.clear()
    }

    async paginateListsDB(skip: number, take: number) {
        let req = db.lists.orderBy('name')

        if (skip !== -1) req = req.offset(skip)
        if (take !== -1) req = req.limit(take)

        return req.toArray()
    }

}