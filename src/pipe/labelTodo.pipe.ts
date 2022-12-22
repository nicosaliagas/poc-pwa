import { Pipe, PipeTransform } from '@angular/core';

import { ApiService } from '../services/api.service';
import { CacheableService } from '../services/cacheable';

@Pipe({
  name: 'labelTodo'
})
export class LabelTodoPipe implements PipeTransform {
  private defaultTodos: any;

  constructor(private cacheableService: CacheableService, private crudApiService: ApiService) { }

  private async getDefaultValue() {
    this.defaultTodos = await this.cacheableService.getCacheDatas('selectTodos', [])
  }

  async transform(idItem: any, args?: any) {
    await this.getDefaultValue()

    const todo = <Element>this.defaultTodos.find((todo: Element) => todo.id === idItem)

    return todo?.name;
  }
}