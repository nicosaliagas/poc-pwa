import Dexie, { Table } from 'dexie';

export enum ISynchroRecordType {
    ADD = 'add',
    DELETE = 'delete',
}

export interface Item {
    id?: number;
    name: string;
}

export interface TodoList {
    id: string;
    title: string;
    todoItems?: TodoItem[];
    recordType?: string;
}

export interface TodoItem {
    title: string;
    id: string;
    todoListId?: any;
    recordType?: string;
}

export interface Cacheable {
    key: string
    value: string;
}

export class AppDB extends Dexie {
    todoItems!: Table<TodoItem, number>;
    todoLists!: Table<TodoList, number>;
    cacheable!: Table<Cacheable, string>;

    constructor() {
        super('PwaDb');
        this.version(13).stores({
            todoLists: 'id, recordType',
            todoItems: 'id, todoListId, recordType',
            cacheable: 'key',
        });
        // this.on('populate', () => this.populate());
        this.on('populate', () => null );
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
        await db.transaction('rw', 'todoItems', 'todoLists', () => {
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
