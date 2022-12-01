import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom, Observable } from 'rxjs';

import { ConnectionStatusService } from './connection-status.service';
import { Cacheable, db } from './db';

@Injectable({
    providedIn: 'root'
})
export class CacheableService {

    constructor(
        private httpClient: HttpClient,
        private connectionStatusService: ConnectionStatusService) { }

    async cacheDatas(key: string, values: any) {

        console.log("cacheable key >>> ", key)
        console.log("cacheable values >>> ", values)

        const cached: Cacheable[] = await db.cacheable.where({
            key: key,
        }).toArray()

        if (!cached.length) {
            await db.cacheable.add({
                key: key,
                value: JSON.stringify(values),
            })
        } else {
            await db.cacheable.update(key, {
                key: key,
                value: JSON.stringify(values),
            })
        }
    }

    async getApiCacheable<T>(fn: () => Observable<T>, key: string, defaultValue: T) {
        let result;

        const cached: Cacheable[] = await db.cacheable.where({
            key: key,
        }).toArray()

        try {
            // retrieve the data from backend.
            result = await firstValueFrom(fn());

            if (!cached.length) {
                await db.cacheable.add({
                    key: key,
                    value: JSON.stringify(result),
                })
            } else {
                await db.cacheable.update(key, {
                    key: key,
                    value: JSON.stringify(result),
                })
            }

            console.log("retrieve data from api")
        } catch {
            // use the cached data if available, otherwise the default value.
            result = cached.length === 1 ? JSON.parse(cached[0].value) : defaultValue;

            console.log("retrieve data from local")
        }

        return result;
    }
}