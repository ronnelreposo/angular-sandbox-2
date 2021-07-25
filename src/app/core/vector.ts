
export type Vector = {
  x: number;
  y: number;
};

export const add = (firstVector: Vector) =>
    (secondVector: Vector): Vector => {
  return {
    x: firstVector.x + secondVector.x,
    y: firstVector.y + secondVector.y
  };
};

export const subtract = (firstVector: Vector) =>
    (secondVector: Vector): Vector => {
    return {
        x: firstVector.x - secondVector.x,
        y: firstVector.y - secondVector.y
    };
}

export const multiply = (scalar: number) =>
    ({ x, y }: Vector): Vector => {
    return { 
        x: x * scalar,
        y: y * scalar
    }
};

/**
 * Alias for **multiply**
 * */
export const scale = multiply

export const divide = (scalar: number) =>
    ({ x, y }: Vector): Vector => {
    return { 
        x: x / scalar,
        y: y / scalar
    }
}

export const magnitude = ({ x, y }: Vector): number => {
    return Math.sqrt(square(x) + square(y))
}

export const normalize = (vector: Vector): Vector => {
    const vectorMagnitude = magnitude(vector);
    if(vectorMagnitude == 0) {
        return vector;
    }
    else {
        return divide(vectorMagnitude)(vector);
    }
}

// Util =================================================================
const square = (x: number): number => x * x;

export const random2D = (): Vector => {

    return normalize({
        x: Math.floor(Math.random() * 10),
        y: Math.floor(Math.random() * 10)
    })
};