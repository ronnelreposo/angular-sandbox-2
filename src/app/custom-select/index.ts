import * as _ from 'lodash';

export type SelectContext<A> = {
    sourceItems: A[]
    selectedItems: A[]
    equalityFunc: (a: A, b: A) => boolean
    searchFunc: <K extends keyof A>(a: A, groupKey: K) => boolean
    // Extension / Improvement. multiple levels in object. e.g. person.child.active
    // searchFunc: <K extends keyof A, V extends A[K]>(a: A, groupKey: K, groupValue: V) => boolean // more extensive.
}

export const defaultContext = <T>(): SelectContext<T> => ({
    sourceItems: [],
    selectedItems: [],
    equalityFunc: (p1, p2) => p1 === p2,
    searchFunc: _ => true,
});

export const selectEngine = <T, K extends keyof T>(
    context: SelectContext<T> = defaultContext(),
    
    // Why not in the same context? TKey and TValue (type) to be reasearched in depth.
    groupKey: K | undefined = undefined,
): T[] | _.Dictionary<T[]> => {

    const excludedSelectedItems = _.differenceWith(context.sourceItems, context.selectedItems, context.equalityFunc);
    const searchedItems = excludedSelectedItems.filter(a => context.searchFunc(a, groupKey));

    // Extension / Improvement. multiple levels in object. e.g. person.child.active
    if (groupKey) {
        return _.groupBy(searchedItems, groupKey.toString());
    } else {
        return searchedItems;
    }
};
