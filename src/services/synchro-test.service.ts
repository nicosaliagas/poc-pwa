import { Injectable } from '@angular/core';

import { Flag, StatusSync } from '../models/todos.model';
import { ApiService } from './api.service';
import { CacheableService } from './cacheable';
import { db } from './db';
import { DbService } from './db.service';

export const FAKE_ID: string = 'FAKE_ID'

@Injectable({
    providedIn: 'root',
})
export class SynchroTestService {
    constructor(
        private crudApiService: ApiService,
        private dbService: DbService,
        private cacheableService: CacheableService) { }

    async addErrorSync(flagId?: string) {
        let flagsToSync: Flag;

        if (!flagId) {
            flagsToSync = <Flag>await db.flags.where('status').equals(StatusSync.NOT_SYNC).first()
        } else {
            flagsToSync = <Flag>await db.flags.where('id').equals(flagId).first()
        }

        flagsToSync.table = flagsToSync.table === '****' ? 'lists' : '****'

        await this.dbService.putFlagsDB(flagsToSync)
    }
}