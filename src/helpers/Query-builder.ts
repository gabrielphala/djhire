export default class QueryBuilder {
    private _model;
    private _find;
    
    constructor (model) {
        this._model = model;
        this._find = null;
    };

    private getQueryOptions (query) {
        return {
            select: query.select || '',
            populate: query.populate || null,
            limit: query.limit || null,
            skip: query.skip || null,
            sort: query.sort || { createdAt: -1 }
        }
    }

    private findAll = (condition) => (this._model.find(condition));

    private findOnlyOne = (condition) => (this._model.findOne(condition));

    private findAllWithOr = (condition) => (this._model.find({ $or: condition }));
    
    private findOnlyOneWithOr = (condition) => (this._model.findOne({ $or: condition }));

    private populate = (populate) => {
        if (!populate)
            return;

        populate.forEach(field => {
            this._find.populate(field[0], field[1]);
        })
    };

    private execFind = (query) => {
        const { find, select, populate, limit, skip, sort } = query;

        this._find = find;

        this._find.select(select);
        this._find.sort(sort);

        this.populate(populate);

        if (limit)
            this._find.limit(limit);

        if (skip)
            this._find.skip(skip);

        return this._find.exec()
    };

    add = (data) => this._model.create(data)

    exists = (condition) => new Promise(async (resolve, reject) => {
        const doc = await this.findOne({
            condition
        })

        resolve(doc ? true : false);
    });

    count = (condition) => new Promise((resolve, reject) => {
        this._model.where(condition).countDocuments((err, count) => {
            if (err == null)
                resolve(count);
            else
                reject('Something went wrong, try again later');
        });
    });

    find = (query) => this.execFind({
        find: this.findAll(query.condition),
        ...this.getQueryOptions(query)
    });

    findOne = (query) => this.execFind({
        find: this.findOnlyOne(query.condition),
        ...this.getQueryOptions(query)
    });

    findWithOr = (query) => this.execFind({
        find: this.findAllWithOr(query.condition),
        ...this.getQueryOptions(query)
    });

    findOneWithOr = (query) => this.execFind({
        find: this.findOnlyOneWithOr(query.condition),
        ...this.getQueryOptions(query)
    });

    updateOne = (condition, data) => new Promise((resolve, reject) => {
        const update = this._model.updateOne(condition, data);

        if (update.nModified != 0)
            resolve(update);

        else
            reject('Something went wrong, try again later')
    });
};