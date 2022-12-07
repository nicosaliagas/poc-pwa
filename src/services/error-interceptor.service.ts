import { HttpErrorResponse, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { StacktraceModel } from 'cocori-ng/src/feature-core';
import { catchError, mergeMap, Observable, of, retryWhen, tap, throwError, timer } from 'rxjs';

import { DbItem, FakeHtppError, ISynchroRecordType } from '../models/todos.model';
import { ConnectionStatusService, IConnectionStatusValue } from './connection-status.service';
import { db } from './db';
import { RequestQueueService } from './request-queue.service';
import { SynchroService } from './synchro.service';

@Injectable({
  providedIn: 'root',
})
export class ErrorInterceptorService implements HttpInterceptor {
  next!: HttpHandler;
  request!: HttpRequest<any>;
  retryDelay = 2000;
  retryMaxAttempts = 0;
  statusForAttempts: number[] = [0, 500]


  private refreshTokenInProgress = false;

  constructor(
    private requestQueueService: RequestQueueService,
    private synchroService: SynchroService,
    private connectionStatusService: ConnectionStatusService) { }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<any> {
    this.next = next;
    this.request = request;

    const body: FakeHtppError = request.body

    return next.handle(request).pipe(
      this.retryAfterDelay(),
      catchError(
        this.handleError.bind(this)
      ))
  }

  retryAfterDelay(): any {
    return retryWhen(error => {
      return error.pipe(
        mergeMap((err, count) => {

          if (count === this.retryMaxAttempts) {
            return throwError(() => err);
          }
          return of(err).pipe(
            tap(error => {
              console.log(`L'appel à nos serveurs à généré une erreur : ${error.url} Tentative en cours n° ${count + 1}`);
            }),
            mergeMap((error: HttpErrorResponse) => this.statusForAttempts.includes(error.status) ? timer(this.retryDelay) : timer(0))
          );
        })
      );
    });
  }

  private async handleError(error: HttpErrorResponse | any) {
    const errorStacktrace: StacktraceModel = { httpError: error, dateError: new Date().toString() }

    console.log('errors', errorStacktrace)

    switch (error.status) {

      case 504:
        console.log("😱 504	Gateway Time-out	Temps d’attente d’une réponse d’un serveur à un serveur intermédiaire écoulé.")

        if (this.connectionStatusService.networkStatus === IConnectionStatusValue.OFFLINE && this.request.method !== 'GET') {
          this.requestQueueService.queueRequest(this.request)
        }

        break;

      case 404:
        /** on intercepte l'erreur lorsque l'appel qui synchronise la data plante */

        const urlFailedToCompare: string = this.request.urlWithParams.replace('xxx', '')
        let synchroErrorNum: number = 0

        console.log("😱😱😱 Erreur de synchro !!😱😱😱", this.request)

        console.log("📍 Url", this.request.urlWithParams)
        console.log("📍 Method", this.request.method)
        console.log("📍 Body", this.request.body)

        /** Vérifier s'il y a des éléments flagués  en attente */
        const itemsToAdd: DbItem[] = await db.todoItems.where({
          recordType: ISynchroRecordType.ADD,
        }).toArray()


        console.log("📍 Url (sans les 3x)", urlFailedToCompare)
        console.log("📍 Items waiting", itemsToAdd)

        let itemsOnErrors: DbItem[] = []

        itemsToAdd.forEach((item: DbItem) => {
          if (item.urlAPi === urlFailedToCompare) {
            console.log("biatch ! there is an error 🤡", item)

            itemsOnErrors.push(item)
            synchroErrorNum++
          }
        })

        setTimeout(() => {
          this.synchroService.itemsOnErrors = itemsOnErrors
          this.synchroService.onSynchroErrors.next(synchroErrorNum)
        }, 2000);

        break;

      case 417:
        if (error.error.datas && error.error.datas.length > 0) {
          const message417 = error.error.datas
            .map((err: any) => err.message)
            .join('\n - ');

          console.log(message417);
        } else {
          console.log(error.error.message);
        }
        break;

      default:
        console.log("Oops, erreur inattendue. Veuillez communiquer cette erreur à votre administrateur.", errorStacktrace)

        break;
    }

    console.error(
      `Backend returned code ${error.status}, ` + `body was:`,
      error.error
    );

    return throwError(() => error.error);
  }
}


// import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
// import { Injectable } from '@angular/core';
// import { Observable } from 'rxjs';

// @Injectable()
// export class ErrorInterceptorService implements HttpInterceptor {
//   intercept(httpRequest: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

//     console.log("STOOOOOOOOOOOOOOOOOOOOOOOOOOOP")

//     return next.handle(httpRequest);
//   }
// }

