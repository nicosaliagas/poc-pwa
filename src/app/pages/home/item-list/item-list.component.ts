import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { HelperService } from 'cocori-ng/src/feature-core';
import { Observable } from 'rxjs';

import { ListsItems } from '../../../../models/todos.model';
import { CacheableService } from '../../../../services/cacheable';
import { ConnectionStatusService, IConnectionStatusValue } from '../../../../services/connection-status.service';
import { CrudApiService, NewTodo } from '../../../../services/crud-api.service';
import { CrudDbService } from '../../../../services/crud-db.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'item-list',
  templateUrl: './item-list.component.html',
  styleUrls: ['./item-list.component.scss'],
})
export class ItemListComponent {
  @Input() list!: ListsItems;

  public $defaultTodos: Observable<any> = this.crudApiService.GetDefaultTodosList()
  public connectionStatus!: IConnectionStatusValue;
  public itemName = 'My new item';
  public formulaire!: FormGroup;

  constructor(
    private cdr: ChangeDetectorRef,
    private helperService: HelperService,
    private fb: FormBuilder,
    private crudDbService: CrudDbService,
    private cacheableService: CacheableService,
    private connectionStatusService: ConnectionStatusService,
    private crudApiService: CrudApiService,) { }


  ngOnInit(): void {
    this.connectionStatusService.onConnectionStatutUpdated.subscribe((data: IConnectionStatusValue) => {
      this.connectionStatus = data
    })

    this.formulaire = this.generateForm();

    this.formulaire.get('newtodo')?.valueChanges
      .subscribe((values) => {
        if (values) {
          this.formulaire.get('todo')?.setValue(null, { emitEvent: false })
          this.cdr.detectChanges()
        }
      })

    this.formulaire.get('todo')?.valueChanges
      .subscribe((values) => {
        if (values) {
          this.formulaire.get('newtodo')?.setValue('', { emitEvent: false })
          this.cdr.detectChanges()
        }
      })
  }

  private generateForm(): FormGroup {
    return this.fb.group({
      todo: [null],
      newtodo: [null]
    });
  }

  /** création de l'item de la liste */
  async addItem({ value, valid }: { value: NewTodo, valid: boolean }) {

    console.log("value >> ", value)

    await this.crudApiService.postItem(this.list.id, this.helperService.generateGuid(), value.newtodo)

    console.log("Retour au subscribe dans ItemList + refresh the list")

    this.crudApiService.onRefreshList.next()
  }

  trackBy(index: number) {
    return index;
  }
}
