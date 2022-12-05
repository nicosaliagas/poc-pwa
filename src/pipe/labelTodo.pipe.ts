import { Pipe, PipeTransform } from '@angular/core';

import { CacheableService } from '../services/cacheable';
import { CrudApiService } from '../services/crud-api.service';

@Pipe({
  name: 'labelTodo'
})
export class LabelTodoPipe implements PipeTransform {
  private defaultTodos: any;

  constructor(private cacheableService: CacheableService, private crudApiService: CrudApiService) { }

  private async getDefaultValue() {
    this.defaultTodos = await this.cacheableService.getApiCacheable(() => this.crudApiService.GetSelectTodos(), 'selectTodos', [])
  }

  async transform(idItem: any, args?: any) {
    await this.getDefaultValue()

    const todo = <Element>this.defaultTodos.find((todo: Element) => todo.id === idItem)

    return todo.name;
  }
}