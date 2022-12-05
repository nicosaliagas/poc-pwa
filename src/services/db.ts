import Dexie, { Table } from 'dexie';

import { Cacheable, DbItem, DbList } from '../models/todos.model';

export class AppDB extends Dexie {
    todoItems!: Table<DbItem, number>;
    todoLists!: Table<DbList, number>;
    cacheable!: Table<Cacheable, string>;

    constructor() {
        super('PwaDb');
        this.version(13).stores({
            todoLists: 'id, recordType',
            todoItems: 'id, todoListId, recordType',
            cacheable: 'key',
        });
        // this.on('populate', () => this.populate());
        this.on('populate', () => null);
    }

    // async populate() {
    //     const todoListId = await db.todoLists.add({
    //         title: 'To Do Today',
    //     });
    //     await db.todoItems.bulkAdd([
    //         {
    //             todoListId,
    //             title: 'Feed the birds',
    //         },
    //         {
    //             todoListId,
    //             title: 'Watch a movie',
    //         },
    //         {
    //             todoListId,
    //             title: 'Have some sleep',
    //         },
    //     ]);
    // }

    async resetDatabase() {
        await db.transaction('rw', 'todoItems', 'todoLists', 'cacheable', () => {
            this.todoLists.clear();
            this.todoItems.clear();
            this.cacheable.clear();
            // this.populate();
        });
    }

    async resetTableList() {
        await db.transaction('rw', 'todoLists', () => {
            this.todoLists.clear();
        });
    }

    async resetTableItems() {
        await db.transaction('rw', 'todoItems', () => {
            this.todoItems.clear();
        });
    }
}

export const db = new AppDB();
