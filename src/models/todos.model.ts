export interface ListItems {
    id: string;
    name: string;
    items: Element[];
}

export interface Element {
    id: string;
    name: string;
}

export interface Flags extends FlagElement {
    items: FlagElement[];
}

export interface FlagElement {
    id: string;
    status: StatusSync
}

export enum StatusSync {
    ADD = 'add',
    MODIFY = 'modify',
    ERROR = 'error',
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