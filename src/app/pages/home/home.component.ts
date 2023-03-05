import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HelperService, StringService } from 'cocori-ng/src/feature-core';
import { ApiService } from 'src/services/api.service';

import { Error, Flag, ListItems, StatusSync, TypeSync } from '../../../models/todos.model';
import { CacheableService } from '../../../services/cacheable';
import { ConnectionStatusService, IConnectionStatusValue } from '../../../services/connection-status.service';
import { DbService } from '../../../services/db.service';
import { RequestQueueService } from '../../../services/request-queue.service';
import { SynchroTestService } from '../../../services/synchro-test.service';
import { SynchroService } from '../../../services/synchro.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'page-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  listName = 'My new list';
  tableName: string = 'lists';

  connectionStatus!: IConnectionStatusValue;
  synchoRunning: boolean = false
  isSynchroErrorLoaded: boolean = false
  synchroErrorLoaded!: Error;
  synchoFail: boolean = false
  errorIdToLoad!: number
  notificationInfoMessage!: string

  constructor(
    private connectionStatusService: ConnectionStatusService,
    public requestQueueService: RequestQueueService,
    public crudApiService: ApiService,
    private cacheableService: CacheableService,
    private router: Router,
    private synchroService: SynchroService,
    private synchroTestService: SynchroTestService,
    private route: ActivatedRoute,
    private helperService: HelperService,
    private dbService: DbService,
    private cdr: ChangeDetectorRef,) {
    this.route.queryParams.subscribe((params: any) => {
      this.errorIdToLoad = params['load']
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

    // this.test()
  }

  private async test() {
    if (this.connectionStatusService.networkStatus === IConnectionStatusValue.ONLINE) {
      await this.synchroService.syncServerToDB()
    }
  }

  public async getListsDatas() {
    /** appel serveur pour récupérer toutes les listes items */
    if (this.connectionStatusService.networkStatus === IConnectionStatusValue.ONLINE) {
      await this.synchroService.syncServerToDB()

      if (await this.synchroService.checkErrorsSync() === false) {
        this.synchoFail = false

        this.cdr.detectChanges()
      }
    }

    /** on pagine ou pas la base pour filtrer la liste à afficher */
    if (typeof this.errorIdToLoad === 'undefined') {
      const datas = await this.dbService.paginateListsDB(-1, -1)

      this.crudApiService.lists = datas

      this.cdr.detectChanges()
    }
  }

  /** On va vérifier s'il y a des éléments à synchroniser */
  private async changeConnectionStatus() {

    if (typeof this.errorIdToLoad === 'undefined') {
      /** la page est réinitialisée, la liste est vidée avant d'être affichée à nouveau */
      this.crudApiService.lists.splice(0, this.crudApiService.lists.length)

      this.cdr.detectChanges()
    }

    if (this.connectionStatus === IConnectionStatusValue.ONLINE) {
      let anythingToSync: boolean = await this.synchroService.checkForSync()

      // anythingToSync = false

      if (anythingToSync) {
        // this.notificationInfoMessage =
        //   `<strong>Synchronisation en cours !</strong> Les données de l'application se mettent à jour avec le serveur.`
        // this.synchoRunning = true
        // this.cdr.detectChanges()
        // await this.synchroService.syncFlagsToServer()

        this.router.navigate(['/synchro']);
      } else {
        /** Vérification des erreurs */
        /* if (await this.synchroService.checkErrorsSync()) {
          if (typeof this.errorIdToLoad !== 'undefined') {
            this.synchroErrorLoaded = <Error>await db.errors.get(+this.errorIdToLoad)
            this.isSynchroErrorLoaded = true
          } else {
            this.synchoFail = true
          }
          this.cdr.detectChanges()
        } */

        /** on récupère la liste déroulante des todos par défaut et on la met en cache */
        await this.cacheableService.getApiCacheable(() => this.crudApiService.GetSelectTodos(), 'selectTodos', [])

        await this.getListsDatas()

        /* if (this.synchoRunning) {
          await this.sleep(2000)
          this.synchoRunning = false
        } */

        this.cdr.detectChanges()
      }
    } else {
      this.getListsDatas()
    }
  }

  /** Soumettre un post qui sera fail lors de la synchro : erreur DB, table inexistante*/
  public async addDbSyncError() {
    const anythingToSync: boolean = await this.synchroService.checkForSync()

    if (!anythingToSync) window.alert(`Ajoute en offline, au moins un élément à synchroniser pour tester l'erreur...`)

    let flagId = prompt("Id du flag à mettre en erreur: \n (F12 > Application > IndexedDb > Table flags)", "ex : 9152015b-70f9-2689-f815-0a79ae71b489");

    await this.synchroTestService.addErrorSync(<string>flagId)
  }

  /** Soumettre un post qui sera fail lors de la synchro : erreur api 404*/
  public async addApiSyncError() {
    /** Ajouter une nouvelle liste dans la table lists*/
    const newIdList: string = this.helperService.generateGuid()
    const table: string = "lists"

    await this.dbService.addElementDB(table, <ListItems>{ id: newIdList, name: "****", items: [] })

    await this.dbService.addFlagsDB(<Flag>{ id: newIdList, status: StatusSync.NOT_SYNC, type: TypeSync.MODIFY, table: table })
  }

  private sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async addNewList() {
    this.listName = new StringService(this.listName)
      .removeAllSpaces()
      .removeAllSpecialsCharacters()
      .replaceAllAccentByNonAccentCharacters()
      .toString()

    await this.crudApiService.postElement(this.tableName, this.helperService.generateGuid(), this.listName)
      .then(() => console.log("liste ajoutée !"))
      .catch(() => console.log("🤬 Fuck"))

    console.log("Suite du traitement .... 👌")

    this.getListsDatas()
  }

  identifyList(index: number, list: ListItems) {
    return `${list.id}${list.name}`;
  }

  public fermerNotif() {
    this.synchoFail = false
  }

  public refreshPage() {
    document.location.reload();
  }
}
