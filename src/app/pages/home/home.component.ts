import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { StringService } from 'cocori-ng/src/feature-core';
import { firstValueFrom, from, map, mergeMap, Observable, toArray } from 'rxjs';
import { CrudApiService } from 'src/services/crud-api.service';
import { TodoList } from 'src/services/db';

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
  todoLists: TodoList[] = [];
  connectionStatus!: IConnectionStatusValue;

  constructor(
    private connectionStatusService: ConnectionStatusService,
    private crudApiService: CrudApiService,
    private cacheableService: CacheableService,
    private synchroService: SynchroService,
    private crudDbService: CrudDbService,
    private cdr: ChangeDetectorRef,) { }

  ngOnInit(): void {

    this.connectionStatusService.onConnectionStatutUpdated.subscribe((data: IConnectionStatusValue) => {
      this.connectionStatus = data

      this.getListsDatas()
    })
  }

  private async getListsDatas() {
    const datas = await this.cacheableService.cacheable(() => this.getListsItemAPI(), 'listsItems', { "todoLists": [] })

    console.log("todoLists from api >> ", datas)

    this.todoLists = datas.todoLists

    this.cdr.detectChanges()

    // if (this.connectionStatus === IConnectionStatusValue.ONLINE) {
    // this.getListsItemAPI()
    // } else {
    // this.getAllTodosListItemsIndexedDb()
    // }
  }

  private getAllTodosListItemsIndexedDb() {
    this.todoLists = []

    this.crudDbService.getRecords().subscribe((datas: TodoList[]) => {
      this.todoLists = datas

      this.cdr.detectChanges()
    })

    this.cdr.detectChanges()
  }

  private getListsItemAPI(): Observable<any> {

    this.todoLists.splice(0, this.todoLists.length)

    return this.crudApiService.GetCrucrudInfos('').pipe(
      mergeMap((lists: string[]) =>
        // `from` emits each contact separately
        from(lists).pipe(
          // load each contact
          mergeMap((list: string) => this.getListTodoItems(list)),
          // collect all contacts into an array
          toArray(),
          // add the newly fetched data to original result
          map(todoLists => ({ ...this.todoLists, todoLists })),
        ))
    )
  }

  // private getListsItemAPI(): Observable<any> {
  //   var subject = new Subject<TodoList[]>();

  //   this.todoLists.splice(0, this.todoLists.length)

  //   /** all the lists created */
  //   this.crudApiService.GetCrucrudInfos('').pipe(
  //     mergeMap((lists: string[]) =>
  //       // `from` emits each contact separately
  //       from(lists).pipe(
  //         // load each contact
  //         mergeMap((list: string) => this.getListTodoItems(list)),
  //         // collect all contacts into an array
  //         toArray(),
  //         // add the newly fetched data to original result
  //         map(todoLists => ({ ...this.todoLists, todoLists })),
  //       ))
  //   ).subscribe((datas: { todoLists: TodoList[] }) => {
  //     this.todoLists = datas.todoLists

  //     console.log("todoLists from api >> ", this.todoLists)

  //     this.cdr.detectChanges()

  //     subject.next(datas.todoLists);
  //   })

  //   return subject.asObservable();
  // }

  /**
   * It takes a list name as a parameter, calls the GetCrucrudInfos function from the crudApiService,
   * and then maps the result to an object with a title and todoItems property.
   * @param {string} listName - string - the name of the list you want to get the items from
   * @returns An Observable of type { title: string, todoItems: any[] }
   */
  private getListTodoItems(listName: string) {
    return this.crudApiService.GetCrucrudInfos(listName).pipe(
      map(todoItems => ({ title: listName, todoItems: todoItems }))
    )
  }

  public addNewList() {
    this.listName = new StringService(this.listName)
      .removeAllSpaces()
      .removeAllSpecialsCharacters()
      .replaceAllAccentByNonAccentCharacters()
      .toString()

    // if (this.connectionStatus === IConnectionStatusValue.ONLINE) {
    this.crudApiService.NewListRessouce(this.listName).subscribe(
      () => {
        this.getListsDatas()
      }
    )
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
    await Promise.all(this.todoLists.map(async (list: TodoList) => {
      const listeName: string = list.title

      await firstValueFrom(this.crudApiService.DeleteListRessource(listeName))
    }));
  }

  identifyList(index: number, list: TodoList) {
    return `${list.id}${list.title}`;
  }

  async sychronize() {
    if (this.connectionStatus === IConnectionStatusValue.ONLINE) {

      await this.synchroService.indexedDBToServer()

      await this.crudDbService.resetDatabase()

      await firstValueFrom(this.getListsItemAPI())

      await this.synchroService.serverToIndexedDB(this.todoLists)

      this.getListsDatas()
    } else {
      window.alert("Vous devez être connecté au réseau pour synchroniser les données de l'application.")
    }
  }
}
