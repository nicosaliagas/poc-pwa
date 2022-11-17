import { Injectable } from '@angular/core';

export interface IConfigEnvironment {
    production: boolean;
    CRUDCRUD_KEY: string;
}

@Injectable({
    providedIn: 'root',
})
export class EnvironmentService {
    crudcrudKey: string;
    

    constructor() {
        this.crudcrudKey = ''
    }

    set conf(data: IConfigEnvironment) {
        this.crudcrudKey = data.CRUDCRUD_KEY
    }
}
