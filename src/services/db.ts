import Dexie, { Table } from 'dexie';

import { Cacheable, DbItem, DbList, Error, Flag, ListItems } from '../models/todos.model';

export class AppDB extends Dexie {
    lists!: Table<ListItems, string>;
    flags!: Table<Flag, string>;
    errors!: Table<Error, number>;
    
    itemFlag!: Table<DbItem, number>;
    listFlag!: Table<DbList, number>;
    cacheable!: Table<Cacheable, string>;

    constructor() {
        super('PwaDb');
        this.version(31).stores({
            lists: 'id, name',
            flags: 'id, type, status, table',
            errors: '++id, flagId',
            cacheable: 'key',
        });

        // this.on('populate', () => this.populate());
        // this.on('populate', () => null);
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
            this.lists.clear();
            this.flags.clear();
            this.cacheable.clear();
        });
    }
}

export const db = new AppDB();
