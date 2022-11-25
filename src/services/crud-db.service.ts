import { Injectable } from '@angular/core';
import { db, TodoItem, TodoList } from 'src/services/db';

@Injectable({
    providedIn: 'root'
})
export class CrudDbService {
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