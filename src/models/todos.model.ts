export interface ListItems {
    id: string;
    name: string;
    items: Element[];
    sync?: ISynchroRecordType
}

export interface Element {
    id: string;
    name: string;
    sync?: ISynchroRecordType
}

export interface List extends Element { }
export interface Item extends Element { }

export enum ISynchroRecordType {
    ADD = 'add',
    PUT = 'put',
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