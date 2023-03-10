import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { HelperService } from 'cocori-ng/src/feature-core';

import { AddTodoFrm, Element, ListItems } from '../../../../models/todos.model';
import { ApiService } from '../../../../services/api.service';
import { CacheableService } from '../../../../services/cacheable';
import { ConnectionStatusService, IConnectionStatusValue } from '../../../../services/connection-status.service';
import { DbService } from '../../../../services/db.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'item-list',
  templateUrl: './item-list.component.html',
  styleUrls: ['./item-list.component.scss'],
})
export class ItemListComponent {
  @Input() list!: ListItems;

  // public $defaultTodos: Observable<any> = this.crudApiService.GetDefaultTodosList()
  public defaultTodos: Element[] = []
  public connectionStatus!: IConnectionStatusValue;
  public itemName = 'My new item';
  public tableName: string = 'lists';

  public formulaire!: FormGroup;

  constructor(
    private cdr: ChangeDetectorRef,
    private helperService: HelperService,
    private fb: FormBuilder,
    private crudDbService: DbService,
    private cacheableService: CacheableService,
    private connectionStatusService: ConnectionStatusService,
    private crudApiService: ApiService,) { }


  ngOnInit(): void {
    this.connectionStatusService.onConnectionStatutUpdated.subscribe((data: IConnectionStatusValue) => {
      this.connectionStatus = data
    })

    this.getValues()

    this.formulaire = this.generateForm();

    this.formulaire.get('newTodoText')?.valueChanges
      .subscribe((values) => {
        if (values) {
          this.formulaire.get('newTodoId')?.setValue(null, { emitEvent: false })
          this.cdr.detectChanges()
        }
      })

    this.formulaire.get('newTodoId')?.valueChanges
      .subscribe((values) => {
        if (values) {
          this.formulaire.get('newTodoText')?.setValue(null, { emitEvent: false })
          this.cdr.detectChanges()
        }
      })
  }

  private generateForm(): FormGroup {
    return this.fb.group({
      newTodoId: [null],
      newTodoText: [null]
    });
  }

  private async getValues() {
    this.defaultTodos = await this.cacheableService.getCacheDatas('selectTodos', [])
    this.cdr.detectChanges()
  }

  /** cr??ation de l'item de la liste */
  async addItem({ value, valid }: { value: AddTodoFrm, valid: boolean }) {
    const id: string = value.newTodoId ? value.newTodoId : this.helperService.generateGuid()
    const text: string = value.newTodoId ? '' : value.newTodoText

    await this.crudApiService.postItemList(this.tableName, this.list.id, id, text)
      .then(() => console.log("item ajout??!"))
      .catch(() => console.log("???? Fuck"))

    this.crudApiService.onRefreshList.next()
  }

  trackBy(index: number) {
    return index;
  }
}
