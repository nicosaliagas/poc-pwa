import { DiffArrayService } from './diff-array.service';

describe('Tests Synchro', () => {
    it('the diff between array A & B should return the elements added in array B', () => {
        let arr1 = [{ id: 1, name: 'Tom' }];

        let arr2 = [
            { id: 1, name: 'Tom' },
            { id: 2, name: 'John' },
        ];

        expect(new DiffArrayService().getDifference(arr2, arr1)).toEqual([{ id: 2, name: 'John' }]);

        arr1 = [];

        arr2 = [
            { id: 1, name: 'Tom' },
            { id: 2, name: 'John' },
        ];

        expect(new DiffArrayService().getDifference(arr2, arr1)).toEqual([{ id: 1, name: 'Tom' }, { id: 2, name: 'John' }]);
    });

    it('the diff between array A & B should return no elements added in array B', () => {
        const arr1 = [{ id: 1, name: 'Tom' }];

        const arr2 = [
            { id: 1, name: 'Tom' },
        ];

        expect(new DiffArrayService().getDifference(arr2, arr1)).toEqual([]);
    });

    it('the diff between array A & B should return the elements deleted in array B', () => {
        let arr1 = [{ id: 1, name: 'Tom' }];

        let arr2: any[] = [];

        expect(new DiffArrayService().getDifference(arr1, arr2)).toEqual([{ id: 1, name: 'Tom' }]);

        arr1 = [
            { id: 1, name: 'Tom' },
            { id: 2, name: 'John' },
            { id: 3, name: 'Marco' }
        ];

        arr2 = [
            { id: 1, name: 'Tom' },
            { id: 3, name: 'Marco' }
        ];

        expect(new DiffArrayService().getDifference(arr1, arr2)).toEqual([{ id: 2, name: 'John' }]);
    });

    it('should combine two arrays and return the first array with the elements of the second', () => {
        let arr1 = [{ id: 1, name: 'Tom' }];

        let arr2: any[] = [{ id: 2, name: 'Nicos' }];

        expect(new DiffArrayService().combineTwoArrays(arr1, arr2)).toEqual([{ id: 1, name: 'Tom' }, { id: 2, name: 'Nicos' }]);

        arr1 = [{ id: 1, name: 'Tom' }, { id: 3, name: 'TomX' }];

        arr2 = [{ id: 2, name: 'Nicos' }];

        expect(new DiffArrayService().combineTwoArrays(arr1, arr2)).toEqual([{ id: 1, name: 'Tom' }, { id: 3, name: 'TomX' }, { id: 2, name: 'Nicos' }]);

        arr1 = [{ id: 1, name: 'Tom' }, { id: 3, name: 'TomX' }];

        arr2 = [];

        expect(new DiffArrayService().combineTwoArrays(arr1, arr2)).toEqual([{ id: 1, name: 'Tom' }, { id: 3, name: 'TomX' }]);

        arr1 = [];

        arr2 = [{ id: 2, name: 'Nicos' }];

        expect(new DiffArrayService().combineTwoArrays(arr1, arr2)).toEqual([{ id: 2, name: 'Nicos' }]);
    });
});
