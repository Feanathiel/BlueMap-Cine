export class RefMap {
    _objIdMap = new WeakMap();
    _objectCount = 0;

    getId(object) {
        if (!this._objIdMap.has(object)) {
            this._objIdMap.set(object, ++this._objectCount);
        }

        return this._objIdMap.get(object);
    }
}
