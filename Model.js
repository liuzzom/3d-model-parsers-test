class Model {
    constructor(...sources) {
        if (sources.length == 0) {
            throw new Error("No source provided");
        }
        this._sources = sources;
    }
    get sources() {
        return this._sources;
    }
}
export { Model };
