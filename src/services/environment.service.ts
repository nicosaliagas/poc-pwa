import { Injectable } from '@angular/core';

export interface IConfigEnvironment {
    production: boolean;
    CRUDCRUD_KEY: string;
    JSON_SERVER: string;
    INIT_DATASETS: boolean;
}

@Injectable({
    providedIn: 'root',
})
export class EnvironmentService {
    crudcrudKey: string;
    jsonServer: string;
    init_datasets: boolean;


    constructor() {
        this.crudcrudKey = ''
        this.jsonServer = ''
        this.init_datasets = false
    }

    set conf(data: IConfigEnvironment) {
        this.crudcrudKey = data.CRUDCRUD_KEY
        this.jsonServer = data.JSON_SERVER
        this.init_datasets = data.INIT_DATASETS
    }
}
