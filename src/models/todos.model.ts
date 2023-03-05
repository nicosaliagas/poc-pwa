export interface ListItems {
    id: string;
    name: string;
    items: Element[];
}

export interface Element {
    id: string;
    name: string;
}

export interface Flag {
    id: string;
    type: TypeSync;
    status: StatusSync;
    table: string;
}

export interface Error {
    id: string;
    flagId: string;
    error: string;
    message: string;
    urlAPi: string | null;
}

export interface FlagErrors {
    flag: Flag;
    error: Error;
}

export enum TypeSync {
    ADD = 'add',
    MODIFY = 'modify',
}

export enum StatusSync {
    NOT_SYNC = 'not sync',
    ERROR = 'error',
}

export interface PreviewDatasToSync {
    flagType: string;
    datasToSync: any;
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

export interface RegulFlagTable {
    old: string;
    new: string;
}

export enum ISynchroHttpError {
    SYNC_ERROR = 417,
}

export interface FakeHtppError {
    payload: any;
    status: ISynchroHttpError;
}

export interface linkTableUrl {
    table: string;
    url: string;
}