

export type Compute = {
    parameters: {
        x: number,
        y: number
    },
    result: number[]
}

export type Person = { name: string, email: string, age: number, country: string, status: 'Active' | 'Inactive' }

export type Groupings = 'all' | 'active' | 'inactive';
export type CustomSelect = {
    items: Person[],
    selectedNames: Person['name'][]
    searchKeyword: string
    groupValue: Groupings
}

export type AppState = {

    counter: number,

    compute: Compute,

    customSelect: CustomSelect
}


export const initialState: Readonly<AppState> = {

    counter: 0,
    
    compute: {
        parameters: {
            x: 0,
            y: 0
        },
        result: []
    },

    customSelect: {
        items: [],
        selectedNames: [],
        searchKeyword: '',
        groupValue: 'all',
    }
}