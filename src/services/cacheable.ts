import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom, Observable } from 'rxjs';

import { Cacheable } from '../models/todos.model';
import { ConnectionStatusService, IConnectionStatusValue } from './connection-status.service';
import { db } from './db';

@Injectable({
    providedIn: 'root'
})
export class CacheableService {

    constructor(
        private httpClient: HttpClient,
        private connectionStatusService: ConnectionStatusService) { }

    async getCacheDatas(key: string, defaultValue: any) {
        const cached: Cacheable[] = await db.cacheable.where({
            key: key,
        }).toArray()

        return cached.length === 1 ? JSON.parse(cached[0].value) : defaultValue;
    }

    async cacheDatas(key: string, values: any) {
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

        if (this.connectionStatusService.networkStatus === IConnectionStatusValue.ONLINE) {
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
        } else {
            // use the cached data if available, otherwise the default value.
            result = cached.length === 1 ? JSON.parse(cached[0].value) : defaultValue;
        }

        return result;
    }
}