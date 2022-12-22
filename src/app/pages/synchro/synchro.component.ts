import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';

import { DbItem, FlagErrors } from '../../../models/todos.model';
import { SynchroService } from '../../../services/synchro.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'page-synchro',
  templateUrl: './synchro.component.html',
  styleUrls: ['./synchro.component.scss'],
})
export class SynchroComponent implements OnInit {
  public itemsOnErrors: DbItem[] = []
  flagErrors: FlagErrors[] = [];

  constructor(
    private synchroService: SynchroService,
    private cdr: ChangeDetectorRef,
  ) { }

  ngOnInit() {
    this.getFlagsOnErrors()
  }

  private async getFlagsOnErrors() {
    if (await this.synchroService.checkErrorsSync()) {
      this.flagErrors = await this.synchroService.getErrorsFromFlags()
      
      console.log("Bon ben y a erreurs !!", this.flagErrors)

      this.cdr.detectChanges()
    }
  }

  identify(index: number, flagErrors: FlagErrors) {
    return `${flagErrors.flag.id}`;
  }
}
