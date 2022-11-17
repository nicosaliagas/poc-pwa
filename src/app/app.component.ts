import { Component, OnDestroy, OnInit } from '@angular/core';

import { ConnectionStatusService, IConnectionStatusValue } from '../services/connection-status.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'poc-pwa';
  public classCss!: string

  constructor(private connectionStatusService: ConnectionStatusService) { }

  ngOnInit(): void {
    this.connectionStatusService.onConnectionStatutUpdated.subscribe((data: IConnectionStatusValue) => {
      this.classCss = data
    })
  } 

  ngOnDestroy(): void { }
}
