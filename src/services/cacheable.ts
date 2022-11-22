import { Injectable } from '@angular/core';
import { firstValueFrom, Observable } from 'rxjs';

import { Cacheable, db } from './db';

@Injectable({
    providedIn: 'root'
})
export class CacheableService {
    async cacheable<T>(fn: () => Observable<T>, key: string, defaultValue: T) {
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

            console.log("from api")
        } catch {
            // use the cached data if available, otherwise the default value.
            result = cached.length === 1 ? JSON.parse(cached[0].value) : defaultValue;

            console.log("from local")
        }

        return result;
    }
}