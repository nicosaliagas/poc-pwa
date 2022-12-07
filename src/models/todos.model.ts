export interface ListItems {
    id: string;
    name: string;
    items: Element[];
}

export interface Element {
    id: string;
    name: string;
}

export interface List extends Element { }
export interface Item extends Element { }

export enum ISynchroRecordType {
    ADD = 'add',
    DELETE = 'delete',
}

export interface DbList extends Element {
    recordType: string;
}

export interface DbItem extends Element {
    listId: string;
    recordType: string;
    urlAPi: string;
    urlPage: string;
}

export interface Cacheable {
    key: string
    value: string;
}

export interface AddTodoFrm {
    newTodoId: string;
    newTodoText: string;
}

export enum ISynchroHttpError {
    SYNC_ERROR = 417,
}

export interface FakeHtppError {
    payload: any;
    status: ISynchroHttpError;
}