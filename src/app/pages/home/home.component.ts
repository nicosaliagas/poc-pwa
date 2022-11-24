import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { StringService } from 'cocori-ng/src/feature-core';
import { firstValueFrom } from 'rxjs';
import { CrudApiService } from 'src/services/crud-api.service';
import { db, TodoList } from 'src/services/db';

import { CacheableService } from '../../../services/cacheable';
import { ConnectionStatusService, IConnectionStatusValue } from '../../../services/connection-status.service';
import { CrudDbService } from '../../../services/crud-db.service';
import { SynchroService } from '../../../services/synchro.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'page-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  providers: [SynchroService]
})
export class HomeComponent implements OnInit {
  listName = 'My new list';
  // todoLists: TodoList[] = [];
  connectionStatus!: IConnectionStatusValue;
  synchoRunning: boolean = false

  constructor(
    private connectionStatusService: ConnectionStatusService,
    public crudApiService: CrudApiService,
    private cacheableService: CacheableService,
    private synchroService: SynchroService,
    private crudDbService: CrudDbService,
    private cdr: ChangeDetectorRef,) { }

  ngOnInit(): void {

    this.connectionStatusService.onConnectionStatutUpdated.subscribe((data: IConnectionStatusValue) => {
      this.connectionStatus = data

      this.changeConnectionStatus()
    })

    this.crudApiService.onRefreshList.subscribe(() => {
      console.log("📍Refresh the list")

      this.getListsDatas()
    })
  }

  private async changeConnectionStatus() {
    if (this.connectionStatus === IConnectionStatusValue.ONLINE) {

      const anythingToSync: boolean = await this.synchroService.checkForSync()

      if (anythingToSync) {
        this.synchoRunning = true

        this.cdr.detectChanges()

        await this.sychronize()
      }

      await this.getListsDatas()

      await this.sleep(2000)

      this.synchoRunning = false

      this.cdr.detectChanges()
    } else {
      this.getListsDatas()
    }
  }

  private sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private async getListsDatas() {
    const datas = await this.cacheableService.cacheable(() => this.crudApiService.GetListsItemsAPI(), 'listsItems', { "todoLists": [] })

    console.log("🔥todoLists from api/local >> ", datas)

    this.crudApiService.todoLists = datas.todoLists

    this.cdr.detectChanges()
  }

  // private getAllTodosListItemsIndexedDb() {
  //   this.todoLists = []

  //   this.crudDbService.getRecords().subscribe((datas: TodoList[]) => {
  //     this.todoLists = datas

  //     this.cdr.detectChanges()
  //   })

  //   this.cdr.detectChanges()
  // }

  async addNewList() {
    this.listName = new StringService(this.listName)
      .removeAllSpaces()
      .removeAllSpecialsCharacters()
      .replaceAllAccentByNonAccentCharacters()
      .toString()

    await this.crudApiService.postList(this.listName)

    this.getListsDatas()

    // if (this.connectionStatus === IConnectionStatusValue.ONLINE) {
    // this.crudApiService.NewListRessouceX(this.listName).subscribe(
    //   () => {
    //     this.getListsDatas()
    //   }
    // )
    // } else {
    //   this.crudDbService.addList(this.listName).subscribe(() => this.readDatas())
    // }
  }

  async resetLocalDatabase() {
    await this.crudDbService.resetDatabase()

    if (this.connectionStatus === IConnectionStatusValue.OFFLINE) {
      this.getListsDatas()
    }
  }

  async resetServerDatabase() {
    await Promise.all(this.crudApiService.todoLists.map(async (list: TodoList) => {
      const listeName: string = list.title

      await firstValueFrom(this.crudApiService.DeleteListRessource(listeName))
    }));
  }

  identifyList(index: number, list: TodoList) {
    return `${list.id}${list.title}`;
  }

  async sychronize() {
    await this.synchroService.syncListsWithServer()

    await db.resetTableList()

    await this.synchroService.syncItemsWithServer()

    await db.resetTableItems()

    // await firstValueFrom(this.crudApiService.GetListsItemsAPI())

    // await this.synchroService.serverToIndexedDB(this.crudApiService.todoLists)

    // this.getListsDatas()
  }
}
