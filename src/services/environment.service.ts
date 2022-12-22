import { Injectable } from '@angular/core';

import { linkTableUrl } from '../models/todos.model';

export interface IConfigEnvironment {
    production: boolean;
    JSON_SERVER: string;
    LINKS_TABLES_URLS: linkTableUrl[];
}

@Injectable({
    providedIn: 'root',
})
export class EnvironmentService {
    jsonServer: string;
    linksTablesUrls: linkTableUrl[];


    constructor() {
        this.jsonServer = ''
        this.linksTablesUrls = []
    }

    set conf(data: IConfigEnvironment) {
        this.jsonServer = data.JSON_SERVER
        this.linksTablesUrls = data.LINKS_TABLES_URLS
    }
}
