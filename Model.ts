class Model{
  private _sources: Array<string>;

  constructor(...sources: Array<string>){
    if(sources.length == 0){
      throw new Error("No source provided");
    }

    this._sources = sources;
  }

  get sources(): Array<string>{
    return this._sources;
  }
}

export { Model }