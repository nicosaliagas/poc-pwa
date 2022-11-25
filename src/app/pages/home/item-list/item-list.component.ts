import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input } from '@angular/core';
import { TodoList } from 'src/services/db';

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

    await this.crudApiService.postItem(this.todoList.id, this.itemName)

    // this.crudApiService.postItemX(this.todoList.id, this.itemName).subscribe(() => {
    //   console.log("NTM !")
    // })

    console.log("Retour au subscribe dans ItemList + refresh the list")

    this.crudApiService.onRefreshList.next()
  }

  trackBy(index: number) {
    return index;
  }
}
