import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { HelperService } from 'cocori-ng/src/feature-core';
import { firstValueFrom } from 'rxjs';

import { DbItem, Element, Error, Flag, FlagErrors, ListItems, StatusSync, TypeSync } from '../models/todos.model';
import { ApiService } from './api.service';
import { CacheableService } from './cacheable';
import { db } from './db';
import { DbService } from './db.service';

export const FAKE_ID: string = 'FAKE_ID'

@Injectable({
    providedIn: 'root',
})
export class SynchroService {
    public itemsOnErrors: DbItem[] = []

    constructor(
        private apiService: ApiService,
        private dbService: DbService,
        private helperService: HelperService,
        private cacheableService: CacheableService) { }

    async checkForSync(): Promise<boolean> {
        const numberFlagLists: number = await db.flags.where('status').equals(StatusSync.NOT_SYNC).count()
        return numberFlagLists > 0
    }

    async checkErrorsSync(): Promise<boolean> {
        const numberFlagLists: number = await db.flags.where('status').equals(StatusSync.ERROR).count()
        return numberFlagLists > 0
    }

    async syncServerToDB() {
        await this.dbService.resetListTable()

        const datasFromServer = await firstValueFrom(this.apiService.GetListsItemsAPI())

        await this.dbService.addListsDB(datasFromServer)
    }

    private async getListByFlagId(flag: Flag) {
        return <ListItems>await db.table(flag.table).where('id').equals(flag.id).first()
    }

    async syncFlagsToServer() {
        const errors: Error[] = []
        const flagsToSync: Flag[] = await db.flags.where('status').equals(StatusSync.NOT_SYNC).toArray()

        await Promise.all(flagsToSync.map(async (flag: Flag) => {

            console.log(">>>>> ", flag)

            const list: ListItems = <ListItems>await this.getListByFlagId(flag).catch((error) => {
                console.log("💀💀", error, flag.id)
                errors.push(<Error>{ flagId: flag.id, error: error.name, message: error.message, urlAPi: null })
            })

            console.log("listxx >> ", list)

            /** la liste doit être poussée avec les items qui lui sont rattachés */
            if (typeof list !== 'undefined') {
                if (flag.type === TypeSync.ADD) {
                    await this.apiService.postElement(flag.table, list.id, list.name, list.items)
                        .then(async () => {
                            await db.flags.where('id').equals(flag.id).delete();
                        })
                        .catch(({ dateError, httpError }: { dateError: string, httpError: HttpErrorResponse }) => {
                            console.log("💀💀 Apiadd ", httpError)
                            errors.push(<Error>{ flagId: flag.id, error: httpError.name, message: httpError.message, urlAPi: httpError.url })
                        })
                } else if (flag.type === TypeSync.MODIFY) {
                    /** la liste doit être mis à jour avec de nouveaux items */
                    await this.apiService.putElement(flag.table, list)
                        .then(async () => {
                            await db.flags.where('id').equals(flag.id).delete();
                        })
                        .catch(({ dateError, httpError }: { dateError: string, httpError: HttpErrorResponse }) => {
                            console.log("💀💀 Apiput ", httpError)
                            errors.push(<Error>{ flagId: flag.id, error: httpError.name, message: httpError.message, urlAPi: httpError.url })
                        })
                }
            }
        }))

        await this.SaveErrorDB(errors)
    }

    private async SaveErrorDB(errors: Error[]) {

        console.log("🚧 ", errors)

        await this.dbService.addErrorsDB(errors)

        await Promise.all(errors.map(async (error: Error) => {
            await db.flags.update(error.flagId, { status: StatusSync.ERROR })
        }))
    }

    public async getErrorsFromFlags() {
        let flagErrors: FlagErrors[] = []
        const flags: Flag[] = await db.flags.where('status').equals(StatusSync.ERROR).toArray()

        await Promise.all(flags.map(async (flag: Flag) => {
            const errors: Error = <Error>await db.errors.where('flagId').equals(flag.id).first()

            flagErrors.push({ flag: flag, error: errors })
        }))

        return flagErrors
    }

    // async syncItemsWithServer() {
    //     const listsToAdd: DbList[] = await db.listFlag.where({
    //         recordType: StatusSync.ADD,
    //     }).toArray()

    //     const itemsToAdd: DbItem[] = await db.itemFlag.where({
    //         recordType: StatusSync.ADD,
    //     }).toArray()

    //     /** on regroupe les items à synchroniser par id de liste */
    //     const itemsGroupedByListId: Object = itemsToAdd.reduce((r: any, a: DbItem) => {
    //         r[a.listId] = r[a.listId] || [];
    //         r[a.listId].push(a);

    //         return r;
    //     }, Object.create(null));

    //     const listsItemXXsToAdd: ListItems[] = []

    //     /** on converti le regroupement d'items en tableau d'objet list/items */
    //     Object.entries(itemsGroupedByListId).forEach(([key, items]) => {
    //         const elements: Element[] = <Element[]>(<DbItem[]>items).map(({ id, name }) => ({ id, name }))

    //         /** name à vide car pas dispo à cet étape */
    //         // listsIteXmsToAdd.push({ id: <string>key, name: '', items: elements })
    //     })

    //     /** on synchronise suivant si c'est une nouvelle liste ou seulement des ajouts d'item sur des listes existantes */
    //     await Promise.all(listsXItemsToAdd.map(async (listItems: ListItems) => {
    //         const list: DbList = <DbList>listsToAdd.find((list: DbList) => list.id === listItems.id)

    //         if (list) {
    //             /** name à vide car pas dispo à cet instant */
    //             listItems.name = list.name

    //             await this.crudApiService.postListItems(listItems)
    //         } else {
    //             await Promise.all(listItems.items.map(async (item: Element) => {

    //                 /** on teste si l'id de l'item passé en paramêtre existe toujours en bdd */
    //                 if (!item.name) {
    //                     const defaultTodos: Element[] = await this.cacheableService.getCacheDatas('selectTodos', [])

    //                     const defaultTodoFound: number = defaultTodos.findIndex((todo: Element) => todo.id === item.id)

    //                     if (defaultTodoFound === -1) {
    //                         console.log(`💩 L'id ${item.id} n'existe pas !`)

    //                         // await this.crudApiService.postItem(listItems.id, item.id, item.name, true)
    //                         //     .then(_ => { console.log("succès") })
    //                         //     .catch(_ => { console.log("failure") })

    //                         console.log("Suite de la synchro .... 👌")
    //                         return;
    //                     }
    //                 }

    //                 await this.crudApiService.postItem(listItems.id, item.id, item.name)
    //                     .then(async () => await db.itemFlag.where('id').equals(item.id).delete())
    //                     .catch(_ => { })
    //             }));
    //         }
    //     }));
    // }

    async addFakeItemSelect() {
        const defaultTodos: Element[] = await this.cacheableService.getCacheDatas('selectTodos', [])

        defaultTodos.push({ id: FAKE_ID, name: "élément supprimé" })

        await this.cacheableService.cacheDatas('selectTodos', defaultTodos)
    }

    async removeFakeItemSelect() {
        const defaultTodos: Element[] = await this.cacheableService.getCacheDatas('selectTodos', [])

        const defaultTodoFound: number = defaultTodos.findIndex((todo: Element) => todo.id === FAKE_ID)

        if (defaultTodoFound !== -1) {
            defaultTodos.splice(defaultTodoFound, 1);
        }

        await this.cacheableService.cacheDatas('selectTodos', defaultTodos)
    }
}