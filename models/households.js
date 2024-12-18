import BaseModel from "./basemodel.js";

/* The `Household` class extends `BaseModel` and defines static properties for tablename and
defaultMapping. 
*/
export default class Household extends BaseModel {
  static tablename = "households";
  static defaultMapping = ["id", "name", "description"].reduce(
    (accum, current) => {
      accum[convertSnakeToCamel(current)] = current;
    },
    {}
  );
}
