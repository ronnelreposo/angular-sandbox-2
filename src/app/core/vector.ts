
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

export const normalize = (vector: Vector): { kind: 'fail' } | Vector => {
    const vectorMagnitude = magnitude(vector);
    if(vectorMagnitude == 0) {
        return { kind: 'fail' }
    }
    else {
        return divide(vectorMagnitude)(vector);
    }
}

// Util =================================================================
const square = (x: number): number => x * x;
