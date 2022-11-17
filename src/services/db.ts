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
    id?: number;
    title: string;
    todoItems?: TodoItem[];
    recordType?: string;
}

export interface TodoItem {
    title: string;
    id?: number;
    todoListId?: any;
    recordType?: string;
}

export class AppDB extends Dexie {
    todoItems!: Table<TodoItem, number>;
    todoLists!: Table<TodoList, number>;

    constructor() {
        super('PwaDb');
        this.version(9).stores({
            todoLists: '++id, recordType',
            todoItems: '++id, todoListId, recordType',
        });
        // this.on('populate', () => this.populate());
        this.on('populate', () => null );
    }

    async populate() {
        const todoListId = await db.todoLists.add({
            title: 'To Do Today',
        });
        await db.todoItems.bulkAdd([
            {
                todoListId,
                title: 'Feed the birds',
            },
            {
                todoListId,
                title: 'Watch a movie',
            },
            {
                todoListId,
                title: 'Have some sleep',
            },
        ]);
    }

    async resetDatabase() {
        await db.transaction('rw', 'todoItems', 'todoLists', () => {
            this.todoItems.clear();
            this.todoLists.clear();
            // this.populate();
        });
    }
}

export const db = new AppDB();