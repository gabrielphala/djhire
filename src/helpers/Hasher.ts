import bcrypt from "bcryptjs"

export default new (class Hasher {
    hash = (str: string) => {
        return new Promise((resolve, reject) => {
            bcrypt.genSalt(10, (err, salt) => {
                if (err) {
                    reject('Something went wrong, try again later');

                    return;
                }

                bcrypt.hash(str, salt, (err, hash) => {
                    if (err) {
                        reject('Something went wrong, try again later');

                        return;
                    }

                    resolve(hash);
                });
            });
        });
    }

    isSame = (hash: string, plain: string) => {
        return new Promise((resolve, reject) => {
            bcrypt.compare(plain, hash, (err, results) => {
                if (err) {
                    reject('Something went wrong, try again later');

                    return;
                }

                resolve(results);
            });
        });
    }
});