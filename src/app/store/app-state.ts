

export type Compute = {
    parameters: {
        x: number,
        y: number
    },
    result: number[]
}

export type AppState = {

    counter: number,

    compute: Compute
}


export const initialState: Readonly<AppState> = {

    counter: 0,
    
    compute: {
        parameters: {
            x: 0,
            y: 0
        },
        result: []
    }
}