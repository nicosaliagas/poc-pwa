import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';

import { DbItem } from '../../../models/todos.model';
import { SynchroService } from '../../../services/synchro.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'page-synchro',
  templateUrl: './synchro.component.html',
  styleUrls: ['./synchro.component.scss'],
})
export class SynchroComponent implements OnInit {
  public itemsOnErrors: DbItem[] = []

  constructor(private synchroService: SynchroService) { }

  ngOnInit() {
    this.itemsOnErrors = this.synchroService.itemsOnErrors
  }

  identify(index: number, list: DbItem) {
    return `${list.id}`;
  }
}
