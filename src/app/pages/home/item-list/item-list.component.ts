import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input } from '@angular/core';
import { TodoItem, TodoList } from 'src/services/db';

import { CacheableService } from '../../../../services/cacheable';
import { ConnectionStatusService, IConnectionStatusValue } from '../../../../services/connection-status.service';
import { CrudApiService } from '../../../../services/crud-api.service';
import { CrudDbService } from '../../../../services/crud-db.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'item-list',
  templateUrl: './item-list.component.html',
  styleUrls: ['./item-list.component.scss'],
})
export class ItemListComponent {
  @Input() todoList!: TodoList;

  connectionStatus!: IConnectionStatusValue;
  itemName = 'My new item';

  constructor(
    private cdr: ChangeDetectorRef,
    private crudDbService: CrudDbService,
    private cacheableService: CacheableService,
    private connectionStatusService: ConnectionStatusService,
    private crudApiService: CrudApiService,) { }


  ngOnInit(): void {
    this.connectionStatusService.onConnectionStatutUpdated.subscribe((data: IConnectionStatusValue) => {
      this.connectionStatus = data
    })
  }

  /** création de l'item de la liste */
  async addItem() {

    await this.crudApiService.NewListRessouceX(this.todoList.title, this.itemName, this.todoList.id)

    console.log("Retour au subscribe dans ItemList + refresh the list")

    this.crudApiService.onRefreshList.next()

    /** ancien */

    // this.crudApiService.NewListRessouce(this.todoList.title, this.itemName, this.todoList.id).pipe(
    // ).subscribe(() => {
    //   console.log("Retour au subscribe dans ItemList + refresh the list")

    //   // this.crudApiService.onRefreshList.next()

    //   // mettre NewListRessouce en async + mettre try/catch classique autour de l'appel

    //   // this.getListsDatas()
    // })







    // } else {
    //   this.crudDbService.addListItem(this.todoList.id, this.itemName).subscribe(() => {
    //     this.readDatas()
    //   })
    // }
  }

  private async getListsDatas() {
    const datas = await this.cacheableService.cacheable(() => this.crudApiService.GetListsItemsAPI(), 'listsItems', { "todoLists": [] })

    console.log("items from api/local >> ", this.todoList.title, datas)

    console.log("TODO : METTRE A JOUR LES ITEMS DE LA LISTE")

    // this.todoList.todoItems = datas

    this.cdr.detectChanges()

    // if (this.connectionStatus === IConnectionStatusValue.ONLINE) {
    //   this.getTodoItemsFromListNameAPI()
    // } else {
    //   this.getItemsFromListDb()
    // }
  }

  // private getListItemsAPI(): Observable<any> {
  //   return this.crudApiService.GetListDatas(this.todoList.title)
  // }

  private getItemsFromListDb() {
    this.crudDbService.getItemsFromOneList(this.todoList.id).subscribe((todoItems: TodoItem[]) => {
      this.todoList.todoItems = todoItems

      this.cdr.detectChanges()
    })
  }

  trackBy(index: number) {
    return index;
  }
}
