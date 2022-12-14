import Dexie, { Table } from 'dexie';

import { Cacheable, DbItem, DbList, Flags, ListItems } from '../models/todos.model';

export class AppDB extends Dexie {
    lists!: Table<ListItems, string>;
    flags!: Table<Flags, string>;
    
    itemFlag!: Table<DbItem, number>;
    listFlag!: Table<DbList, number>;
    cacheable!: Table<Cacheable, string>;

    constructor() {
        super('PwaDb');
        this.version(19).stores({
            lists: 'id, name',
            flags: 'id, status',
            // listFlag: 'id, recordType',
            // itemFlag: 'id, listId, recordType, urlAPi, urlPage',
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
            // this.listFlag.clear();
            // this.itemFlag.clear();
            this.lists.clear();
            this.flags.clear();
            this.cacheable.clear();
            // this.populate();
        });
    }
}

export const db = new AppDB();
