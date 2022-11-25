import { HttpClient } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { HttpService } from 'cocori-ng/src/feature-core';

import { ConnectionStatusService, IConnectionStatusValue } from '../services/connection-status.service';
import { CrudApiService } from '../services/crud-api.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'poc-pwa';
  public classCss!: string
  data: any = {};

  constructor(
    private httpService: HttpService,
    private crudApiService: CrudApiService,
    private httpClient: HttpClient,
    private connectionStatusService: ConnectionStatusService) { }

  ngOnInit(): void {
    this.connectionStatusService.onConnectionStatutUpdated.subscribe((data: IConnectionStatusValue) => {
      this.classCss = data
    })

    // this.httpClient.get('https://example.com/404').pipe(
    //   catchError(err => of('there was an error')) // return a Observable with a error message to display
    // ).subscribe(data => this.data = data);

    // this.httpClient.post('https://crudcrud.com/api/c3ec982f11884a4baeddd1b995a74aa8/TAMERE2', {}).pipe(
    //   catchError(err => of('there was an error')) // return a Observable with a error message to display
    // ).subscribe(data => this.data = data);
  }

  ngOnDestroy(): void { }
}
