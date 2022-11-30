import { HttpClient, HttpEvent, HttpEventType, HttpHandler, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, firstValueFrom, Observable, ReplaySubject, switchMap, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RequestQueueService {
  public requestsToSync: HttpRequest<any>[] = []; // to store http requests
  private queue: ReplaySubject<any>[] = [];

  constructor(private httpClient: HttpClient,) { }

  /** tuto 1 : https://medium.com/cloud-solutions-international/how-to-group-http-requests-into-a-queue-with-angular-interceptor-9aedd5560697 */
  /** tuto 2 : https://stackoverflow.com/questions/48021728/add-queueing-to-angulars-httpclient/59188196#59188196 */

  queueRequest(request: HttpRequest<any>) {
    this.requestsToSync.push(request);
  }

  async executeQueuedRequests() {
    this.requestsToSync.forEach(async (request: HttpRequest<any>) => {
      console.log("next >")
      await firstValueFrom(this.httpClient.request(request))
      console.log("< next")
    })
  }

  queueRequestXX(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const requestQueueItem$ = new ReplaySubject<any>();
    const result$ = requestQueueItem$.pipe(
      switchMap(() => next.handle(request).pipe(
        tap(req => {
          if (req.type == HttpEventType.Response) {
            this.processNextRequest();
          }
        }),
        catchError(err => {
          this.processNextRequest();
          throw err;
        })
      ))
    );

    this.queue.push(requestQueueItem$);

    if (this.queue.length <= 1) {
      this.dispatchRequest();
    }

    console.log("📍queue ", this.queue)

    return result$;
  }

  private processNextRequest(): void {
    if (this.queue && this.queue.length > 0) {
      this.queue.shift();
    }
    this.dispatchRequest();
  }

  private dispatchRequest(): void {
    if (this.queue.length > 0) {
      const nextSub$: ReplaySubject<void> = this.queue[0];
      nextSub$.next();
      nextSub$.complete();
    }
  }
}