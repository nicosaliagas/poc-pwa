export interface ListsItems {
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