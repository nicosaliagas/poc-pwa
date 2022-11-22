import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input } from '@angular/core';
import { TodoItem, TodoList } from 'src/services/db';

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
    private connectionStatusService: ConnectionStatusService,
    private crudApiService: CrudApiService,) { }


  ngOnInit(): void {
    this.connectionStatusService.onConnectionStatutUpdated.subscribe((data: IConnectionStatusValue) => {
      this.connectionStatus = data
    })
  }

  /** création de l'item de la liste */
  public addItem() {
    // if (this.connectionStatus === IConnectionStatusValue.ONLINE) {
    this.crudApiService.NewListRessouce(this.todoList.title, this.itemName, this.todoList.id).pipe(
    ).subscribe(() => {
      console.log("Retour au subscribe dans ItemList + refresh")

      this.readDatas()
    })
    // } else {
    //   this.crudDbService.addListItem(this.todoList.id, this.itemName).subscribe(() => {
    //     this.readDatas()
    //   })
    // }
  }

  private readDatas() {
    if (this.connectionStatus === IConnectionStatusValue.ONLINE) {
      this.getTodoItemsFromListNameAPI()
    } else {
      this.getItemsFromListDb()
    }
  }

  private getTodoItemsFromListNameAPI() {
    this.crudApiService.GetCrucrudInfos(this.todoList.title).pipe(
    ).subscribe((todoItems: TodoItem[]) => {
      this.todoList.todoItems = todoItems

      this.cdr.detectChanges()
    })
  }

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
