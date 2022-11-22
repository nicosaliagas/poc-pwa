import { Injectable } from '@angular/core';
import { BehaviorSubject, fromEvent, map, merge, of, Subscription } from 'rxjs';

export enum IConnectionStatusValue {
    ONLINE = 'online',
    OFFLINE = 'offline',
}

@Injectable({
    providedIn: 'root'
})
export class ConnectionStatusService {
    public onConnectionStatutUpdated: BehaviorSubject<IConnectionStatusValue> = new BehaviorSubject<IConnectionStatusValue>(IConnectionStatusValue.OFFLINE);
    public networkStatus!: IConnectionStatusValue;
    
    private networkStatus$: Subscription = Subscription.EMPTY;

    constructor() {
        this.CheckNetworkStatus()
    }

    private CheckNetworkStatus() {
        this.networkStatus$ = merge(
            of(null),
            fromEvent(window, 'online'),
            fromEvent(window, 'offline')
        )
            .pipe(map(() => navigator.onLine))
            .subscribe(status => {
                this.networkStatus = status ? IConnectionStatusValue.ONLINE : IConnectionStatusValue.OFFLINE

                this.onConnectionStatutUpdated.next(this.networkStatus)
            });
    }
}