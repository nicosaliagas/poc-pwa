import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { Flag, RegulFlagTable, StatusSync } from '../models/todos.model';
import { ApiService } from './api.service';
import { ConnectionStatusService, IConnectionStatusValue } from './connection-status.service';
import { db } from './db';
import { DbService } from './db.service';
import { EnvironmentService } from './environment.service';

@Injectable({
    providedIn: 'root'
})
export class ReguleAppService {
    constructor(
        private apiService: ApiService,
        private dbService: DbService,
        private connectionStatusService: ConnectionStatusService,
        private environmentService: EnvironmentService,
    ) { }

    public async init() {
        /** Régul sur la table flags */
        if (this.connectionStatusService.networkStatus === IConnectionStatusValue.ONLINE) {
            const regulDatas: RegulFlagTable[] = <RegulFlagTable[]>await firstValueFrom(this.apiService.GetRegulAPI())
    
            await Promise.all(regulDatas.map(async (regul: RegulFlagTable) => {
                const flag: Flag = <Flag>await db.flags.where('table').equals(regul.old).first()
    
                if (flag) {
                    flag.table = regul.new
                    flag.status = StatusSync.NOT_SYNC
    
                    this.dbService.putFlagsDB(flag)
                }
            }))
    
            console.log("la régule de la table flags s'est bien déroulée...")
        }
    }
}