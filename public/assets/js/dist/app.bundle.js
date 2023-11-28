/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "../kolijs/App.ts":
/*!************************!*\
  !*** ../kolijs/App.ts ***!
  \************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
const Helpers_1 = __importDefault(__webpack_require__(/*! ./src/Helpers */ "../kolijs/src/Helpers.ts"));
const Utility_1 = __importDefault(__webpack_require__(/*! ./src/Utility */ "../kolijs/src/Utility.ts"));
const Cache_1 = __importDefault(__webpack_require__(/*! ./src/Cache */ "../kolijs/src/Cache.ts"));
const Lexer_1 = __importDefault(__webpack_require__(/*! ./src/Lexer */ "../kolijs/src/Lexer.ts"));
class KoliEngine {
    _content;
    _file;
    _data;
    _headers;
    _helpers;
    _cache;
    _terminateNext = false;
    _hasInternalDataFetch = false;
    _signalUsage;
    _inlineSignals;
    _config = {
        allowTerminatorHelpers: false,
        cache: true
    };
    constructor(content, data, helpers) {
        this._content = content || '';
        this._data = data || {};
        this._helpers = helpers || new Helpers_1.default();
        this._helpers.setData(this._data);
        this._cache = new Cache_1.default();
    }
    get data() {
        return this._data;
    }
    get signalUsage() {
        return this._signalUsage;
    }
    setContext({ content, file, data, headers }) {
        this._content = content;
        this._file = file;
        this._data = data || {};
        this._headers = headers;
        this._terminateNext = false;
        this._hasInternalDataFetch = false;
        this._signalUsage = {};
        this._helpers.setData(this._data, this._headers);
        return this;
    }
    isSignal(key) {
        return (this._data[key] && this._data[key]._isSignal) ? true : false;
    }
    recordSignalUsage(signals, position) {
        signals.forEach(signal => {
            this._signalUsage[signal] = this._signalUsage[signal] || [];
            this._signalUsage[signal].push({
                file: this._file,
                position
            });
        });
    }
    async useHelpers(key) {
        let helperCalls = key.split('|'), res = [];
        this._inlineSignals = [];
        for (let i = 0; i < helperCalls.length; i++) {
            const call = helperCalls[i];
            const props = Utility_1.default.getParamsFromString(call.trim());
            const helperName = props[0];
            // if helper name is undefined or not registered stop
            if (!helperName || helperName && !this._helpers.isHelper(helperName))
                return;
            // used to prevent caching a component that has internal fetching
            if (['fetch'].includes(helperName))
                this._hasInternalDataFetch = true;
            let addRight = false, leftCalledByUserHelper = false;
            for (let i = 1; i < props.length; i++) {
                const param = props[i].trim();
                if (param === '+') {
                    addRight = true;
                    continue;
                }
                const paramIsStringLiteral = Utility_1.default.isStringLiteral(param);
                const value = paramIsStringLiteral ?
                    Utility_1.default.removeQuotes(param) :
                    await Utility_1.default.traverseKoliObjectString(param, this._data);
                if (!Array.isArray(res))
                    res = [res];
                const isUserDefinedHelper = this._helpers.isUserHelper(helperName);
                let realValue = Utility_1.default.getRealObjectValue(value);
                if (addRight) {
                    const leftValue = leftCalledByUserHelper ?
                        res[res.length - 1] :
                        res[res.length - 1].value;
                    res.pop();
                    realValue = leftValue + value;
                    addRight = false;
                }
                res.push(isUserDefinedHelper ?
                    realValue :
                    { value: realValue, _isPromise: false });
                leftCalledByUserHelper = isUserDefinedHelper;
                const signalName = paramIsStringLiteral ? value : param;
                if (!paramIsStringLiteral && this.isSignal(signalName)) {
                    this._inlineSignals.push(signalName);
                }
            }
            if (this._config.allowTerminatorHelpers && this._helpers.isTerminatorHelper(helperName)) {
                this._terminateNext = true;
            }
            res = this._helpers.useHelper(helperName).call(this._helpers, ...res);
        }
        return Array.isArray(res) && res.length == 0 ? '' : res;
    }
    setHelper(name, hanlder, terminateOnHelper = false) {
        this._helpers.setHelper(name, hanlder, terminateOnHelper);
    }
    isInlineBlock(statement) {
        if (!statement)
            return false;
        return statement.charAt(2) == '~';
    }
    async findBlocks({ block, blockKind, blockArg, blockBody }) {
        if (this.isInlineBlock(block))
            return await this.execNonOutput(block);
        if (!this.isInlineBlock(block) && !blockArg)
            return await this.renderVariables(block);
        if (blockKind == 'each')
            return await this.execLoop(blockArg, blockBody, block);
        if (blockKind == 'if')
            return await this.execIf(blockArg, blockBody, block);
        if (blockKind == 'not')
            return await this.execNot(blockArg, blockBody, block);
        if (blockKind == 'same')
            return await this.execSame(blockArg, blockBody, block);
    }
    async renderVariables(inlineBlock) {
        let oldBlock = inlineBlock;
        inlineBlock = await this.subRender(inlineBlock.slice(2, inlineBlock.length - 2), this.data);
        let blockStartPos = this._content.indexOf(inlineBlock), blockEndPos;
        let key = inlineBlock.replace(/{{|}}|<<|>>/, '').trim();
        let helperRes = await this.useHelpers(key);
        const helperNotUsed = helperRes === undefined || helperRes === '' || helperRes === null;
        // TODO: check if we need to use the helper value or not
        let value = helperNotUsed ?
            await Utility_1.default.traverseKoliObjectString(key, this._data) :
            helperRes;
        if (helperNotUsed && this.isSignal(key))
            this._inlineSignals.push(key);
        blockEndPos = blockStartPos + (value || '').length;
        // TODO: in a single render line multiple signals could be used, hanlde that
        this.recordSignalUsage(this._inlineSignals, {
            block: oldBlock,
            start: blockStartPos,
            end: blockEndPos
        });
        this.replaceContent(oldBlock, value);
    }
    replaceContent(block, replacement, trim = false) {
        const content = this._content.replace(new RegExp(`${block}`.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')), replacement);
        this._content = !trim ? content : content.trim();
    }
    async subRender(body, data) {
        const koli = KoliJs(body, data, this._helpers);
        return await koli.render(this._config);
    }
    async execLoop(loopArray, loopBody, block) {
        loopArray = loopArray.trim();
        let blockStartPos = this._content.indexOf(block), blockEndPos, data = await Utility_1.default.traverseKoliObjectString(loopArray, this._data);
        let renderedContent = '';
        if (Array.isArray(data)) {
            let index = 1;
            for (let item of data) {
                renderedContent += await this.subRender(loopBody, Object.assign({}, this._data, { 'this': item, index }));
                index++;
            }
        }
        blockEndPos = blockStartPos + renderedContent.length;
        if (this.isSignal(loopArray)) {
            this.recordSignalUsage([loopArray], {
                block,
                start: blockStartPos,
                end: blockEndPos
            });
        }
        this.replaceContent(block, renderedContent);
    }
    async execNonOutput(inlineBlock) {
        let inlineBlockBody = inlineBlock.replace('{{~', '').replace('}}', '').trim();
        let helperRes = await this.useHelpers(inlineBlockBody);
        this.replaceContent(inlineBlock, '', true);
    }
    async execIf(ifArg, ifBody, block) {
        let data = await Utility_1.default.traverseKoliObjectString(ifArg, this._data);
        let elseBody;
        let ifEvaluation = Utility_1.default.isValueTruthy(data);
        const hasElse = Utility_1.default.blockHasElse(block);
        let renderedContent = '';
        if (hasElse) {
            const ifArray = ifBody.split('{{else}}');
            if (ifArray.length > 2)
                throw 'If block has more than two else statements';
            [ifBody, elseBody] = ifArray;
            if (!ifEvaluation)
                renderedContent += await this.subRender(elseBody, this._data);
        }
        if (ifEvaluation)
            renderedContent += await this.subRender(ifBody, this._data);
        this.replaceContent(block, renderedContent);
    }
    async execNot(notArg, notBody, block) {
        notArg = notArg.trim();
        let blockStartPos = this._content.indexOf(block), blockEndPos;
        let data = await Utility_1.default.traverseKoliObjectString(notArg, this._data);
        let argEvaluation = Utility_1.default.isValueTruthy(data);
        let renderedContent = ' ';
        if (!argEvaluation)
            renderedContent += await this.subRender(notBody, this._data);
        blockEndPos = blockStartPos + renderedContent.length;
        if (this.isSignal(notArg)) {
            this.recordSignalUsage([notArg], {
                block,
                start: blockStartPos,
                end: blockEndPos
            });
        }
        this.replaceContent(block, renderedContent);
    }
    async execSame(sameArg, sameBody, block) {
        const arrArgs = Utility_1.default.getParamsFromString(sameArg);
        let lastValue = null, same = true;
        for (let i = 0; i < arrArgs.length; i++) {
            const arg = arrArgs[i].trim();
            const paramIsStringLiteral = Utility_1.default.isStringLiteral(arg);
            const value = paramIsStringLiteral ?
                Utility_1.default.removeQuotes(arg) :
                await Utility_1.default.traverseKoliObjectString(arg, this._data);
            if (!lastValue) {
                lastValue = value;
                continue;
            }
            ;
            if (lastValue != value) {
                same = false;
                break;
            }
            lastValue = value;
        }
        let renderedContent = '', elseBody = '';
        const hasElse = Utility_1.default.blockHasElse(block);
        if (hasElse) {
            const ifArray = sameBody.split('{{else}}');
            if (ifArray.length > 2)
                throw 'If block has more than two else statements';
            [sameBody, elseBody] = ifArray;
            if (!same)
                renderedContent += await this.subRender(elseBody, this._data);
        }
        if (same)
            renderedContent += await this.subRender(sameBody, this._data);
        this.replaceContent(block, renderedContent);
    }
    async run() {
        // TODO: this is only a temp fix
        let content = this._content;
        let lexer = new Lexer_1.default(content);
        /**
         * TODO: Improve caching
         */
        const cacheKey = content + JSON.stringify(this._data) + JSON.stringify(this._headers), cacheContent = this._cache.find(cacheKey);
        if (this._cache && cacheContent && !this._config.allowTerminatorHelpers)
            return this._content = cacheContent;
        let block;
        while (block = lexer.nextBlock()) {
            const content = block.content, blockKind = block.kind, blockArg = block.isNestable ? block.data : '', blockBody = block.body;
            if (this._config.allowTerminatorHelpers && this._terminateNext)
                return;
            await this.findBlocks({ block: content, blockKind, blockArg, blockBody });
        }
        // do not cache any component that uses helpers like 'fetch'
        // it will prevent the same component from being compiled a second time even thou
        // the fetch would return different data
        if (!this._hasInternalDataFetch)
            this._cache.store(cacheKey, this._content);
    }
    async render(config = {}) {
        try {
            this._config = { ...this._config, ...config };
            await this.run();
        }
        catch (error) {
            console.error('Error:', error);
        }
        return this._content.trim();
    }
    snapshot() {
        return {
            data: this._data,
            signalUsage: this.signalUsage
        };
    }
}
const KoliJs = (content, data, helpers) => (new KoliEngine(content, data, helpers));
exports["default"] = KoliJs;


/***/ }),

/***/ "../kolijs/src/Cache.ts":
/*!******************************!*\
  !*** ../kolijs/src/Cache.ts ***!
  \******************************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
class KoliCache {
    _instance;
    _list = {};
    constructor() {
        if (this._instance)
            return this._instance;
        return this._instance = this;
    }
    find(key) {
        return this._list[key];
    }
    store(key, content) {
        this._list[key] = content;
    }
}
exports["default"] = KoliCache;


/***/ }),

/***/ "../kolijs/src/Datetime.ts":
/*!*********************************!*\
  !*** ../kolijs/src/Datetime.ts ***!
  \*********************************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
class Datetime {
    static getMonths = () => ([
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ]);
    static makeTime = (date) => {
        let hours = date.getHours(), minutes = date.getMinutes();
        hours = hours < 10 ? '0' + hours : hours;
        minutes = minutes < 10 ? '0' + minutes : minutes;
        let time = hours + ':' + minutes, day = date.getDate(), month = Datetime.getMonths()[date.getMonth()], year = date.getFullYear().toString();
        return { time, day, month, year };
    };
    static getStaticDate = (date) => {
        const { time, day, month, year } = Datetime.makeTime(new Date(date));
        return `${time}, ${day} ${month} ${year[2] + year[3]}'`;
    };
    static format(date, format = 'static') {
        const formats = {
            static: Datetime.getStaticDate
        };
        return formats[format](date);
    }
}
exports["default"] = Datetime;


/***/ }),

/***/ "../kolijs/src/Helpers.ts":
/*!********************************!*\
  !*** ../kolijs/src/Helpers.ts ***!
  \********************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
const Datetime_1 = __importDefault(__webpack_require__(/*! ./Datetime */ "../kolijs/src/Datetime.ts"));
const Utility_1 = __importDefault(__webpack_require__(/*! ./Utility */ "../kolijs/src/Utility.ts"));
class KoliHelpers {
    _list = {
        lowercase: this.lowercase,
        toString: this.arrayToString,
        arraylen: this.arraylen,
        fetch: this.fetch,
        as: this.as,
        set: this.set,
        concat: this.concat,
        signal: this.signal,
        datetime: this.datetime,
        readheader: this.readheader,
        minus: this.minus,
        json: this.json
    };
    _userDefinedHelpers = [];
    _terminatorHelpers = [];
    _data;
    _headers;
    setHelper(name, handler, terminateOnHelper) {
        this._userDefinedHelpers.push(name);
        if (terminateOnHelper)
            this._terminatorHelpers.push(name);
        this._list[name] = handler;
    }
    useHelper(name) {
        return this._list[name];
    }
    setData(data, headers) {
        this._data = data;
        this._headers = headers;
    }
    isHelper(name) {
        return this._list[name] ? true : false;
    }
    isUserHelper(name) {
        return this._userDefinedHelpers.includes(name);
    }
    isTerminatorHelper(name) {
        return this._terminatorHelpers.includes(name);
    }
    fetch(url, method) {
        return [{
                value: Utility_1.default.fetch(url.value, { method: method?.value }),
                _isPromise: true,
                _isKoliDefinedVar: true
            }];
    }
    readheader(header) {
        return this._headers[header.value];
    }
    signal(name, value) {
        this._data[name.value] = {
            value: value.value,
            _isSignal: true
        };
    }
    as(...args) {
        let varName = args[1].value, varValue = args[0];
        const data = this._data[varName];
        const isSignal = data && data._isSignal;
        this._data[varName] = isSignal ?
            { ...data, ...varValue } :
            varValue;
        return [varValue];
    }
    set(...args) {
        let data = [];
        args.forEach(arg => {
            data.push(arg.value);
        });
        return [{
                value: data.length > 1 ? data : data[0] || undefined,
                _isPromise: false,
                _isKoliDefinedVar: true
            }];
    }
    concat(...args) {
        let result = '';
        args.forEach(data => result += data.value);
        return result;
    }
    datetime(date, format) {
        return Datetime_1.default.format(date.value, format?.value);
    }
    lowercase(...args) {
        if (!args.every(({ value }) => typeof value == 'string'))
            throw 'lowercase helper takes in only strings';
        if (args.length == 1)
            return args[0].value.toLowerCase();
        const res = [];
        args.forEach(arg => {
            // TODO: Exit && Handle errors in a dedicated file
            if (typeof arg.value != 'string')
                throw `Expected a string but got '${typeof arg.value}'`;
            res.push(arg.value.toLowerCase());
        });
        return res;
    }
    arrayToString(...args) {
        let res = [];
        args.forEach(arg => {
            if (Array.isArray(arg.value))
                return res = res.concat(arg.value);
            res.push(arg.value);
        });
        return res.join(' ');
    }
    json(arg) {
        return JSON.stringify(arg.value);
    }
    minus(...args) {
        if (args.length < 2)
            return;
        let total = args[0].value;
        for (let i = 1; i < args.length; i++) {
            total -= args[i].value;
        }
        return total;
    }
    arraylen(...args) {
        const value = Array.isArray(args[0].value) ? args[0].value : [];
        return value.length;
    }
}
exports["default"] = KoliHelpers;


/***/ }),

/***/ "../kolijs/src/Lexer.ts":
/*!******************************!*\
  !*** ../kolijs/src/Lexer.ts ***!
  \******************************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
class Block {
    _isNestable;
    _blockKind;
    _behavior;
    data;
    content = '';
    body = '';
    constructor(_isNestable, _blockKind, _behavior, data) {
        this._isNestable = _isNestable;
        this._blockKind = _blockKind;
        this._behavior = _behavior;
        this.data = data;
    }
    get kind() {
        return this._blockKind;
    }
    get isNestable() {
        return this._isNestable;
    }
    getNewDepth(kind, depth) {
        if (!this._isNestable || kind != this._blockKind)
            return depth;
        if (this._behavior == 'open')
            return depth + 1;
        return depth - 1;
    }
    static extractDetails(name) {
        const behavior = name.charAt(0) == '#' ?
            'open' :
            name.charAt(0) == '/' ? 'close' : 'data';
        const kind = name.slice(1);
        return [kind, behavior];
    }
}
class Lexer {
    _txt;
    _index = 0;
    _numbers = '0123456789';
    _alpha = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    _concatToken = false;
    _nestingDepth = 0;
    _tagPairs = {
        '{{': '}}',
        '<<': '>>'
    };
    _closingTagsCallStack = [];
    _nestables = [
        'each',
        'if',
        'not',
        'same'
    ];
    constructor(_txt) {
        this._txt = _txt;
        this._index = 0;
    }
    get char() {
        return this._txt[this._index];
    }
    get isEOF() {
        return this._txt.length == this._index + 1;
    }
    get canContinue() {
        return !this.isEOF && this.char != null;
    }
    next() {
        this._index++;
    }
    makeString() {
        const letters = this._numbers + this._alpha;
        let str = '';
        while (this.char && letters.includes(this.char)) {
            str += this.char;
            this.next();
        }
        ;
        return str;
    }
    makeSpecialCharToken() {
        /**  @deprecated */
        const chars = `\`~!#$%^&*()-_=+{}[]|\\:;"'<>,.?/\t\n\r `;
        let str = '';
        const startingChar = this.char;
        while (/\W|_/.test(this.char) && startingChar == this.char) {
            str += this.char;
            this.next();
        }
        ;
        return str;
    }
    getToken() {
        let token = this.makeString() || this.makeSpecialCharToken();
        if (this._tagPairs[token] && !this._concatToken) {
            this._concatToken = true;
            this._closingTagsCallStack.push(this._tagPairs[token]);
        }
        else if (token == this._closingTagsCallStack[0]) {
            this._concatToken = false;
            this._closingTagsCallStack.shift();
        }
        // if (token == '{{' && !this._concatToken) {
        //     this._concatToken = true;
        // }
        // else if (token == '}}') this._concatToken = false;
        token += this._concatToken ? this.getToken() : '';
        return token;
    }
    isBlock(token) {
        return token.startsWith('{{') || token.startsWith('<<');
    }
    makeBlock(token) {
        const cleanToken = token.replace(/{{|}}|\<\<|\>\>/g, '');
        const tokenArr = cleanToken.split(' ');
        let tokenName = tokenArr[0];
        let tempArr = [...tokenArr];
        tempArr.shift();
        let tokenData = tempArr.join(' ');
        let [kind, behavior] = Block.extractDetails(tokenName);
        if (behavior == 'data') {
            tokenData = kind = tokenArr.join(' ');
        }
        return new Block(this._nestables.includes(kind), kind, behavior, tokenData);
    }
    nextBlock() {
        let isMatchFound = false;
        let parent;
        while (this.canContinue && !isMatchFound) {
            const token = this.getToken();
            const isBlock = this.isBlock(token);
            if (isBlock) {
                const block = this.makeBlock(token);
                if (this._nestingDepth == 0) {
                    parent = block;
                    parent.content += token;
                    if (parent.isNestable)
                        this._nestingDepth++;
                    else
                        break;
                    continue;
                }
                ;
                this._nestingDepth = block.getNewDepth(parent.kind, this._nestingDepth);
                if (parent?.isNestable)
                    parent.content += token;
                if ((block.kind == parent.kind && this._nestingDepth == 0))
                    isMatchFound = true;
                else if (parent?.isNestable == true)
                    parent.body += token;
            }
            else if (!isBlock && parent?.isNestable == true && this._nestingDepth > 0) {
                parent.content += token;
                parent.body += token;
            }
            else if (!isBlock && parent?.isNestable == true && this._nestingDepth > 0) {
                parent.content += token;
                parent.body += token;
            }
        }
        return parent;
    }
}
exports["default"] = Lexer;


/***/ }),

/***/ "../kolijs/src/Utility.ts":
/*!********************************!*\
  !*** ../kolijs/src/Utility.ts ***!
  \********************************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
class Utility {
    static async fetch(url, { method = 'POST', headers = { 'Content-Type': 'application/json;charset=utf-8' }, body = {} } = {}) {
        const response = await fetch(url, { method, body: JSON.stringify(body) });
        return await response.json();
    }
    ;
    static isValueTruthy(value) {
        if (value === undefined || value === null || value == 0 || value == "" || value == 'false')
            return false;
        if (typeof value == 'object') {
            if (Object.keys(value).length > 0)
                return true;
            return false;
        }
        return true;
    }
    static getParamsFromString(text) {
        let openQuote, element = "", isLastChar = false;
        const params = [];
        for (let i = 0; i < text.length; i++) {
            let char = text[i];
            isLastChar = i + 1 == text.length;
            if (!openQuote && ['"', "'"].includes(char)) {
                openQuote = char;
                continue;
            }
            else if ((openQuote && char === openQuote) ||
                (char === ' ' && element && !openQuote) ||
                (isLastChar && element && !openQuote)) {
                if (isLastChar && !openQuote)
                    element += char;
                params.push(openQuote ?
                    `"${element}"` :
                    element);
                element = '';
                openQuote = null;
                continue;
            }
            else if (openQuote || !openQuote && char != ' ')
                element += char;
        }
        return params;
    }
    static isStringLiteral(str) {
        let quote = str[0];
        if (['"', "'"].includes(quote) && quote == str[str.length - 1])
            return true;
        return false;
    }
    static blockHasElse(ifBlock) {
        let elsePos = ifBlock.indexOf("{{else}}");
        return elsePos > -1;
    }
    static replaceStringAt(str, replacement, idx) {
        return str.slice(0, idx) + replacement + str.slice(idx + replacement.length);
    }
    static removeQuotes(str) {
        return str.substring(str.length, 1).substring(0, str.length - 2);
    }
    static getRealObjectValue(data) {
        if (data && data._isKoliDefinedVar)
            return Utility.getRealObjectValue(data.value);
        return data;
    }
    static async traverseKoliObjectString(str, data) {
        const props = str.split('.');
        if (props.length == 0)
            return [];
        let parent = null;
        let nextPropIsArray = false;
        let nextArrayIndex;
        for (let i = 0; i < props.length; i++) {
            let prop = props[i].trim();
            if (prop.indexOf('[') >= 0) {
                let [newProp, index] = prop.split('[');
                index = index.replace(']', '');
                nextPropIsArray = true;
                prop = newProp;
                nextArrayIndex = parseInt(index);
            }
            parent = parent ? parent[prop] : data[prop];
            if (parent === undefined || parent === null)
                return parent;
            if (parent._isKoliDefinedVar && !parent._isPromise) {
                if (parent.value === undefined)
                    return undefined;
                parent = parent.value;
            }
            if (parent._isKoliDefinedVar && parent._isPromise) {
                parent = await parent.value;
                if (typeof parent == 'function')
                    parent = await parent();
            }
            ;
            if (nextPropIsArray) {
                parent = parent[nextArrayIndex];
                nextPropIsArray = false;
            }
        }
        if (parent && parent._isSignal)
            return parent.value;
        return parent;
    }
}
exports["default"] = Utility;


/***/ }),

/***/ "../oddlyjs/index.ts":
/*!***************************!*\
  !*** ../oddlyjs/index.ts ***!
  \***************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.signal = exports.watch = exports.Environment = exports.Middleware = exports.Events = exports.Refresh = exports.Next = exports.Load = exports.Router = exports.Route = exports.Config = void 0;
const Config_1 = __importDefault(__webpack_require__(/*! ./src/Config */ "../oddlyjs/src/Config.ts"));
exports.Config = Config_1.default;
const Events_1 = __importDefault(__webpack_require__(/*! ./src/Events */ "../oddlyjs/src/Events.ts"));
exports.Events = Events_1.default;
const Middleware_1 = __importDefault(__webpack_require__(/*! ./src/Middleware */ "../oddlyjs/src/Middleware.ts"));
exports.Middleware = Middleware_1.default;
const Environment_1 = __importDefault(__webpack_require__(/*! ./src/Environment */ "../oddlyjs/src/Environment.ts"));
exports.Environment = Environment_1.default;
const Router_1 = __importDefault(__webpack_require__(/*! ./src/Router */ "../oddlyjs/src/Router/index.ts"));
exports.Router = Router_1.default;
const Route_1 = __importDefault(__webpack_require__(/*! ./src/Router/Route */ "../oddlyjs/src/Router/Route.ts"));
exports.Route = Route_1.default;
const App_1 = __webpack_require__(/*! ./src/App */ "../oddlyjs/src/App.ts");
Object.defineProperty(exports, "Load", ({ enumerable: true, get: function () { return App_1.Load; } }));
Object.defineProperty(exports, "Next", ({ enumerable: true, get: function () { return App_1.Next; } }));
Object.defineProperty(exports, "Refresh", ({ enumerable: true, get: function () { return App_1.Refresh; } }));
const Signal_1 = __webpack_require__(/*! ./src/Signal */ "../oddlyjs/src/Signal/index.ts");
Object.defineProperty(exports, "watch", ({ enumerable: true, get: function () { return Signal_1.watch; } }));
Object.defineProperty(exports, "signal", ({ enumerable: true, get: function () { return Signal_1.signal; } }));
exports["default"] = {
    Config: Config_1.default,
    Route: Route_1.default,
    Router: Router_1.default,
    Load: App_1.Load,
    Next: App_1.Next,
    Refresh: App_1.Refresh,
    Events: Events_1.default,
    Middleware: Middleware_1.default,
    Environment: Environment_1.default,
    watch: Signal_1.watch,
    signal: Signal_1.signal
};


/***/ }),

/***/ "../oddlyjs/src/App.ts":
/*!*****************************!*\
  !*** ../oddlyjs/src/App.ts ***!
  \*****************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Refresh = exports.Next = exports.Load = void 0;
const URL_1 = __importDefault(__webpack_require__(/*! ./URL */ "../oddlyjs/src/URL.ts"));
const Router_1 = __importDefault(__webpack_require__(/*! ./Router */ "../oddlyjs/src/Router/index.ts"));
const Layouts_1 = __importDefault(__webpack_require__(/*! ./Layouts */ "../oddlyjs/src/Layouts/index.ts"));
const Middleware_1 = __importDefault(__webpack_require__(/*! ./Middleware */ "../oddlyjs/src/Middleware.ts"));
const Environment_1 = __importDefault(__webpack_require__(/*! ./Environment */ "../oddlyjs/src/Environment.ts"));
const KolijsHelpers_1 = __webpack_require__(/*! ./KolijsHelpers */ "../oddlyjs/src/KolijsHelpers.ts");
const Load = async () => {
    const { headers } = await URL_1.default.tryPath(URL_1.default.path);
    (0, KolijsHelpers_1.initHelpers)();
    Environment_1.default.initUserHelpers();
    Router_1.default.setCurrentRoute();
    Router_1.default.currentRoute.headers = headers;
    Layouts_1.default.build();
    Middleware_1.default.run();
};
exports.Load = Load;
const Next = (url) => {
    (async () => {
        const { path, headers } = await URL_1.default.tryPath(url);
        Router_1.default.setCurrentRoute(path);
        Router_1.default.currentRoute.headers = headers;
        Layouts_1.default.next(path);
        Middleware_1.default.run();
    })();
};
exports.Next = Next;
const Refresh = () => {
    (async () => {
        const { path, headers } = await URL_1.default.tryPath(URL_1.default.path);
        Router_1.default.setCurrentRoute(path);
        Router_1.default.currentRoute.headers = headers;
        Layouts_1.default.next(path);
        Middleware_1.default.run();
    })();
};
exports.Refresh = Refresh;


/***/ }),

/***/ "../oddlyjs/src/Components/Component.ts":
/*!**********************************************!*\
  !*** ../oddlyjs/src/Components/Component.ts ***!
  \**********************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
const Environment_1 = __importDefault(__webpack_require__(/*! ../Environment */ "../oddlyjs/src/Environment.ts"));
const Router_1 = __importDefault(__webpack_require__(/*! ../Router */ "../oddlyjs/src/Router/index.ts"));
const Util_1 = __importDefault(__webpack_require__(/*! ../Util */ "../oddlyjs/src/Util.ts"));
class Component {
    _path;
    _content;
    _rawContent;
    _data;
    _signalUsage = {};
    _scope = [];
    constructor(component) {
        this._path = component.path;
        this._content = component.content;
    }
    get data() {
        return this._data;
    }
    get signalUsage() {
        return this._signalUsage;
    }
    get content() {
        return this._content;
    }
    set scope(scope) {
        this._scope = scope;
    }
    isInScope() {
        if (!this._scope || this._scope && this._scope.length == 0)
            return true;
        if (this._scope && this._scope[0] === 'all')
            return true;
        return this._scope.includes(Router_1.default.currentRoute.name);
    }
    async parse(allowTerminatorHelpers, allowCache) {
        this._rawContent = this._rawContent || await Util_1.default.fetch(this._path);
        Environment_1.default.kolijs.setContext({
            content: this._rawContent,
            file: this._path,
            data: {
                componentPath: this._path,
                ...Environment_1.default.globalContainer
            },
            headers: Router_1.default.currentRoute.headers
        });
        this._content = await Environment_1.default.kolijs.render({
            allowTerminatorHelpers,
            cache: allowCache
        });
        const { data, signalUsage } = Environment_1.default.kolijs.snapshot();
        this._data = data;
        this._signalUsage = signalUsage;
    }
}
exports["default"] = Component;


/***/ }),

/***/ "../oddlyjs/src/Components/index.ts":
/*!******************************************!*\
  !*** ../oddlyjs/src/Components/index.ts ***!
  \******************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
const Component_1 = __importDefault(__webpack_require__(/*! ./Component */ "../oddlyjs/src/Components/Component.ts"));
exports["default"] = new (class Components {
    static instance;
    _components = {};
    use(path) {
        return this._components[path];
    }
    exists(path) {
        return this._components[path] ? true : false;
    }
    async add(path) {
        if (this.exists(path))
            return;
        this._components[path] = new Component_1.default({ path, content: '' });
    }
});


/***/ }),

/***/ "../oddlyjs/src/Config.ts":
/*!********************************!*\
  !*** ../oddlyjs/src/Config.ts ***!
  \********************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
const URL_1 = __importDefault(__webpack_require__(/*! ./URL */ "../oddlyjs/src/URL.ts"));
exports["default"] = new (class Config {
    static instance;
    _options = {
        logs: {
            warn: true,
            info: false
        },
        mode: 'non-edit',
        views: {
            base: '/assets/js/src/',
            components: 'components',
            layouts: 'layouts',
            ext: 'hbs',
            parentClass: 'oddlyjs-container'
        },
        page: {
            title: 'Made with oddlyjs'
        }
    };
    constructor() {
        if (Config.instance) {
            Config.instance = this;
        }
        return Config.instance;
    }
    get viewsExt() {
        return this._options.views.ext;
    }
    get baseViews() {
        return URL_1.default.cleanURL(this._options.mode == 'edit' ?
            `http://localhost:8080//${this._options.views.base}` :
            `${URL_1.default.host}//${this._options.views.base}`);
    }
    get componentViews() {
        return URL_1.default.cleanURL(this.baseViews + '/' + this._options.views.components);
    }
    get layoutViews() {
        return URL_1.default.cleanURL(this.baseViews + '/' + this._options.views.layouts);
    }
});


/***/ }),

/***/ "../oddlyjs/src/Environment.ts":
/*!*************************************!*\
  !*** ../oddlyjs/src/Environment.ts ***!
  \*************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
const kolijs_1 = __importDefault(__webpack_require__(/*! kolijs */ "../kolijs/App.ts"));
exports["default"] = new (class Environment {
    static instance;
    _kolijs;
    _container;
    _userDefHelpers = {};
    _globalContainer;
    constructor() {
        if (Environment.instance)
            return Environment.instance;
        this._kolijs = (0, kolijs_1.default)();
        this._globalContainer = {};
        this._container = {};
        Environment.instance = this;
    }
    get globalContainer() {
        return this._globalContainer;
    }
    get kolijs() {
        return this._kolijs;
    }
    /**
     * @deprecated
     */
    isEmptyStorage(data) {
        if (data == undefined || !data)
            return true;
        return false;
    }
    getFromLocalStorage(key = '') {
        let data = localStorage.getItem('oddlyjs-cache') || '{}';
        data = JSON.parse(!this.isEmptyStorage(data) ? data : '{}');
        return key ? data?.[key] : data;
    }
    setHelper(key, callback) {
        this._userDefHelpers[key] = callback;
    }
    initUserHelpers() {
        for (const key in this._userDefHelpers) {
            if (this._userDefHelpers.hasOwnProperty(key))
                this._kolijs.setHelper(key, this._userDefHelpers[key]);
        }
    }
    saveToLocalStorage(key, value) {
        const data = this.getFromLocalStorage();
        data[key] = value;
        localStorage.setItem('oddlyjs-cache', JSON.stringify(data));
    }
    put(key, value, isGlobal = false) {
        this._container[key] = value;
        if (isGlobal)
            this._globalContainer[key] = value;
        // this.saveToLocalStorage(key, value)
    }
    get(key) {
        return this._container[key];
        // return this.getFromLocalStorage(key)
    }
    remove(key) {
        // const data = this.getFromLocalStorage();
        if (this._container[key])
            delete this._container[key];
        if (this._globalContainer[key])
            delete this._container[key];
        // localStorage.setItem('oddlyjs-cache', JSON.stringify(data))
    }
});


/***/ }),

/***/ "../oddlyjs/src/Events.ts":
/*!********************************!*\
  !*** ../oddlyjs/src/Events.ts ***!
  \********************************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
class Events {
    static instance;
    _eventHandlers = {};
    constructor(obj) {
        if (!Events.instance)
            Events.instance = this;
        if (obj)
            Events.instance.addEventHandlers(obj);
        return Events.instance;
    }
    addEventHandlers(obj) {
        Object.getOwnPropertyNames(Object.getPrototypeOf(obj)).forEach(eventHandler => {
            if (eventHandler == 'constructor')
                return;
            this._eventHandlers[`${obj.constructor.name + '.' + eventHandler}`] = Object.getPrototypeOf(obj)[eventHandler].bind(obj);
        });
    }
    makeGlobal(path, globalMethodName) {
        window[globalMethodName] = this._eventHandlers[path];
    }
}
exports["default"] = Events;


/***/ }),

/***/ "../oddlyjs/src/KolijsHelpers.ts":
/*!***************************************!*\
  !*** ../oddlyjs/src/KolijsHelpers.ts ***!
  \***************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.initHelpers = void 0;
const Environment_1 = __importDefault(__webpack_require__(/*! ./Environment */ "../oddlyjs/src/Environment.ts"));
const Components_1 = __importDefault(__webpack_require__(/*! ./Components */ "../oddlyjs/src/Components/index.ts"));
const Util_1 = __importDefault(__webpack_require__(/*! ./Util */ "../oddlyjs/src/Util.ts"));
const Events_1 = __importDefault(__webpack_require__(/*! ./Events */ "../oddlyjs/src/Events.ts"));
const EventTypes_1 = __importDefault(__webpack_require__(/*! ./Lexer/EventTypes */ "../oddlyjs/src/Lexer/EventTypes.ts"));
const initHelpers = () => {
    const events = new Events_1.default();
    Environment_1.default.kolijs.setHelper('component', function (...componentUrls) {
        for (let i = 0; i < componentUrls.length; i++) {
            const url = Util_1.default.resolveComponentPath(componentUrls[i]);
            componentUrls[i] = url;
            Components_1.default.add(url);
        }
        // TODO: if auto escaping is implemented, return this as raw
        return `@component;${JSON.stringify(componentUrls)}@end;`;
    });
    Environment_1.default.kolijs.setHelper('scope', function (...scope) {
        const componentPath = Environment_1.default.kolijs.data.componentPath;
        if (!scope[0])
            throw `Error: Scope not specified at: ${componentPath}`;
        Components_1.default.use(componentPath)
            .scope = scope;
    }, true);
    Environment_1.default.kolijs.setHelper('globalLinkActive', function (str) {
        const linkActiveClassArr = str.split('data:');
        return linkActiveClassArr.length == 1 ?
            `link_active_class ${str};` :
            `link_active_class ${Environment_1.default.get(linkActiveClassArr[1])};`;
    });
    Environment_1.default.kolijs.setHelper('link', function (str) {
        return `data-linkaddress="${str}"`;
    });
    Environment_1.default.kolijs.setHelper('linkActive', function (str) {
        return `data-linkactive="${str}"`;
    });
    Environment_1.default.kolijs.setHelper('cutstr', function (str, length, offset) {
        length = parseInt(length);
        let offsetLength = offset && offset.length < 40 ? 40 - offset.length : 0;
        if (str.length <= offsetLength + length)
            return str;
        return `${str.slice(0, length + offsetLength + 1)}...`;
    });
    EventTypes_1.default.forEach(eventType => {
        Environment_1.default.kolijs.setHelper(eventType, function (...fns) {
            let res = `on${eventType}="`;
            fns.forEach((fn) => {
                const openParanPos = fn.indexOf('(');
                const eventMethodPath = fn.slice(0, openParanPos);
                const params = fn.slice(openParanPos);
                const globalMethodName = eventMethodPath.replace('.', '_');
                events.makeGlobal(eventMethodPath, globalMethodName);
                res += `${globalMethodName}${params};`;
            });
            return `${res}"`;
        });
    });
};
exports.initHelpers = initHelpers;


/***/ }),

/***/ "../oddlyjs/src/Layouts/Layout.ts":
/*!****************************************!*\
  !*** ../oddlyjs/src/Layouts/Layout.ts ***!
  \****************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
const Util_1 = __importDefault(__webpack_require__(/*! ../Util */ "../oddlyjs/src/Util.ts"));
const Middleware_1 = __importDefault(__webpack_require__(/*! ../Middleware */ "../oddlyjs/src/Middleware.ts"));
const Environment_1 = __importDefault(__webpack_require__(/*! ../Environment */ "../oddlyjs/src/Environment.ts"));
const Components_1 = __importDefault(__webpack_require__(/*! ../Components */ "../oddlyjs/src/Components/index.ts"));
const Blueprint_1 = __importDefault(__webpack_require__(/*! ../Lexer/Blueprint */ "../oddlyjs/src/Lexer/Blueprint.ts"));
const Router_1 = __importDefault(__webpack_require__(/*! ../Router */ "../oddlyjs/src/Router/index.ts"));
class Layout {
    _path;
    _content;
    _nestedComponentIndex = 0;
    _allowComponentCache = true;
    _nestedComponentsIndices = {};
    _rawContent;
    _componentCallStack = {};
    constructor(layout) {
        this._path = layout.path,
            this._content = layout.content;
    }
    get content() {
        return this._content;
    }
    async resolveComponents(components, parent = 'none') {
        for (let i = 0; i < components.length; i++) {
            const component = components[i], componentPath = component.componentPath, componentContent = Components_1.default.use(componentPath).content.trim(), componentNames = Util_1.default.extractComponentNames(componentContent);
            const descendantComponents = await this.getDescendantComponents(componentNames);
            this._componentCallStack[componentPath] = this._componentCallStack[componentPath] || ``;
            this._componentCallStack[componentPath] += parent != 'none' ?
                ` ${parent + ' ' + this._componentCallStack[parent]}` :
                '';
            if (this._componentCallStack[componentPath].split(' ').indexOf(componentPath) > 0)
                throw `Recursive inclusion of component: \n\t${componentPath}\n`;
            if (parent != 'none') {
                this._nestedComponentIndex =
                    Util_1.default.cleanHTMLContent(this._content).indexOf(`@component;${component.group}@end;`, this._nestedComponentIndex);
                this._nestedComponentsIndices[parent] = this._nestedComponentsIndices[parent] || [];
                this._nestedComponentsIndices[parent].push({
                    start: this._nestedComponentIndex,
                    fullLength: componentContent.length,
                    offset: `@component;${component.group}@end;`.length
                });
            }
            this._content = this._content.replace(new RegExp(`@component;${Util_1.default.escapeRegex(component.group)}@end;`, 'i'), `${parent != 'none' ? componentContent : 'component_start ' + componentPath + ';' + componentContent + ' component_end'}`);
            if (descendantComponents) {
                await this.resolveComponents(descendantComponents, component.componentPath);
            }
        }
    }
    async getDescendantComponents(componentNames) {
        const finalComponents = [];
        for (let g = 0; g < componentNames.length; g++) {
            const componentGroup = JSON.parse(componentNames[g]);
            for (let c = 0; c < componentGroup.length; c++) {
                const componentPath = componentGroup[c];
                const component = Components_1.default.use(componentPath);
                await component.parse(true, this._allowComponentCache);
                if (component.isInScope()) {
                    await component.parse(false, this._allowComponentCache);
                    finalComponents.push({
                        group: componentNames[g],
                        componentPath
                    });
                    break;
                }
            }
        }
        for (let i = 0; i < componentNames.length; i++) {
            const finalComponent = finalComponents[i];
            if (!finalComponent || finalComponent.group != componentNames[i])
                throw `Error: group or component out of scope \n\t(${componentNames[i]})`;
            const component = Components_1.default.use(finalComponent.componentPath);
            // TODO: too many rewrites, fixit
            Router_1.default.currentRoute.data =
                { ...Router_1.default.currentRoute.data, ...component.data };
            Router_1.default.currentRoute.signalUsage =
                { ...Router_1.default.currentRoute.signalUsage, ...component.signalUsage };
        }
        return finalComponents;
    }
    removeLabels() {
        this._content = Util_1.default.cleanHTMLContent(this._content);
    }
    build(contentRegenate = false) {
        Middleware_1.default.once(async (next) => {
            this._allowComponentCache = false;
            this._rawContent = this._rawContent || await Util_1.default.fetch(Util_1.default.resolveLayoutPath(this._path));
            const layoutContent = this._rawContent;
            this._content = await Environment_1.default.kolijs.setContext({
                content: layoutContent,
                headers: Router_1.default.currentRoute.headers,
            }).render();
            const componentNames = Util_1.default.extractComponentNames(this._content);
            const descendantComponents = await this.getDescendantComponents(componentNames);
            await this.resolveComponents(descendantComponents);
            const route = Router_1.default.currentRoute;
            if (!contentRegenate) {
                const blueprint = new Blueprint_1.default(this._path, this._content);
                const { blueprint: _blueprint, elementIndex, events } = blueprint.makeBlueprint();
                route.blueprint = _blueprint;
                route.events = events;
                route.elementIndex = elementIndex;
            }
            route.content = this._content;
            route.nestedComponentsIndices = this._nestedComponentsIndices;
            route.componentCallStack = this._componentCallStack;
            this.removeLabels();
            next();
        });
    }
    getElement(element) {
        if (!element)
            throw 'Could not find element to make parent';
        return element.id.type == 'id' ?
            document.getElementById(element.id.value) :
            document.getElementsByClassName(element.id.value)[0];
    }
    removeUnusedElements() {
        let removedParents = [];
        let currentElementIndex = Router_1.default.currentRoute.elementIndex, currentBlueprint = Router_1.default.currentRoute.blueprint, oldBlueprint = Router_1.default.lastRoute.blueprint;
        for (let i = 0; i < oldBlueprint.length; i++) {
            let element = oldBlueprint[i], id = element.id.value;
            if (currentElementIndex[id] >= 0 && (this.haveSameParent(element.parent?.id, currentBlueprint[currentElementIndex[id]].parent?.id)))
                continue;
            if (element.isParent)
                removedParents.push(id);
            if (element.parent?.id.value && !removedParents.includes(element.parent?.id.value))
                this.getElement(element)?.remove();
        }
    }
    getParent(element) {
        return element.parent?.id.value == 'root' ?
            document.getElementsByClassName('oddlyjs-container')[0] :
            this.getElement(element.parent);
    }
    haveSameParent(parent1Id, parent2Id) {
        return (parent1Id.value == parent2Id.value &&
            parent1Id.type == parent2Id.type);
    }
    /**
     * Adds new elements not used by old blueprint
     * @date 2022-08-08
     * @param {object} oldBlueprint
     * @param {object} currentBlueprint
     */
    addNewElements() {
        let currentElementIndex = Router_1.default.currentRoute.elementIndex, oldElementIndex = Router_1.default.lastRoute.elementIndex, currentBlueprint = Router_1.default.currentRoute.blueprint, oldBlueprint = Router_1.default.lastRoute.blueprint;
        for (let i = 0; i < currentBlueprint.length; i++) {
            const element = currentBlueprint[i], id = element.id.value, oldElement = oldBlueprint[oldElementIndex[id]];
            if (!(oldElementIndex[id] >= 0) || oldElementIndex[id] >= 0 &&
                !this.haveSameParent(element.parent?.id, oldElement.parent?.id)) {
                let previousElement = currentBlueprint[currentElementIndex[id] - 1];
                const newElement = document.createElement(element.element.type);
                Util_1.default.getModifierKeyValuePair(element.modifiers.trim(), (key, value) => {
                    key = key.trim();
                    if (key)
                        newElement.setAttribute(key, value);
                });
                newElement.innerHTML = element.element.innerText;
                if (previousElement && element.hierachy == previousElement.hierachy) {
                    let sibling = this.getElement(previousElement);
                    if (sibling && sibling.parentNode)
                        sibling.parentNode.insertBefore(newElement, sibling.nextSibling);
                }
                else {
                    let parent = this.getParent(element);
                    if (parent)
                        parent.append(newElement);
                }
            }
            else if (oldElement && (oldElement.element.innerText != element.element.innerText)) {
                const elementToChange = this.getElement(element);
                if (elementToChange)
                    elementToChange.innerHTML = element.element.innerText;
            }
        }
    }
}
exports["default"] = Layout;


/***/ }),

/***/ "../oddlyjs/src/Layouts/index.ts":
/*!***************************************!*\
  !*** ../oddlyjs/src/Layouts/index.ts ***!
  \***************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
const Layout_1 = __importDefault(__webpack_require__(/*! ./Layout */ "../oddlyjs/src/Layouts/Layout.ts"));
const Router_1 = __importDefault(__webpack_require__(/*! ../Router */ "../oddlyjs/src/Router/index.ts"));
const Middleware_1 = __importDefault(__webpack_require__(/*! ../Middleware */ "../oddlyjs/src/Middleware.ts"));
const Util_1 = __importDefault(__webpack_require__(/*! ../Util */ "../oddlyjs/src/Util.ts"));
exports["default"] = new (class Layouts {
    layouts = {};
    static instance;
    constructor() {
        if (!Layouts.instance) {
            Util_1.default.createDOMContainer();
            Layouts.instance = this;
        }
        return Layouts.instance;
    }
    exists(layoutPath) {
        return this.layouts[layoutPath] ? true : false;
    }
    addLayout(path) {
        if (this.exists(path))
            return this.layouts[path];
        return this.layouts[path] = new Layout_1.default({
            path,
            content: ''
        });
    }
    getLayout(layoutPath) {
        return this.layouts[layoutPath];
    }
    buildLayout(layout) {
        return layout.build();
    }
    build(contentRegenate = false) {
        const layoutpath = Router_1.default.currentRoute.layoutpath;
        if (!layoutpath)
            throw 'Error: Path to layout not specified';
        let layout = this.addLayout(layoutpath);
        layout.build(contentRegenate);
        if (!contentRegenate) {
            Middleware_1.default.once(() => {
                Util_1.default.prependToBody(layout.content);
                Router_1.default.currentRoute.initDOMLoaded();
            });
        }
    }
    next(url) {
        const currentLayoutpath = Router_1.default.currentRoute.layoutpath;
        if (!currentLayoutpath)
            throw 'Error: Path to layout not specified';
        let layout;
        layout = this.addLayout(currentLayoutpath);
        layout.build();
        Router_1.default.currentRoute.updateHistory(url);
        Middleware_1.default.once(() => {
            layout.removeUnusedElements();
            layout.addNewElements();
            Router_1.default.currentRoute.initDOMLoaded();
        });
    }
});


/***/ }),

/***/ "../oddlyjs/src/Lexer/Blueprint.ts":
/*!*****************************************!*\
  !*** ../oddlyjs/src/Lexer/Blueprint.ts ***!
  \*****************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
const Chars_1 = __webpack_require__(/*! ./Chars */ "../oddlyjs/src/Lexer/Chars.ts");
const EventTypes_1 = __importDefault(__webpack_require__(/*! ./EventTypes */ "../oddlyjs/src/Lexer/EventTypes.ts"));
const Lexer_1 = __importDefault(__webpack_require__(/*! ./Lexer */ "../oddlyjs/src/Lexer/Lexer.ts"));
class Blueprint extends Lexer_1.default {
    _layoutName;
    _blueprint = [];
    _events = {
        counter: 0,
        list: new Array()
    };
    _componentTree = [];
    _elementIndex = {};
    constructor(name, layout) {
        super(layout);
        this._layoutName = name;
    }
    get currentComponent() {
        return this._componentTree[this._componentTree.length - 1];
    }
    getParent(hierachy) {
        let parent = {
            id: {
                type: 'root',
                value: 'root'
            },
            element: {
                innerText: '',
                type: '',
                startPos: 0
            },
            isParent: false,
            component: {
                isComponent: false,
                innerHTML: ''
            },
            hierachy: 0,
            modifiers: '',
            parent: null
        };
        for (let i = this._blueprint.length - 1; i >= 0; i--) {
            const element = this._blueprint[i];
            if (element.hierachy == hierachy) {
                parent.id = {
                    type: element.id.type,
                    value: element.id.value
                };
                this._blueprint[this._elementIndex[element.id.value]].isParent = true;
                break;
            }
        }
        return parent;
    }
    getNonParents(callback) {
        this._blueprint.forEach(element => {
            if (!element.isParent) {
                callback(element);
            }
        });
    }
    getModifier(name, endPos) {
        const pos = this.layout.indexOf(`${name}=`, this.pos.index);
        let modifier = '', quotationMarks = 0, index = pos + name.length + 1;
        if (pos == -1 || pos >= endPos)
            return { modifier: '', pos };
        do {
            if (`"'`.includes(this.layout[index])) {
                quotationMarks++;
                index++;
                continue;
            }
            modifier += this.layout[index];
            index++;
        } while (quotationMarks < 2);
        return { modifier, pos };
    }
    /** @deprecated */
    getEvents(str) {
        let events = [];
        for (let i = 0; i < str.length; i++) {
            let event = '';
            while (Chars_1.alpha.includes(str[i])) {
                event += str[i];
                i++;
            }
            ;
            if (EventTypes_1.default.includes(event))
                events.push(event);
        }
        return events;
    }
    /** @deprecated */
    parseEvents(token, tokenIndex, currentIndex) {
        let outsideParam = true, mainQuotes = '', end = false, index = tokenIndex, strevents = '';
        while (!end) {
            ++index;
            if (outsideParam && this.layout[index] == ' ') {
                continue;
            }
            else if (mainQuotes && `"'`.includes(this.layout[index]) && this.layout[index] != mainQuotes) {
                outsideParam = !outsideParam;
            }
            else if (!mainQuotes && (this.layout[index] == '\'' || this.layout[index] == '"')) {
                mainQuotes = this.layout[index];
                continue;
            }
            else if (mainQuotes && this.layout[index] == mainQuotes) {
                end = true;
                const eventPointer = `data-eventid="${this._events.counter}"`, defStart = tokenIndex - token.length, defEnd = index + 1;
                const eventDefinition = this.layout.substring(defStart, defEnd);
                this.layout = this.layout.replace(eventDefinition, eventPointer);
                this.pos.index = currentIndex;
                this._events.counter++;
                continue;
            }
            strevents += this.layout[index];
        }
        const events = {};
        const eventArr = strevents.trim().split(';');
        eventArr.forEach(event => {
            const lParamPos = event.indexOf('(');
            const params = event.substring(lParamPos + 1, event.length - 1);
            const resolvedParams = [];
            params.split(',').forEach(param => {
                if (`'"`.includes(param.charAt(0)))
                    return resolvedParams.push(param.substring(1, param.length - 1));
                resolvedParams.push(param);
            });
            events[event.substring(0, lParamPos)] = [token, resolvedParams];
        });
        this._events.list.push(events);
    }
    makeBlueprint() {
        let previousToken = '', hierachy = 0, elementCount = 0, isInsideComponent = false, totalComponentLines = 1, classes = [];
        while (this.currentChar != null) {
            if (this.currentChar == "\n" && isInsideComponent) {
                this.currentComponent.line++;
                totalComponentLines++;
            }
            if (" \t\r".includes(this.currentChar)) {
                this.next();
                continue;
            }
            let token = this.getToken();
            if (previousToken == 'component_start') {
                this._componentTree.push({
                    line: 0,
                    name: token,
                    parent: isInsideComponent ? this.currentComponent.name : 'none',
                    hasRoot: false,
                    rootHierachy: hierachy + 1
                });
                isInsideComponent = true;
            }
            else if (token == 'component_end') {
                if (this.currentComponent.parent == 'none')
                    isInsideComponent = false;
                this._componentTree.pop();
            }
            else if (Chars_1.elements.includes(token) && this.lookBehind(token) == '<') {
                ++hierachy;
                let lastCharPosOTag = this.layout.indexOf('>', this.pos.index);
                let modifiers = this.layout.substring(this.pos.index, lastCharPosOTag);
                let { modifier: id, pos: idPod } = this.getModifier('id', lastCharPosOTag);
                let { modifier: _class, pos: classPos } = this.getModifier('class', lastCharPosOTag);
                _class = _class ? _class.split(' ')[0] : '';
                let classIsUniq = false;
                let events = []; //this.getEvents(modifiers)
                let currentTokenIndex = this.pos.index;
                events.forEach(event => {
                    const eventDefPos = modifiers.indexOf(event);
                    if (eventDefPos != -1) {
                        this.parseEvents(event, eventDefPos + event.length + this.pos.index, currentTokenIndex);
                    }
                });
                lastCharPosOTag = this.layout.indexOf('>', this.pos.index);
                modifiers = this.layout.substring(this.pos.index, lastCharPosOTag);
                if (isInsideComponent && hierachy != this.currentComponent.rootHierachy) {
                    /**
                     * if component exists early, reset the previous token to current
                     * exit out of self-closing elements
                     * i.e. <img> tag
                     */
                    previousToken = token;
                    if (Chars_1.selfClosingElements.includes(token))
                        hierachy--;
                    continue;
                }
                if (!classes.includes(_class)) {
                    classes.push(_class);
                    classIsUniq = true;
                }
                let errorLine = isInsideComponent ? this.currentComponent.line : this.pos.line - totalComponentLines + 1;
                let errorMsg = isInsideComponent ?
                    `Element: ${token}, at line ${errorLine}, in component: ${this.currentComponent.name}, has no id or unique class` :
                    `Element: ${token}, at line ${errorLine}, in layout: ${this._layoutName}, has no id or unique class`;
                const hasId = !(id == null || id.trim() == '' || idPod > lastCharPosOTag);
                const hasClass = !(_class == null || _class.trim() == '' || classPos > lastCharPosOTag || !classIsUniq);
                if (!hasClass && !hasId)
                    throw errorMsg;
                if (isInsideComponent && this.currentComponent.hasRoot)
                    throw `Root element count exeeded: Component (${this.currentComponent.name}) has a root element.`;
                const firstOrderId = id ? id : _class;
                const parent = this.getParent(hierachy - 1);
                let componentInnerHTML = '';
                let elementStartPos = this.layout.indexOf(`<${token + modifiers}>`, this.pos.index - token.length - 2) + `<${token + modifiers}>`.length;
                this._elementIndex[firstOrderId] = elementCount++;
                this._blueprint.push({
                    id: {
                        type: id ? 'id' : 'class',
                        value: firstOrderId
                    },
                    isParent: false,
                    element: {
                        innerText: '',
                        type: token,
                        startPos: elementStartPos
                    },
                    component: {
                        isComponent: isInsideComponent,
                        innerHTML: componentInnerHTML
                    },
                    hierachy,
                    modifiers,
                    parent
                });
                if (this.currentComponent)
                    this.currentComponent.hasRoot = true;
                if (Chars_1.selfClosingElements.includes(token))
                    hierachy--;
            }
            if (Chars_1.elements.includes(token) && this.lookBehind(token) == '/' && this.lookBehind(token, 2) == '<')
                hierachy--;
            previousToken = token;
            this.next();
        }
        this.getNonParents((element) => {
            let suffix = element.component.isComponent ? ' component_end' : '';
            let endPos = this.layout.indexOf(`</${element.element.type}>${suffix}`, element.element.startPos);
            element.element.innerText = this.layout.substring(element.element.startPos, endPos);
        });
        return {
            blueprint: this._blueprint,
            elementIndex: this._elementIndex,
            events: this._events.list,
            layout: this.layout
        };
    }
}
exports["default"] = Blueprint;
;


/***/ }),

/***/ "../oddlyjs/src/Lexer/Chars.ts":
/*!*************************************!*\
  !*** ../oddlyjs/src/Lexer/Chars.ts ***!
  \*************************************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.selfClosingElements = exports.elements = exports.alpha = exports.numbers = void 0;
exports.numbers = '0123456789';
exports.alpha = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
exports.elements = [
    'a',
    'abbr',
    'acronym',
    'address',
    'applet',
    'area',
    'article',
    'aside',
    'audio',
    'b',
    'base',
    'basefont',
    'bdi',
    'bdo',
    'big',
    'blockquote',
    'body',
    'br',
    'button',
    'canvas',
    'caption',
    'center',
    'cite',
    'code',
    'col',
    'colgroup',
    'data',
    'datalist',
    'dd',
    'del',
    'details',
    'dfn',
    'dialog',
    'dir',
    'div',
    'dl',
    'dt',
    'em',
    'embed',
    'fieldset',
    'figcaption',
    'figure',
    'font',
    'footer',
    'form',
    'frame',
    'frameset',
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6',
    'head',
    'header',
    'hr',
    'html',
    'i',
    'iframe',
    'img',
    'input',
    'ins',
    'kbd',
    'label',
    'legend',
    'li',
    'link',
    'main',
    'map',
    'mark',
    'meta',
    'meter',
    'nav',
    'noframes',
    'noscript',
    'object',
    'ol',
    'optgroup',
    'option',
    'output',
    'p',
    'param',
    'picture',
    'pre',
    'progress',
    'q',
    'rp',
    'rt',
    'ruby',
    's',
    'samp',
    'script',
    'section',
    'select',
    'small',
    'source',
    'span',
    'strike',
    'strong',
    'style',
    'sub',
    'summary',
    'sup',
    'svg',
    'table',
    'tbody',
    'td',
    'template',
    'textarea',
    'tfoot',
    'th',
    'thead',
    'time',
    'title',
    'tr',
    'track',
    'tt',
    'u',
    'ul',
    'use',
    'var',
    'video'
];
exports.selfClosingElements = [
    'area',
    'base',
    'br',
    'col',
    'command',
    'embed',
    'hr',
    'img',
    'input',
    'keygen',
    'link',
    'meta',
    'param',
    'source',
    'track',
    'wbr'
];


/***/ }),

/***/ "../oddlyjs/src/Lexer/DOMTree.ts":
/*!***************************************!*\
  !*** ../oddlyjs/src/Lexer/DOMTree.ts ***!
  \***************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
const Chars_1 = __webpack_require__(/*! ./Chars */ "../oddlyjs/src/Lexer/Chars.ts");
const Lexer_1 = __importDefault(__webpack_require__(/*! ./Lexer */ "../oddlyjs/src/Lexer/Lexer.ts"));
class DOMTree extends Lexer_1.default {
    // private _domTree: IElementCounter = {}
    _domTree = [];
    _lastElement;
    constructor(text) {
        super(text);
    }
    findEntityToReRender() {
        let lastCharPosOpenTag = 0;
        while (this.currentChar != null) {
            if (" \n\t\r".includes(this.currentChar)) {
                this.next();
                continue;
            }
            let token = this.getToken();
            if (Chars_1.elements.includes(token) && this.lookBehind(token) == '<') {
                this._domTree.push({
                    name: token,
                    isClosed: false,
                    index: this.pos.index - token.length
                });
            }
            if (Chars_1.elements.includes(token) && this.lookBehind(token) == '/' && this.lookBehind(token, 2) == '<') {
                for (let i = this._domTree.length - 1; i > -1; i--) {
                    const el = this._domTree[i];
                    if (el.name == token && !el.isClosed) {
                        el.isClosed = true;
                        break;
                    }
                }
            }
            this.next();
        }
        const counter = {};
        /**
         * saveStopIndex = index of last open element
         * prevents miscalculation of the element index in DOM
         */
        let saveStopIndex = 0;
        for (let i = 0; i < this._domTree.length; i++) {
            const el = this._domTree[i];
            if (!el.isClosed) {
                saveStopIndex = i;
            }
        }
        for (let i = 0; i <= saveStopIndex; i++) {
            const el = this._domTree[i];
            counter[el.name] = counter[el.name] || 0;
            counter[el.name]++;
            if (!el.isClosed && !Chars_1.selfClosingElements.includes(el.name)) {
                console.log('El', el.name);
                this._lastElement = el.name;
                lastCharPosOpenTag = this.layout.indexOf('>', el.index - 1);
            }
        }
        return [
            this._lastElement,
            // the framework creates it's own div container so the number of divs is +1
            this._lastElement == 'div' ? counter[this._lastElement] : counter[this._lastElement] - 1,
            lastCharPosOpenTag
        ];
    }
}
exports["default"] = DOMTree;
;


/***/ }),

/***/ "../oddlyjs/src/Lexer/EventTypes.ts":
/*!******************************************!*\
  !*** ../oddlyjs/src/Lexer/EventTypes.ts ***!
  \******************************************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports["default"] = [
    'abort',
    'afterprint',
    'animationend',
    'animationiteration',
    'animationstart',
    'beforeprint',
    'beforeunload',
    'blur',
    'canplay',
    'canplaythrough',
    'change',
    'click',
    'contextmenu',
    'copy',
    'cut',
    'dblclick',
    'drag',
    'dragend',
    'dragenter',
    'dragleave',
    'dragover',
    'dragstart',
    'drop',
    'durationchange',
    'ended',
    'error',
    'focus',
    'focusin',
    'focusout',
    'fullscreenchange',
    'fullscreenerror',
    'hashchange',
    'input',
    'invalid',
    'keydown',
    'keypress',
    'keyup',
    'load',
    'loadeddata',
    'loadedmetadata',
    'loadstart',
    'message',
    'mousedown',
    'mouseenter',
    'mouseleave',
    'mousemove',
    'mouseover',
    'mouseout',
    'mouseup',
    'mousewheel',
    'offline',
    'online',
    'open',
    'pagehide',
    'pageshow',
    'paste',
    'pause',
    'play',
    'playing',
    'popstate',
    'progress',
    'ratechange',
    'resize',
    'reset',
    'scroll',
    'search',
    'seeked',
    'seeking',
    'select',
    'show',
    'stalled',
    'storage',
    'submit',
    'suspend',
    'timeupdate',
    'toggle',
    'touchcancel',
    'touchend',
    'touchmove',
    'touchstart',
    'transitionend',
    'unload',
    'volumechange'
];


/***/ }),

/***/ "../oddlyjs/src/Lexer/Lexer.ts":
/*!*************************************!*\
  !*** ../oddlyjs/src/Lexer/Lexer.ts ***!
  \*************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
const Position_1 = __importDefault(__webpack_require__(/*! ./Position */ "../oddlyjs/src/Lexer/Position.ts"));
const Chars_1 = __webpack_require__(/*! ./Chars */ "../oddlyjs/src/Lexer/Chars.ts");
class Lexer {
    _str;
    _currentChar = null;
    _pos;
    constructor(str) {
        this._str = str;
        this._currentChar = null;
        this._pos = new Position_1.default();
        this.next();
    }
    get currentChar() {
        return this._currentChar;
    }
    get layout() {
        return this._str;
    }
    set layout(str) {
        this._str = str;
    }
    get pos() {
        return this._pos;
    }
    getToken() {
        return Chars_1.alpha.includes(this.currentChar || '') ? this.makeString() : this.currentChar;
    }
    next() {
        this._pos.next(this._currentChar);
        this._currentChar = this._pos.index < this._str.length ? this._str[this._pos.index] : null;
    }
    lookBehind(token, offset = 1) {
        return this._str[this._pos.index - token.length - offset] || null;
    }
    lookAhead(offset = 0) {
        return this._str[this._pos.index + offset] || null;
    }
    makeString() {
        const letters = Chars_1.numbers + Chars_1.alpha + '_-.';
        let str = '';
        while (this._currentChar != null && letters.includes(this._currentChar)) {
            str += this._currentChar;
            this.next();
        }
        ;
        return str;
    }
}
exports["default"] = Lexer;
;


/***/ }),

/***/ "../oddlyjs/src/Lexer/Position.ts":
/*!****************************************!*\
  !*** ../oddlyjs/src/Lexer/Position.ts ***!
  \****************************************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
class Position {
    _index = -1;
    _line = 1;
    _col = 1;
    get index() {
        return this._index;
    }
    set index(index) {
        this._index = index;
    }
    get line() {
        return this._line;
    }
    get col() {
        return this._col;
    }
    next(char) {
        this._index++;
        this._col++;
        if (char == '\n') {
            this._line++;
            this._col = 1;
        }
    }
}
exports["default"] = Position;


/***/ }),

/***/ "../oddlyjs/src/Middleware.ts":
/*!************************************!*\
  !*** ../oddlyjs/src/Middleware.ts ***!
  \************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
const Router_1 = __importDefault(__webpack_require__(/*! ./Router */ "../oddlyjs/src/Router/index.ts"));
exports["default"] = new (class Middleware {
    static instance;
    middleware = [];
    readyMiddleware = [];
    middlewareIndex = 0;
    constructor() {
        if (!Middleware.instance) {
            this.reset();
            Middleware.instance = this;
        }
        return Middleware.instance;
    }
    ;
    get index() {
        return this.middlewareIndex++;
    }
    repeat(scope, callback) {
        this.add(scope, callback);
    }
    once(scope, callback) {
        this.add(scope, callback, true);
    }
    ;
    wait(callback) {
        callback();
    }
    add(scope, callback, once = false) {
        let _scope = scope;
        scope = !callback ? null : scope;
        callback = !callback ? _scope : callback;
        scope = Array.isArray(scope) ? scope : [scope];
        this.middleware.push({
            scope,
            hasRun: false,
            once,
            callback
        });
    }
    reset() {
        let newMiddleware = [];
        this.middlewareIndex = 0;
        this.readyMiddleware = [];
        this.middleware.forEach(middleware => {
            if (middleware.hasRun)
                return;
            newMiddleware.push(middleware);
        });
        this.middleware = newMiddleware;
    }
    exec() {
        let index = this.middlewareIndex;
        const { callback, hasRun, once } = this.readyMiddleware[this.index] || { callback: 'done' };
        if (typeof callback != 'function')
            return;
        if (once && hasRun)
            return this.exec();
        else if (once && !hasRun)
            this.readyMiddleware[index].hasRun = true;
        callback(() => this.exec());
    }
    run() {
        this.reset();
        this.middleware.forEach((middleware) => {
            if (!(middleware.scope[0]) || (middleware.scope.includes(Router_1.default.currentRoute.name)))
                this.readyMiddleware.push(middleware);
        });
        this.exec();
    }
    ;
});


/***/ }),

/***/ "../oddlyjs/src/Router/Route.ts":
/*!**************************************!*\
  !*** ../oddlyjs/src/Router/Route.ts ***!
  \**************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Route = void 0;
const _1 = __importDefault(__webpack_require__(/*! . */ "../oddlyjs/src/Router/index.ts"));
class Route {
    _name;
    _tags;
    _url;
    _layoutpath;
    _stateEvents = {
        onDOMLoaded: null,
    };
    events;
    headers;
    params;
    query;
    blueprint;
    content = '';
    nestedComponentsIndices;
    componentCallStack = {};
    data;
    signalUsage = {};
    elementIndex;
    constructor(route) {
        this._name = route.name;
        this._url = route.url;
        this._layoutpath = route.layoutpath;
        this._tags = route.tags;
    }
    get name() {
        return this._name;
    }
    get url() {
        return this._url;
    }
    get layoutpath() {
        return this._layoutpath;
    }
    // TODO: remove this, not used
    isInScope() {
        return this._name == _1.default.currentRouteName;
    }
    updateHistory(path) {
        const pageTitle = 'Default title';
        document.title = pageTitle;
        history.pushState(this.content, pageTitle, path);
    }
    onDOMLoaded(cb) {
        this._stateEvents.onDOMLoaded = cb;
    }
    initDOMLoaded() {
        const fn = this._stateEvents.onDOMLoaded;
        if (fn)
            fn();
    }
}
exports.Route = Route;
exports["default"] = (route) => _1.default.addRoute(new Route(route));


/***/ }),

/***/ "../oddlyjs/src/Router/index.ts":
/*!**************************************!*\
  !*** ../oddlyjs/src/Router/index.ts ***!
  \**************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
const URL_1 = __importDefault(__webpack_require__(/*! ../URL */ "../oddlyjs/src/URL.ts"));
const Util_1 = __importDefault(__webpack_require__(/*! ../Util */ "../oddlyjs/src/Util.ts"));
const Environment_1 = __importDefault(__webpack_require__(/*! ../Environment */ "../oddlyjs/src/Environment.ts"));
exports["default"] = new (class Routes {
    _routes = {};
    _lastRouteName;
    _lastRoute;
    _currentRouteName;
    static instance;
    constructor() {
        if (!Routes.instance) {
            Routes.instance = this;
        }
        return Routes.instance;
    }
    get currentRouteName() {
        return this._currentRouteName;
    }
    get currentRoute() {
        return this._routes[this._currentRouteName] || null;
    }
    get currentParams() {
        return this._routes[this._currentRouteName]?.params;
    }
    get lastRoute() {
        return this._lastRoute;
    }
    use(routeName) {
        if (routeName == 'any')
            return this.currentRoute;
        return this._routes[routeName];
    }
    addRoute(route) {
        return this._routes[route.name] = route;
    }
    getRoute(url) {
        let routeToReturn = null;
        Util_1.default.iterate(this._routes, (routeName, route) => {
            if (URL_1.default.compare(route.url, url))
                routeToReturn = route;
        });
        if (routeToReturn) {
            routeToReturn = routeToReturn;
            routeToReturn.params = URL_1.default.getParams(routeToReturn.url, url);
            routeToReturn.query = new URLSearchParams(URL_1.default.getQueryString(url));
            Environment_1.default.put('params', routeToReturn.params, true);
            Environment_1.default.put('query', Util_1.default.Array2DToObject(Array.from(routeToReturn.query.entries())), true);
        }
        return routeToReturn;
    }
    setLastRoute() {
        this._lastRouteName = this._currentRouteName ? this._currentRouteName : '';
        this._lastRoute = JSON.parse(JSON.stringify(this._routes[this._lastRouteName] || {}));
    }
    setCurrentRoute(url = URL_1.default.path) {
        this.setLastRoute();
        const currentRoute = new Object(this.getRoute(url));
        if (!currentRoute)
            throw `Could not match '${url}' to any routes`;
        // TODO: Create error class, and throw non-exitan err
        this._currentRouteName = currentRoute.name || '';
    }
});


/***/ }),

/***/ "../oddlyjs/src/Signal/Signal.ts":
/*!***************************************!*\
  !*** ../oddlyjs/src/Signal/Signal.ts ***!
  \***************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
const Environment_1 = __importDefault(__webpack_require__(/*! ../Environment */ "../oddlyjs/src/Environment.ts"));
const Layouts_1 = __importDefault(__webpack_require__(/*! ../Layouts */ "../oddlyjs/src/Layouts/index.ts"));
const DOMTree_1 = __importDefault(__webpack_require__(/*! ../Lexer/DOMTree */ "../oddlyjs/src/Lexer/DOMTree.ts"));
const Middleware_1 = __importDefault(__webpack_require__(/*! ../Middleware */ "../oddlyjs/src/Middleware.ts"));
const Router_1 = __importDefault(__webpack_require__(/*! ../Router */ "../oddlyjs/src/Router/index.ts"));
const Util_1 = __importDefault(__webpack_require__(/*! ../Util */ "../oddlyjs/src/Util.ts"));
const Watcher_1 = __importDefault(__webpack_require__(/*! ./Watcher */ "../oddlyjs/src/Signal/Watcher.ts"));
class Signal {
    _value;
    _id;
    _watcher;
    constructor(value, key) {
        this._value = value;
        this._watcher = new Watcher_1.default();
        this._id = key || this._watcher.makeSafeId();
    }
    get id() {
        return this._id;
    }
    get value() {
        return this._value;
    }
    set value(value) {
        this._value = value;
        const currentRoute = Router_1.default.currentRoute;
        currentRoute.data[this._id] = value;
        currentRoute.signalUsage[this._id]?.forEach((_, index) => {
            let offset = 0;
            Layouts_1.default.build(true);
            Middleware_1.default.once(() => {
                const currentRouteContent = currentRoute.content;
                const { file, position } = currentRoute.signalUsage[this._id][index];
                const paths = Util_1.default.findComponentPaths(currentRouteContent);
                const cleanHTMLContent = Util_1.default.cleanHTMLContent(currentRouteContent).trim();
                paths.forEach(async (path) => {
                    const isNestedComponent = currentRoute.componentCallStack[file].includes(path.replace('component_start', '').replace(';', ''));
                    if ((path.indexOf(file) < 0) &&
                        (!isNestedComponent)) {
                        offset += path.length + ' component_end'.length;
                        return;
                    }
                    ;
                    let componentStartPos = currentRouteContent.indexOf(path) - offset;
                    let limit = componentStartPos + position.end;
                    let nestedComponestsLength = 0;
                    /** push the component start away from whitespace */
                    for (let i = componentStartPos; i < limit; i++) {
                        if (' \n\t\r'.includes(cleanHTMLContent.charAt(componentStartPos))) {
                            componentStartPos++;
                            limit++;
                        }
                        else
                            break;
                    }
                    currentRoute.nestedComponentsIndices[file].forEach(({ start, fullLength, offset }) => {
                        if (start - nestedComponestsLength < componentStartPos + position.start) {
                            nestedComponestsLength += fullLength - offset;
                            limit = componentStartPos + nestedComponestsLength + position.end;
                        }
                    });
                    let contentOfInterest = cleanHTMLContent.slice(0, limit);
                    const domTree = new DOMTree_1.default(contentOfInterest);
                    let [elementName, elementIndex, lastCharPosOpenTag] = domTree.findEntityToReRender();
                    lastCharPosOpenTag = lastCharPosOpenTag;
                    const firstCharPosCloseTag = cleanHTMLContent.indexOf(`</${elementName}`, contentOfInterest.length + 1);
                    const element = document.getElementsByTagName(elementName)[elementIndex];
                    const elementInnerHTML = element.innerHTML;
                    /**
                     * Shift the replacement positions (range)
                     * Start from component start position
                     * idea: reduce replacement range to fit into elementInnerHTML
                     */
                    const replaceStartAt = componentStartPos + nestedComponestsLength + position.start - lastCharPosOpenTag - 1;
                    const replaceEndAt = componentStartPos + nestedComponestsLength + position.end - lastCharPosOpenTag - 1;
                    Environment_1.default.kolijs.setContext({
                        content: position.block,
                        data: currentRoute.data
                    });
                    const replacement = await Environment_1.default.kolijs.render();
                    const newInnerHTML = Util_1.default.replaceStringAt(elementInnerHTML, replacement, replaceStartAt, replaceEndAt - replaceStartAt);
                    // element.innerHTML = newInnerHTML;
                });
            });
            Middleware_1.default.run();
        });
        this._watcher.invokeWatcherHandler(this._id, value);
    }
}
exports["default"] = Signal;


/***/ }),

/***/ "../oddlyjs/src/Signal/Watcher.ts":
/*!****************************************!*\
  !*** ../oddlyjs/src/Signal/Watcher.ts ***!
  \****************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
const Util_1 = __importDefault(__webpack_require__(/*! ../Util */ "../oddlyjs/src/Util.ts"));
class Watcher {
    _signals = {};
    _signalCount = 0;
    _signalIdLengthLimit = 1;
    static _instance;
    constructor() {
        if (!Watcher._instance)
            Watcher._instance = this;
        return Watcher._instance;
    }
    get signalIdLimit() {
        // calculate limit in base 64
        return Math.pow(64, this._signalIdLengthLimit);
    }
    has(id) {
        return this._signals[id] ? true : false;
    }
    setSignalLength(len) {
        this._signalIdLengthLimit = len;
    }
    makeSafeId() {
        const id = Util_1.default.randomString(this._signalIdLengthLimit);
        if (!this.has(id)) {
            if (this.signalIdLimit < this._signalCount * 1.2)
                this._signalIdLengthLimit++;
            this._signalCount++;
            return id;
        }
        return this.makeSafeId();
    }
    watchSignal(id, callback) {
        this._signals[id] = callback;
    }
    invokeWatcherHandler(id, value) {
        if (!this._signals[id] || this._signals[id] && typeof this._signals[id] != 'function')
            return;
        this._signals[id](value);
    }
}
exports["default"] = Watcher;


/***/ }),

/***/ "../oddlyjs/src/Signal/index.ts":
/*!**************************************!*\
  !*** ../oddlyjs/src/Signal/index.ts ***!
  \**************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.loadSignal = exports.signal = exports.watch = void 0;
const Watcher_1 = __importDefault(__webpack_require__(/*! ./Watcher */ "../oddlyjs/src/Signal/Watcher.ts"));
const Signal_1 = __importDefault(__webpack_require__(/*! ./Signal */ "../oddlyjs/src/Signal/Signal.ts"));
const Router_1 = __importDefault(__webpack_require__(/*! ../Router */ "../oddlyjs/src/Router/index.ts"));
const watch = (signal, callback) => {
    const watcher = new Watcher_1.default();
    watcher.watchSignal(signal.id, callback);
};
exports.watch = watch;
const signal = (value) => new Signal_1.default(value);
exports.signal = signal;
const loadSignal = (key) => {
    return new Signal_1.default(Router_1.default.currentRoute.data[key], key);
};
exports.loadSignal = loadSignal;


/***/ }),

/***/ "../oddlyjs/src/URL.ts":
/*!*****************************!*\
  !*** ../oddlyjs/src/URL.ts ***!
  \*****************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
const Util_1 = __importDefault(__webpack_require__(/*! ./Util */ "../oddlyjs/src/Util.ts"));
class URL {
    static get path() {
        return location.href.replace(URL.host, "");
    }
    static get host() {
        return location.protocol + "//" + location.host;
    }
    static hasHost(url) {
        return url.startsWith(URL.host);
    }
    static isPlaceholder(urlSegment) {
        return urlSegment.charAt(0) == ':';
    }
    ;
    static cleanURL(url) {
        let cleanUrl = '';
        const httpPos = url.indexOf('http'), httpsPos = url.indexOf('https'), colonPos = httpsPos >= 0 ? httpsPos + 5 : httpPos + 4, httpLastSlashPos = colonPos + 2;
        for (let i = 0; i < url.length; i++) {
            let currentChar = url.charAt(i), nextChar = url.charAt(i + 1);
            if (nextChar && currentChar == nextChar && currentChar == '/' && httpLastSlashPos != i + 1)
                continue;
            cleanUrl += currentChar;
        }
        return cleanUrl;
    }
    ;
    static getUrlPair(paramURL, nonParamURL) {
        return {
            paramURLArray: paramURL.split('/'),
            nonParamURLArray: nonParamURL.split('/')
        };
    }
    static async tryPath(path) {
        const response = await fetch(path, { method: 'GET' });
        path = URL.hasHost(path) ? response.url.replace(URL.host, "") : path;
        return {
            path,
            headers: Util_1.default.Array2DToObject([...response.headers])
        };
    }
    static getParams(paramURL, nonParamURL) {
        const { paramURLArray, nonParamURLArray } = URL.getUrlPair(paramURL, nonParamURL);
        let params = {};
        for (let i = 0; i < nonParamURLArray.length; i++) {
            if (paramURLArray[i] && URL.isPlaceholder(paramURLArray[i]))
                params[paramURLArray[i].slice(1)] = nonParamURLArray[i];
        }
        return params;
    }
    static getQueryString(url) {
        const urlArr = url.split('?');
        if (urlArr.length > 2)
            throw `Expected only one instance of "?" in the url but got ${urlArr.length}`;
        return `?${urlArr[1]}`;
    }
    static compare(paramURL, nonParamURL) {
        const { paramURLArray, nonParamURLArray } = URL.getUrlPair(paramURL, nonParamURL);
        let urlsSame = true;
        if (paramURLArray.length != nonParamURLArray.length)
            return false;
        for (let i = 0; i < nonParamURLArray.length; i++) {
            if (paramURLArray[i] && URL.isPlaceholder(paramURLArray[i]))
                continue;
            const urlWithoutQuery = nonParamURLArray[i].split('?')[0];
            if (paramURLArray[i] != urlWithoutQuery)
                urlsSame = false;
        }
        return urlsSame;
    }
    ;
}
exports["default"] = URL;


/***/ }),

/***/ "../oddlyjs/src/Util.ts":
/*!******************************!*\
  !*** ../oddlyjs/src/Util.ts ***!
  \******************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
const Config_1 = __importDefault(__webpack_require__(/*! ./Config */ "../oddlyjs/src/Config.ts"));
const URL_1 = __importDefault(__webpack_require__(/*! ./URL */ "../oddlyjs/src/URL.ts"));
class Util {
    static createDOMContainer() {
        let container = document.getElementsByClassName('oddlyjs-container')[0];
        if (!container) {
            container = document.createElement('div');
            container.className = 'oddlyjs-container';
            document.body.prepend(container);
        }
    }
    ;
    static cleanHTMLContent(text) {
        text = text.replace(/component_start(.*?);/g, '');
        text = text.replace(/link_active_class(.*?);/g, '');
        text = text.replace(/component_end/g, '');
        return text;
    }
    static prependToBody(html) {
        let container = document.getElementsByClassName('oddlyjs-container')[0];
        container.innerHTML = html;
    }
    ;
    static iterate(obj, callback) {
        for (const key in obj) {
            if (!obj.hasOwnProperty(key))
                continue;
            callback(key, obj[key]);
        }
    }
    static getModifierKeyValuePair(modifiers, callback) {
        let isInQuotes = false, key = '', value = '';
        for (let i = 0; i < modifiers.length; i++) {
            if (modifiers[i] == '=' && `"'`.includes(modifiers[i + 1]))
                continue;
            if (isInQuotes) {
                if (`"'`.includes(modifiers[i])) {
                    callback(key, value);
                    isInQuotes = false;
                    key = '';
                    value = '';
                    continue;
                }
                value += modifiers[i];
                continue;
            }
            if (`"'`.includes(modifiers[i]) && !isInQuotes) {
                isInQuotes = true;
                continue;
            }
            key += modifiers[i];
            if (key && (modifiers[i + 1] == ' ' || modifiers[i + 1] == '' || !modifiers[i + 1])) {
                callback(key, true);
                key = '';
                value = '';
            }
        }
    }
    static getLastElement(arr) {
        return arr[arr.length - 1];
    }
    ;
    static resolveLayoutPath(path) {
        return URL_1.default.cleanURL(`${Config_1.default.layoutViews}/${path}.${Config_1.default.viewsExt}`);
    }
    static resolveComponentPath(path) {
        return URL_1.default.cleanURL(`${Config_1.default.componentViews}/${path}.${Config_1.default.viewsExt}`);
    }
    static Array2DToObject(arr) {
        let obj = {};
        arr.forEach(item => {
            obj[item[0]] = item[1];
        });
        return obj;
    }
    static escapeRegex(str) {
        return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }
    static async fetch(url, { method = 'GET', headers = { 'Content-Type': 'application/json;charset=utf-8' }, body = {} } = {}) {
        const response = await fetch(url, { method, headers });
        return await response.text();
    }
    ;
    static extractComponentNames(text) {
        const rawTags = text.match(/@component;(.*?)@end;/gi) || [];
        let tags = [];
        rawTags.forEach((rawTag) => {
            tags.push(rawTag.replace('@component;', '').replace('@end;', ''));
        });
        return tags;
    }
    ;
    static findComponentPaths(text) {
        const componentPaths = text.match(/component_start(.*?);/gi) || [];
        return componentPaths;
    }
    ;
    static randomString(length) {
        var string = '';
        var chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_-';
        var charLength = chars.length;
        for (var i = 0; i < length; i++) {
            string += chars.charAt(Math.floor(Math.random() * charLength));
        }
        return string;
    }
    static replaceStringAt(str, replacement, start, end) {
        return str.slice(0, start - 1) + replacement + str.slice(start + end);
    }
}
exports["default"] = Util;


/***/ }),

/***/ "./public/assets/js/src/app.ts":
/*!*************************************!*\
  !*** ./public/assets/js/src/app.ts ***!
  \*************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
const oddlyjs_1 = __webpack_require__(/*! oddlyjs */ "../oddlyjs/index.ts");
const routes_1 = __importDefault(__webpack_require__(/*! ./routes */ "./public/assets/js/src/routes/index.ts"));
const events_1 = __importDefault(__webpack_require__(/*! ./events */ "./public/assets/js/src/events/index.ts"));
const middleware_1 = __importDefault(__webpack_require__(/*! ./middleware */ "./public/assets/js/src/middleware/index.ts"));
(0, routes_1.default)();
(0, events_1.default)();
(0, middleware_1.default)();
(0, oddlyjs_1.Load)();
// setTimeout(() => {
//     const sig = loadSignal('count');
//     console.log(sig)
//     sig.value = 'tau';
// }, 2000)


/***/ }),

/***/ "./public/assets/js/src/events/DJ.ts":
/*!*******************************************!*\
  !*** ./public/assets/js/src/events/DJ.ts ***!
  \*******************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
const oddlyjs_1 = __webpack_require__(/*! oddlyjs */ "../oddlyjs/index.ts");
const error_container_1 = __webpack_require__(/*! ../helpers/error-container */ "./public/assets/js/src/helpers/error-container.ts");
const fetch_1 = __importStar(__webpack_require__(/*! ../helpers/fetch */ "./public/assets/js/src/helpers/fetch.ts"));
const array_1 = __webpack_require__(/*! ../helpers/array */ "./public/assets/js/src/helpers/array.ts");
const datetime_1 = __webpack_require__(/*! ../helpers/datetime */ "./public/assets/js/src/helpers/datetime.ts");
const modal_1 = __webpack_require__(/*! ../helpers/modal */ "./public/assets/js/src/helpers/modal.ts");
const popup_1 = __importDefault(__webpack_require__(/*! ../helpers/popup */ "./public/assets/js/src/helpers/popup.ts"));
exports["default"] = () => new (class DJ {
    constructor() {
        new oddlyjs_1.Events(this);
    }
    async signUp(e) {
        e.preventDefault();
        const response = await (0, fetch_1.default)('/sign-up', {
            body: {
                stage_name: $('#stage-name').val(),
                email: $('#email-address').val(),
                password: $('#password').val(),
                passwordAgain: $('#password-again').val()
            }
        });
        if (response.successful) {
            oddlyjs_1.Environment.put('userInfo', response.userDetails);
            return (0, oddlyjs_1.Next)('/my-schedule');
        }
        (0, error_container_1.showError)('auth', response.error);
    }
    async signIn(e) {
        e.preventDefault();
        const response = await (0, fetch_1.default)('/sign-in', {
            body: {
                identifier: $('#identifier').val(),
                password: $('#password').val()
            }
        });
        if (response.successful) {
            oddlyjs_1.Environment.put('userInfo', response.userDetails);
            return (0, oddlyjs_1.Next)('/my-schedule');
        }
        (0, error_container_1.showError)('auth', response.error);
    }
    async searchByName() {
        const response = await (0, fetch_1.default)('/dj/search/by/name', {
            body: {
                dj_name: $('#dj-name').val()
            }
        });
        if ((0, array_1.arrayNotEmpty)(response.djs)) {
            let text = '';
            for (let i = 0; i < response.djs.length; i++) {
                const dj = response.djs[i];
                const res = await (0, fetch_1.default)(`/invitations/get/by/dj/${dj.id}`);
                let invites = "";
                if ((0, array_1.arrayNotEmpty)(res.invitations)) {
                    res.invitations.forEach((inv, index) => {
                        invites += `
                            <ul class="table__body__row flex">
                                <li class="table__body__row__item short" style="padding-left: 0;">${index + 1}</li>
                                <li class="table__body__row__item">${inv.name}</li>
                                <li class="table__body__row__item">${(0, datetime_1.getStaticDate)(inv.start)}</li>
                                <li class="table__body__row__item" style="padding-right: 0;">${(0, datetime_1.getStaticDate)(inv.end)}</li>
                            </ul>
                        `;
                    });
                }
                text += `<div class="dj-container__item">
                    <h4>${dj.stage_name}</h4>
                    <div class="table">
                        <div class="table__header">
                            <ul class="table__header__row flex">
                                <li class="table__header__row__item short" style="padding-left: 0;">#</li>
                                <li class="table__header__row__item">Invitation</li>
                                <li class="table__header__row__item">Starts at</li>
                                <li class="table__header__row__item" style="padding-right: 0;">End at</li>
                            </ul>
                        </div>
                        <div class="table__body" style="box-shadow: none;">
                            ${invites}
                        </div>
                    </div>
                    <p class="send-invitation" data-djid="${dj.id}" data-eventid="${oddlyjs_1.Router.currentRoute.query.get('e')}">Send invitation</p>
                </div>`;
            }
            $('.dj-container').html(text);
            $('.send-invitation').off('click');
            $('.send-invitation').on('click', async (e) => {
                const { djid, eventid } = e.currentTarget.dataset;
                const addInviteRes = await (0, fetch_1.default)('/invitation/add', {
                    body: {
                        dj_id: djid,
                        event_id: eventid
                    }
                });
                if (addInviteRes.successful) {
                    (0, oddlyjs_1.Refresh)();
                    (0, popup_1.default)({ type: 'success', title: 'DJ invited', message: 'Successfully invited dj' });
                    return (0, modal_1.closeModal)('add-dj');
                }
                (0, error_container_1.showError)('add-dj', addInviteRes.error);
            });
            return;
        }
        $('.dj-container').html('');
    }
    async updateGeneralDetails(e) {
        e.preventDefault();
        const response = await (0, fetch_1.default)('/dj/updates/general-details', {
            body: {
                stage_name: $('#stage-name').val(),
                email: $('#email-address').val()
            }
        });
        if (response.successful) {
            return (0, popup_1.default)({ type: 'success', title: 'General details changed', message: `Successfully updated general details` });
        }
        return (0, popup_1.default)({ type: 'error', title: 'Oops', message: response.error });
    }
    async updateProfile(e) {
        const body = new FormData();
        const files = $('#profile-file')[0];
        const file = files.files ? files.files[0] : null;
        body.append('profile', file || '');
        (0, oddlyjs_1.Refresh)();
        (0, fetch_1.uploadImage)('/dj/updates/profile', body);
    }
    async updateRates(e) {
        e.preventDefault();
        const response = await (0, fetch_1.default)('/dj/updates/rates', {
            body: {
                min_deposit: $('#min-deposit').val(),
                full_amount: $('#full-amount').val()
            }
        });
        if (response.successful) {
            return (0, popup_1.default)({ type: 'success', title: 'Rates updated', message: `Successfully updated rates and fees` });
        }
        return (0, popup_1.default)({ type: 'error', title: 'Oops', message: response.error });
    }
});


/***/ }),

/***/ "./public/assets/js/src/events/Invitation.ts":
/*!***************************************************!*\
  !*** ./public/assets/js/src/events/Invitation.ts ***!
  \***************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
const oddlyjs_1 = __webpack_require__(/*! oddlyjs */ "../oddlyjs/index.ts");
const fetch_1 = __importDefault(__webpack_require__(/*! ../helpers/fetch */ "./public/assets/js/src/helpers/fetch.ts"));
const popup_1 = __importDefault(__webpack_require__(/*! ../helpers/popup */ "./public/assets/js/src/helpers/popup.ts"));
exports["default"] = () => new (class Invitation {
    constructor() {
        new oddlyjs_1.Events(this);
    }
    async accept(event_id, organizer_id) {
        const response = await (0, fetch_1.default)('/invitation/accept', {
            body: {
                event_id,
                organizer_id
            }
        });
        (0, oddlyjs_1.Refresh)();
        if (response.successful) {
            return (0, popup_1.default)({ type: 'success', title: 'Accepted invite', message: 'You have accepted invite' });
        }
        return (0, popup_1.default)({ type: 'error', title: 'Oops', message: response.error });
    }
    async deny(event_id, organizer_id) {
        const response = await (0, fetch_1.default)('/invitation/deny', {
            body: {
                event_id,
                organizer_id
            }
        });
        (0, oddlyjs_1.Refresh)();
        if (response.successful) {
            return (0, popup_1.default)({ type: 'success', title: 'Declined invite', message: 'You have successfully declined invite' });
        }
        return (0, popup_1.default)({ type: 'error', title: 'Oops', message: response.error });
    }
    async removeById(invitation_id) {
        const response = await (0, fetch_1.default)('/invitation/remove', {
            body: {
                invitation_id
            }
        });
        (0, oddlyjs_1.Refresh)();
    }
});


/***/ }),

/***/ "./public/assets/js/src/events/MyEvent.ts":
/*!************************************************!*\
  !*** ./public/assets/js/src/events/MyEvent.ts ***!
  \************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
const oddlyjs_1 = __webpack_require__(/*! oddlyjs */ "../oddlyjs/index.ts");
const error_container_1 = __webpack_require__(/*! ../helpers/error-container */ "./public/assets/js/src/helpers/error-container.ts");
const modal_1 = __webpack_require__(/*! ../helpers/modal */ "./public/assets/js/src/helpers/modal.ts");
const fetch_1 = __importDefault(__webpack_require__(/*! ../helpers/fetch */ "./public/assets/js/src/helpers/fetch.ts"));
exports["default"] = () => new (class MyEvent {
    constructor() {
        new oddlyjs_1.Events(this);
    }
    async add(e) {
        e.preventDefault();
        const response = await (0, fetch_1.default)('/event/add', {
            body: {
                name: $('#event-name').val(),
                location: $('#event-location').val(),
                start: $('#event-start').val(),
                end: $('#event-end').val()
            }
        });
        if (response.successful) {
            (0, modal_1.closeModal)('new-event');
            return (0, oddlyjs_1.Refresh)();
        }
        (0, error_container_1.showError)('event', response.error);
    }
    async edit(e) {
        e.preventDefault();
        const response = await (0, fetch_1.default)('/event/edit', {
            body: {
                event_id: $('#event-id').val(),
                name: $('#edit-event-name').val(),
                location: $('#edit-event-location').val(),
                start: $('#edit-event-start').val(),
                end: $('#edit-event-end').val()
            }
        });
        if (response.successful) {
            (0, modal_1.closeModal)('edit-event');
            return (0, oddlyjs_1.Refresh)();
        }
        (0, error_container_1.showError)('edit-event', response.error);
    }
    async removeEvent(event_id) {
        const response = await (0, fetch_1.default)('/event/remove/by/id', {
            body: {
                event_id
            }
        });
        (0, oddlyjs_1.Refresh)();
    }
    openEditModal(event_id) {
        $('#event-id').val(event_id);
        oddlyjs_1.Environment.put('eventId', event_id, true);
    }
});


/***/ }),

/***/ "./public/assets/js/src/events/Organizer.ts":
/*!**************************************************!*\
  !*** ./public/assets/js/src/events/Organizer.ts ***!
  \**************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
const oddlyjs_1 = __webpack_require__(/*! oddlyjs */ "../oddlyjs/index.ts");
const error_container_1 = __webpack_require__(/*! ../helpers/error-container */ "./public/assets/js/src/helpers/error-container.ts");
const fetch_1 = __importDefault(__webpack_require__(/*! ../helpers/fetch */ "./public/assets/js/src/helpers/fetch.ts"));
exports["default"] = () => new (class Organizer {
    constructor() {
        new oddlyjs_1.Events(this);
    }
    async signUp(e) {
        e.preventDefault();
        const response = await (0, fetch_1.default)('/organizer/sign-up', {
            body: {
                fullname: $('#full-name').val(),
                email: $('#email-address').val(),
                password: $('#password').val(),
                passwordAgain: $('#password-again').val()
            }
        });
        if (response.successful) {
            oddlyjs_1.Environment.put('userInfo', response.userDetails);
            return (0, oddlyjs_1.Next)('/organizer/event-manager');
        }
        (0, error_container_1.showError)('auth', response.error);
    }
    async signIn(e) {
        e.preventDefault();
        const response = await (0, fetch_1.default)('/organizer/sign-in', {
            body: {
                email: $('#email-address').val(),
                password: $('#password').val()
            }
        });
        if (response.successful) {
            oddlyjs_1.Environment.put('userInfo', response.userDetails);
            return (0, oddlyjs_1.Next)('/organizer/event-manager');
        }
        (0, error_container_1.showError)('auth', response.error);
    }
});


/***/ }),

/***/ "./public/assets/js/src/events/Payment.ts":
/*!************************************************!*\
  !*** ./public/assets/js/src/events/Payment.ts ***!
  \************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.makePayment = void 0;
const fetch_1 = __importDefault(__webpack_require__(/*! ../helpers/fetch */ "./public/assets/js/src/helpers/fetch.ts"));
const makePayment = async (amount, id) => {
    const response = await (0, fetch_1.default)('/payment/pay', {
        body: {
            amount,
            id
        }
    });
};
exports.makePayment = makePayment;


/***/ }),

/***/ "./public/assets/js/src/events/Util.ts":
/*!*********************************************!*\
  !*** ./public/assets/js/src/events/Util.ts ***!
  \*********************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
const oddlyjs_1 = __webpack_require__(/*! oddlyjs */ "../oddlyjs/index.ts");
const modal_1 = __webpack_require__(/*! ../helpers/modal */ "./public/assets/js/src/helpers/modal.ts");
const fetch_1 = __importDefault(__webpack_require__(/*! ../helpers/fetch */ "./public/assets/js/src/helpers/fetch.ts"));
exports["default"] = () => new (class Util {
    constructor() {
        new oddlyjs_1.Events(this);
    }
    openModal(id) {
        (0, modal_1.openModal)(id);
    }
    closeModal(id) {
        (0, modal_1.closeModal)(id);
    }
    link(path) {
        (0, oddlyjs_1.Next)(path);
    }
    signOut() {
        (async () => {
            const res = await (0, fetch_1.default)('/sign-out');
            (0, oddlyjs_1.Next)(res.redirect || '/sign-in');
        })();
    }
    nav(e) {
        e.preventDefault();
        (0, oddlyjs_1.Next)(e.currentTarget.href);
    }
    openDropDownMenu() {
        const dropdown = $(`#dropdown-menu`);
        dropdown.removeClass('main-header__nav__ul__item__menu--closed');
        const overlay = $(document.createElement('div'));
        overlay.addClass('overlay');
        overlay.on('click', () => {
            dropdown.addClass('main-header__nav__ul__item__menu--closed');
            overlay.remove();
        });
        document.body.appendChild(overlay[0]);
    }
});


/***/ }),

/***/ "./public/assets/js/src/events/index.ts":
/*!**********************************************!*\
  !*** ./public/assets/js/src/events/index.ts ***!
  \**********************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
const DJ_1 = __importDefault(__webpack_require__(/*! ./DJ */ "./public/assets/js/src/events/DJ.ts"));
const Util_1 = __importDefault(__webpack_require__(/*! ./Util */ "./public/assets/js/src/events/Util.ts"));
const MyEvent_1 = __importDefault(__webpack_require__(/*! ./MyEvent */ "./public/assets/js/src/events/MyEvent.ts"));
const Organizer_1 = __importDefault(__webpack_require__(/*! ./Organizer */ "./public/assets/js/src/events/Organizer.ts"));
const Invitation_1 = __importDefault(__webpack_require__(/*! ./Invitation */ "./public/assets/js/src/events/Invitation.ts"));
exports["default"] = () => {
    (0, DJ_1.default)();
    (0, Util_1.default)();
    (0, MyEvent_1.default)();
    (0, Organizer_1.default)();
    (0, Invitation_1.default)();
};


/***/ }),

/***/ "./public/assets/js/src/helpers/array.ts":
/*!***********************************************!*\
  !*** ./public/assets/js/src/helpers/array.ts ***!
  \***********************************************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.arrayNotEmpty = void 0;
const arrayNotEmpty = (arr) => {
    if (arr && arr.length > 0)
        return 1;
    return 0;
};
exports.arrayNotEmpty = arrayNotEmpty;


/***/ }),

/***/ "./public/assets/js/src/helpers/datetime.ts":
/*!**************************************************!*\
  !*** ./public/assets/js/src/helpers/datetime.ts ***!
  \**************************************************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.getStaticDate = void 0;
const getMonths = () => ([
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
]);
const makeTime = (date) => {
    let hours = date.getHours(), minutes = date.getMinutes();
    hours = hours < 10 ? '0' + hours : hours;
    minutes = minutes < 10 ? '0' + minutes : minutes;
    let time = hours + ':' + minutes, day = date.getDate(), month = getMonths()[date.getMonth()], year = date.getFullYear().toString();
    return { time, day, month, year };
};
const getStaticDate = (date) => {
    const { time, day, month, year } = makeTime(new Date(date));
    return `${time}, ${day} ${month} ${year[2] + year[3]}'`;
};
exports.getStaticDate = getStaticDate;


/***/ }),

/***/ "./public/assets/js/src/helpers/error-container.ts":
/*!*********************************************************!*\
  !*** ./public/assets/js/src/helpers/error-container.ts ***!
  \*********************************************************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.showError = void 0;
const showError = (id, errorMsg) => {
    const parent = $(`#${id}-error`);
    $('p', parent[0]).text(errorMsg);
    parent.show();
};
exports.showError = showError;


/***/ }),

/***/ "./public/assets/js/src/helpers/fetch.ts":
/*!***********************************************!*\
  !*** ./public/assets/js/src/helpers/fetch.ts ***!
  \***********************************************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.uploadImage = void 0;
exports["default"] = async (uri, { method = 'POST', headers = { 'Content-Type': 'application/json;charset=utf-8' }, body = {} } = {}) => {
    const response = await fetch(uri, { method, headers, body: JSON.stringify(body) });
    return await response.json();
};
const uploadImage = async (url, body) => {
    return await (await fetch(url, {
        method: 'POST',
        body
    })).json();
};
exports.uploadImage = uploadImage;


/***/ }),

/***/ "./public/assets/js/src/helpers/modal.ts":
/*!***********************************************!*\
  !*** ./public/assets/js/src/helpers/modal.ts ***!
  \***********************************************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.closeModal = exports.openModal = void 0;
const openModal = (parent) => {
    $(`#${parent}-modal`).removeClass('modal--closed');
};
exports.openModal = openModal;
const closeModal = (parent) => {
    $(`#${parent}-modal`).addClass('modal--closed');
};
exports.closeModal = closeModal;


/***/ }),

/***/ "./public/assets/js/src/helpers/popup.ts":
/*!***********************************************!*\
  !*** ./public/assets/js/src/helpers/popup.ts ***!
  \***********************************************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports["default"] = ({ type, title, message }) => {
    if (!$('.popup-container')[0])
        $('<div class="popup-container">').appendTo(document.body);
    let popup = $('.popup'), length = Array.from(popup).length, icon = type == 'error' ? 'exclamation' : 'check';
    $(`
        <div class="popup popup--${type} flex" style="margin-top: ${length * 30}px; z-index: ${length + 1}">
            <div class="popup__icon flex flex--j-center flex--a-center">
                <svg class="image--icon" style="width: 2rem; height: 2rem;">
                    <use href="#${icon}"></use>
                </svg>
            </div>
            <div class="popup__message">
                <h4>${title}</h4>
                <p>${message}</p>
                <svg class="popup__message__close image--icon" style="width: 2rem; height: 2rem;">
                    <use href="#cross"></use>
                </svg>
            </div>
        </div>
    `).appendTo($('.popup-container')[0]);
    $($('.popup__message__close')[length]).on('click', (e) => {
        const popup = $(e.currentTarget.parentElement.parentElement)[0];
        popup.classList.remove('popup--open');
        setTimeout(() => {
            popup.remove();
        }, 1000);
    });
    setTimeout(() => {
        $('.popup')[length].classList.add('popup--open');
    }, 200);
};


/***/ }),

/***/ "./public/assets/js/src/middleware/index.ts":
/*!**************************************************!*\
  !*** ./public/assets/js/src/middleware/index.ts ***!
  \**************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
const oddlyjs_1 = __webpack_require__(/*! oddlyjs */ "../oddlyjs/index.ts");
const fetch_1 = __importDefault(__webpack_require__(/*! ../helpers/fetch */ "./public/assets/js/src/helpers/fetch.ts"));
const Payment_1 = __webpack_require__(/*! ../events/Payment */ "./public/assets/js/src/events/Payment.ts");
exports["default"] = () => {
    oddlyjs_1.Middleware.repeat(async (next) => {
        oddlyjs_1.Environment.put('userInfo', (await (0, fetch_1.default)('/user/get/by/session')).userInfo, true);
        next();
    });
    oddlyjs_1.Router.use('organizer.pay').onDOMLoaded(() => {
        const price = parseInt(oddlyjs_1.Router.currentRoute.query.get('p'));
        const paymentId = parseInt(oddlyjs_1.Router.currentRoute.query.get('i'));
        if (price < 50)
            return;
        paypal.Buttons({
            // Set up the transaction
            createOrder: async function (data, actions) {
                return actions.order.create({
                    purchase_units: [{
                            amount: {
                                value: Math.round(price / 18)
                            }
                        }]
                });
            },
            // Finalize the transaction
            onApprove: function (data, actions) {
                return actions.order.capture().then(function (orderData) {
                    // oder id = orderData.id
                    (0, Payment_1.makePayment)(price, paymentId);
                    (0, oddlyjs_1.Next)('/organizer/payments');
                });
            }
        }).render('#paypal-button-container');
    });
};


/***/ }),

/***/ "./public/assets/js/src/routes/dj.ts":
/*!*******************************************!*\
  !*** ./public/assets/js/src/routes/dj.ts ***!
  \*******************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
const oddlyjs_1 = __webpack_require__(/*! oddlyjs */ "../oddlyjs/index.ts");
exports["default"] = () => {
    (0, oddlyjs_1.Route)({
        name: 'dj.sign.up',
        url: '/sign-up',
        layoutpath: 'auth'
    });
    (0, oddlyjs_1.Route)({
        name: 'dj.sign.in',
        url: '/sign-in',
        layoutpath: 'auth'
    });
    (0, oddlyjs_1.Route)({
        name: 'dj.schedule',
        url: '/my-schedule',
        layoutpath: 'info'
    });
    (0, oddlyjs_1.Route)({
        name: 'dj.profile',
        url: '/profile',
        layoutpath: 'info'
    });
    (0, oddlyjs_1.Route)({
        name: 'dj.profile.fees',
        url: '/profile/fees',
        layoutpath: 'info'
    });
};


/***/ }),

/***/ "./public/assets/js/src/routes/index.ts":
/*!**********************************************!*\
  !*** ./public/assets/js/src/routes/index.ts ***!
  \**********************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
const dj_1 = __importDefault(__webpack_require__(/*! ./dj */ "./public/assets/js/src/routes/dj.ts"));
const organizer_1 = __importDefault(__webpack_require__(/*! ./organizer */ "./public/assets/js/src/routes/organizer.ts"));
exports["default"] = () => {
    (0, dj_1.default)();
    (0, organizer_1.default)();
};


/***/ }),

/***/ "./public/assets/js/src/routes/organizer.ts":
/*!**************************************************!*\
  !*** ./public/assets/js/src/routes/organizer.ts ***!
  \**************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
const oddlyjs_1 = __webpack_require__(/*! oddlyjs */ "../oddlyjs/index.ts");
exports["default"] = () => {
    (0, oddlyjs_1.Route)({
        name: 'organizer.sign.up',
        url: '/organizer/sign-up',
        layoutpath: 'auth'
    });
    (0, oddlyjs_1.Route)({
        name: 'organizer.sign.in',
        url: '/organizer/sign-in',
        layoutpath: 'auth'
    });
    (0, oddlyjs_1.Route)({
        name: 'organizer.payments',
        url: '/organizer/payments',
        layoutpath: 'info'
    });
    (0, oddlyjs_1.Route)({
        name: 'organizer.pay',
        url: '/organizer/pay',
        layoutpath: 'info'
    });
    (0, oddlyjs_1.Route)({
        name: 'organizer.event.manager',
        url: '/organizer/event-manager',
        layoutpath: 'info'
    });
    (0, oddlyjs_1.Route)({
        name: 'organizer.event.view',
        url: '/organizer/event-view',
        layoutpath: 'info'
    });
};


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module is referenced by other modules so it can't be inlined
/******/ 	var __webpack_exports__ = __webpack_require__("./public/assets/js/src/app.ts");
/******/ 	
/******/ })()
;