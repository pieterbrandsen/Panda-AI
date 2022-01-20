interface StringMap<T> {
  [key: string]: T;
}
type StringMapGeneric<V, K extends string> = {
  [key in K]: V;
};
interface ValidatedData {
  isValid: boolean;
  nonValidObjects: string[];
}

interface Predicate<T> {
  (data:T):boolean;
}

interface SingleObject<T> {
  key:string;
  value?:T
}