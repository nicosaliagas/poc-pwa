import { Injectable } from '@angular/core';

export interface IConfigEnvironment {
    production: boolean;
    CRUDCRUD_KEY: string;
    INIT_DATASETS: boolean;
}

@Injectable({
    providedIn: 'root',
})
export class EnvironmentService {
    crudcrudKey: string;
    init_datasets: boolean;


    constructor() {
        this.crudcrudKey = ''
        this.init_datasets = false
    }

    set conf(data: IConfigEnvironment) {
        this.crudcrudKey = data.CRUDCRUD_KEY
        this.init_datasets = data.INIT_DATASETS
    }
}
