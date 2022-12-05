import { Injectable } from '@angular/core';

import { DbItem, DbList } from '../models/todos.model';
import { db } from './db';

@Injectable({
    providedIn: 'root'
})
export class CrudDbService {
    async addList(item: DbList): Promise<any> {
        return db.todoLists.add(item)
    }

    async addListItem(item: DbItem): Promise<any> {
        return db.todoItems.add(item)
    }

    async resetDatabase(): Promise<any> {
        return db.resetDatabase()
    }
}