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

  async ngOnInit() {
    this.connectionStatusService.onConnectionStatutUpdated.subscribe((data: IConnectionStatusValue) => {
      this.classCss = data
    })
  }

  ngOnDestroy(): void { }
}
