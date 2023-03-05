import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class DiffArrayService {

    constructor() { }

    public getDifference(array1: any[], array2: any[]) {
        return array1.filter(object1 => {
            return !array2.some(object2 => {
                return object1.id === object2.id;
            });
        });
    }

    public combineTwoArrays(array: any[], elementsToAdd: any[]): any[] {
        return [...array, ...elementsToAdd]
    }
}