import { Injectable } from '@angular/core';

import { Error, Flag, ListItems } from '../models/todos.model';
import { db } from './db';

@Injectable({
    providedIn: 'root'
})
export class DbService {
    async addElementDB(table: string, datas: any): Promise<any> {
        return db.table(table).add(datas)
    }

    async putElementDB(table: string, datas: any): Promise<any> {
        return db.table(table).put(datas)
    }

    async addFlagsDB(datas: Flag): Promise<any> {
        return db.flags.add(datas)
    }

    async putFlagsDB(datas: Flag): Promise<any> {
        return db.flags.put(datas)
    }

    /** doc : https://dexie.org/docs/Table/Table.bulkAdd() */
    async addListsDB(lists: ListItems[]): Promise<any> {
        return db.lists.bulkAdd(lists)
    }

    async addErrorsDB(datas: Error[]): Promise<any> {
        return db.errors.bulkAdd(datas)
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