import Dexie, { Table } from 'dexie';

import { Cacheable, DbItem, DbList, ListItems } from '../models/todos.model';

export class AppDB extends Dexie {
    itemFlag!: Table<DbItem, number>;
    listFlag!: Table<DbList, number>;
    cacheable!: Table<Cacheable, string>;
    lists!: Table<ListItems, string>;

    constructor() {
        super('PwaDb');
        this.version(17).stores({
            listFlag: 'id, recordType',
            itemFlag: 'id, listId, recordType, urlAPi, urlPage',
            cacheable: 'key',
            lists: 'id, name, sync',
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
            this.listFlag.clear();
            this.itemFlag.clear();
            this.cacheable.clear();
            // this.populate();
        });
    }

    async resetTableList() {
        await db.transaction('rw', 'todoLists', () => {
            this.listFlag.clear();
        });
    }

    async resetTableItems() {
        await db.transaction('rw', 'todoItems', () => {
            this.itemFlag.clear();
        });
    }
}

export const db = new AppDB();
