import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';

import { DbItem, FlagErrors, PreviewDatasToSync as PreviewSync } from '../../../models/todos.model';
import { ConnectionStatusService, IConnectionStatusValue } from '../../../services/connection-status.service';
import { SynchroService } from '../../../services/synchro.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'page-synchro',
  templateUrl: './synchro.component.html',
  styleUrls: ['./synchro.component.scss'],
})
export class SynchroComponent implements OnInit {
  public itemsOnErrors: DbItem[] = []
  public notificationInfoMessage!: string
  public flagErrors: FlagErrors[] = [];
  public synchoRunning: boolean = false
  public onlinemode: boolean = false;
  public previewSync: PreviewSync[] = []
  public datasPreviewRow!: PreviewSync;

  constructor(
    private synchroService: SynchroService,
    private connectionStatusService: ConnectionStatusService,
    private cdr: ChangeDetectorRef,
  ) { }

  async ngOnInit() {

    this.connectionStatusService.onConnectionStatutUpdated.subscribe((data: IConnectionStatusValue) => {
      this.onlinemode = data === IConnectionStatusValue.ONLINE

      this.cdr.detectChanges()
    })

    this.onlinemode = this.connectionStatusService.networkStatus === IConnectionStatusValue.ONLINE

    this.cdr.detectChanges()

    await this.getPreviewSync()

    await this.getFlagsOnErrors()
  }

  private async getFlagsOnErrors() {
    if (await this.synchroService.checkErrorsSync()) {
      this.flagErrors = await this.synchroService.getErrorsFromFlags()

      this.cdr.detectChanges()
    }
  }

  private async getPreviewSync() {
    this.previewSync = await this.synchroService.getPreviewSync()

    this.cdr.detectChanges()
    
    console.log("getListFlagsBeforeSync >> ", this.previewSync)
  }
  
  public selectRow(datasRow: PreviewSync) {
    console.log("datasRow >> ", datasRow)
    this.datasPreviewRow = datasRow
    
    this.cdr.detectChanges()
  }

  identify(index: number, flagErrors: FlagErrors) {
    return `${flagErrors.flag.id}`;
  }

  trackPreview(index: number, previewSync: PreviewSync) {
    return index;
  }

  trackPreviewItems(index: number, previewSync: PreviewSync) {
    return index;
  }

  public async synchronize() {
    let anythingToSync: boolean = await this.synchroService.checkForSync()

    if (anythingToSync) {
      this.notificationInfoMessage =
        `<strong>Synchronisation en cours !</strong> Les données de l'application se mettent à jour avec le serveur.`

      this.synchoRunning = true

      this.cdr.detectChanges()

      await this.synchroService.syncFlagsToServer()

      await this.sleep(2000)

      this.synchoRunning = false

      this.cdr.detectChanges()
    }
  }

  private sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
