interface StringMap<T> {
  [key: string]: T;
}
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