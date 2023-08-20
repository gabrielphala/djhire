export const arrayNotEmpty = (arr: Array<any>) => {
    if (arr && arr.length > 0) return 1;

    return 0;
}