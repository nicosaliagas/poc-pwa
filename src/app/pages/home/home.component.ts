import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HelperService, StringService } from 'cocori-ng/src/feature-core';
import { CrudApiService } from 'src/services/crud-api.service';

import { ListItems } from '../../../models/todos.model';
import { CacheableService } from '../../../services/cacheable';
import { ConnectionStatusService, IConnectionStatusValue } from '../../../services/connection-status.service';
import { CrudDbService } from '../../../services/crud-db.service';
import { RequestQueueService } from '../../../services/request-queue.service';
import { FAKE_ID, SynchroService } from '../../../services/synchro.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'page-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  listName = 'My new list';
  // todoLists: TodoList[] = [];
  connectionStatus!: IConnectionStatusValue;
  synchoRunning: boolean = false
  synchoFail: boolean = false
  paramsLoadSynchroFailed!: string
  notificationInfoMessage!: string

  constructor(
    private connectionStatusService: ConnectionStatusService,
    public requestQueueService: RequestQueueService,
    public crudApiService: CrudApiService,
    private cacheableService: CacheableService,
    private synchroService: SynchroService,
    private route: ActivatedRoute,
    private helperService: HelperService,
    private crudDbService: CrudDbService,
    private cdr: ChangeDetectorRef,) {
    this.route.queryParams.subscribe((params: any) => {
      this.paramsLoadSynchroFailed = params['load']
    })
  }

  ngOnInit(): void {
    this.connectionStatusService.onConnectionStatutUpdated.subscribe((data: IConnectionStatusValue) => {
      this.connectionStatus = data

      this.changeConnectionStatus()
    })

    this.crudApiService.onRefreshList.subscribe(() => {
      this.getListsDatas()
    })

    this.synchroService.onSynchroErrors.subscribe((itemsOnErrors: number) => {
      this.synchoFail = itemsOnErrors > 0
    })
  }

  /** Soumettre un post qui sera fail lors de la synchro */
  public async submitFailPost() {
    /** Liste existante mais item de liste todo inexistant en base */
    await this.crudApiService.postItem("83D00680-FCCB-4233-B723-9D87089EAFA3", FAKE_ID, '')

    console.log("🤡 callBadRequest ")
  }

  private async changeConnectionStatus() {
    /** la page est réinitialisée */
    this.crudApiService.lists.splice(0, this.crudApiService.lists.length)

    this.cdr.detectChanges()

    /** Pour les tests : on retire le fake item dans la liste déroulante */
    await this.synchroService.removeFakeItemSelect()

    if (this.connectionStatus === IConnectionStatusValue.ONLINE) {

      /** Méthode via élément taggué dans IndexedDb */
      const anythingToSync: boolean = await this.synchroService.checkForSync()

      if (anythingToSync) {
        /** il faut charger les infos mises en cache */
        this.crudApiService.lists = await this.cacheableService.getCacheDatas('listsItems', [])

        if (typeof this.paramsLoadSynchroFailed !== 'undefined') {
          this.notificationInfoMessage =
            `<strong>Synchronisation en erreur chargée !</strong>`

          /** Pour les tests : on ajoute l'item manquant dans la liste déroulante */
          await this.synchroService.addFakeItemSelect()
        } else {
          this.notificationInfoMessage =
            `<strong>Synchronisation en cours !</strong> Les données de l'application se mettent à jour avec le serveur.`

          await this.synchroIndexedDbToServer()
        }

        this.synchoRunning = true

        this.cdr.detectChanges()
      } else {
        /** on récupère la liste déroulante des todos par défaut et on la met en cache */
        await this.cacheableService.getApiCacheable(() => this.crudApiService.GetSelectTodos(), 'selectTodos', [])
      }

      await this.getListsDatas()

      if (this.synchoRunning) {
        await this.sleep(2000)

        this.synchoRunning = false
      }

      this.cdr.detectChanges()
    } else {
      this.getListsDatas()
    }
  }

  private sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  public async getListsDatas() {
    const datas = await this.cacheableService.getApiCacheable(() => this.crudApiService.GetListsItemsAPI(), 'listsItems', [])

    console.log("🔥todoLists from api/local >> ", datas)

    this.crudApiService.lists = datas

    this.cdr.detectChanges()
  }

  async addNewList() {
    this.listName = new StringService(this.listName)
      .removeAllSpaces()
      .removeAllSpecialsCharacters()
      .replaceAllAccentByNonAccentCharacters()
      .toString()

    await this.crudApiService.postList(this.helperService.generateGuid(), this.listName)
      .then(() => console.log("liste ajoutée !"))
      .catch(() => console.log("🤬 Fuck"))

    console.log("Suite du traitement .... 👌")

    this.getListsDatas()
  }

  async resetLocalDatabase() {
    await this.crudDbService.resetDatabase()

    this.getListsDatas()
  }

  identifyList(index: number, list: ListItems) {
    return `${list.id}${list.name}`;
  }

  private async synchroIndexedDbToServer() {
    await this.synchroService.syncListsWithServer()
    await this.synchroService.syncItemsWithServer()
  }

  public fermerNotif() {
    this.synchoFail = false
  }
}
