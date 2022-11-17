import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { StringService } from 'cocori-ng/src/feature-core';
import { firstValueFrom, from, map, mergeMap, Observable, Subject, toArray } from 'rxjs';
import { CrudApiService } from 'src/services/crud-api.service';
import { TodoList } from 'src/services/db';

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
    private synchroService: SynchroService,
    private crudDbService: CrudDbService,
    private cdr: ChangeDetectorRef,) { }

  ngOnInit(): void {

    this.connectionStatusService.onConnectionStatutUpdated.subscribe((data: IConnectionStatusValue) => {
      this.connectionStatus = data

      this.readDatas()
    })
  }

  private readDatas() {
    this.todoLists = []

    if (this.connectionStatus === IConnectionStatusValue.ONLINE) {
      this.getAllTodosListItemsAPI()
    } else {
      this.getAllTodosListItemsIndexedDb()
    }
  }

  private getAllTodosListItemsIndexedDb() {
    this.todoLists = []

    this.crudDbService.getRecords().subscribe((datas: TodoList[]) => {
      this.todoLists = datas

      this.cdr.detectChanges()
    })

    this.cdr.detectChanges()
  }

  private getAllTodosListItemsAPI(): Observable<any> {
    var subject = new Subject<TodoList[]>();

    this.todoLists.splice(0, this.todoLists.length)

    /** all the lists created */
    this.crudApiService.GetCrucrudInfos('').pipe(
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
    ).subscribe((datas: { todoLists: TodoList[] }) => {
      this.todoLists = datas.todoLists

      this.cdr.detectChanges()

      subject.next(datas.todoLists);
    })

    return subject.asObservable();
  }

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

    if (this.connectionStatus === IConnectionStatusValue.ONLINE) {
      this.crudApiService.NewListRessouce(this.listName).pipe(
      ).subscribe((datas: any) => {
        this.readDatas()
      })
    } else {
      this.crudDbService.addList(this.listName).subscribe(() => {
        this.readDatas()
      })
    }
  }

  async resetLocalDatabase() {
    await this.crudDbService.resetDatabase()

    if (this.connectionStatus === IConnectionStatusValue.OFFLINE) {
      this.readDatas()
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

      await firstValueFrom(this.getAllTodosListItemsAPI())

      await this.synchroService.serverToIndexedDB(this.todoLists)

      this.readDatas()
    } else {
      window.alert("Vous devez être connecté au réseau pour synchroniser les données de l'application.")
    }
  }
}
