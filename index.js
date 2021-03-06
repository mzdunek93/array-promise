"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.promiseAll = (n, thunks) => __awaiter(void 0, void 0, void 0, function* () {
    if (n === 0)
        return Promise.all(thunks.map((thunk) => thunk()));
    const head = thunks.slice(0, n);
    const tail = thunks.slice(n);
    const result = [];
    const execute = (thunk, i, runNext) => __awaiter(void 0, void 0, void 0, function* () {
        result[i] = yield thunk();
        yield runNext();
    });
    const runNext = () => __awaiter(void 0, void 0, void 0, function* () {
        const i = thunks.length - tail.length;
        const promise = tail.shift();
        if (promise !== undefined) {
            yield execute(promise, i, runNext);
        }
    });
    yield Promise.all(head.map((thunk, i) => execute(thunk, i, runNext)));
    return result;
});
class ArrayPromise extends Promise {
    flat() {
        return new ArrayPromise((resolve) => __awaiter(this, void 0, void 0, function* () { return resolve((yield this).flat()); }));
    }
    flatMap(fn, limit = 0) {
        return new ArrayPromise((resolve) => __awaiter(this, void 0, void 0, function* () {
            return resolve((yield exports.promiseAll(limit, (yield this).map((...args) => () => fn(...args)))).flat());
        }));
    }
    map(fn, limit = 0) {
        return new ArrayPromise((resolve) => __awaiter(this, void 0, void 0, function* () {
            return resolve(yield exports.promiseAll(limit, (yield this).map((...args) => () => fn(...args))));
        }));
    }
    filter(fn, limit = 0) {
        return new ArrayPromise((resolve) => __awaiter(this, void 0, void 0, function* () {
            const arr = yield this;
            const filter = yield exports.promiseAll(limit, arr.map((...args) => () => fn(...args)));
            resolve(arr.filter((_, i) => filter[i]));
        }));
    }
    reduce(fn, init) {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield this).reduce(fn, init);
        });
    }
    forEach(fn, limit = 0) {
        return __awaiter(this, void 0, void 0, function* () {
            yield exports.promiseAll(limit, (yield this).map((...args) => () => fn(...args)));
        });
    }
}
exports.default = ArrayPromise;
ArrayPromise.from = (arr) => new ArrayPromise((resolve) => resolve(arr));
