export const makeId = (length: number) => {
    var string = '';
    var chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_-';
    var charLength = chars.length;

    for (var i = 0; i < length; i++) {
        string += chars.charAt(Math.floor(Math.random() * charLength));
    }

    return string;
}