export const removeArrayElement = (arr: Array<any>, value: any) => {
    const index = arr.indexOf(value);

    if (index < 0) return undefined;

    return arr.splice(index, 1)
}