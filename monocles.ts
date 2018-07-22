export interface Lens<S, D> {
    get(source: S): D;
    set(source: S, value: D): S;
}

export interface LensObject<O> {
    prop<K extends keyof O>(key: K): Lens<O, O[K]>;
    prop2<K1 extends keyof O, K2 extends keyof O[K1]>(key1: K1, key2: K2): Lens<O, O[K1][K2]>;
    prop3
        <K1 extends keyof O, K2 extends keyof O[K1], K3 extends keyof O[K1][K2]>
        (key1: K1, key2: K2, key3: K3): Lens<O, O[K1][K2][K3]>;
}

// Currying function to allow infering the top level type:
export function obj<O>(): LensObject<O> {
    return {
        prop<K extends keyof O>(key: K): Lens<O, O[K]> {
            return objprop<O, K>(key)
        },
        prop2<K1 extends keyof O, K2 extends keyof O[K1]>(key1: K1, key2: K2): Lens<O, O[K1][K2]> {
            return compose(
                objprop<O, K1>(key1),
                objprop<O[K1], K2>(key2)
            );
        },
        prop3
            <K1 extends keyof O, K2 extends keyof O[K1], K3 extends keyof O[K1][K2]>
            (key1: K1, key2: K2, key3: K3): Lens<O, O[K1][K2][K3]> {
            return compose3(
                objprop<O, K1>(key1),
                objprop<O[K1], K2>(key2),
                objprop<O[K1][K2], K3>(key3)
            );
        }
    }; 
}

export function objprop<O, K extends keyof O>(key: K): Lens<O, O[K]> {
    return {
        get(source: O): O[K] {
            return source[key];
        },
        set(source: O, value: O[K]): O {
            if (Array.isArray(source)) {
                return source.map((original, i) => {
                    if (i === key) {
                        return value;
                    } else {
                        return original;
                    }
                }) as any;
            } else {
                const ret = {} as O;
                for (const k in source) {
                    ret[k] = source[k];
                }
                ret[key] = value;
                return ret;
            }
        }
    }
}

export function compose<T1, T2, T3>(lens1: Lens<T1, T2>, lens2: Lens<T2, T3>): Lens<T1, T3> {
    return {
        get(source: T1): T3 {
            return lens2.get(lens1.get(source));
        },
        set(source: T1, value: T3): T1 {
            return lens1.set(source, lens2.set(lens1.get(source), value));
        }
    };
}

export function compose3<T1, T2, T3, T4>
    (lens1: Lens<T1, T2>, lens2: Lens<T2, T3>, lens3: Lens<T3, T4>): Lens<T1, T4> {
    return compose(compose(lens1, lens2), lens3);
}

export function compose4<T1, T2, T3, T4, T5>
    (lens1: Lens<T1, T2>, lens2: Lens<T2, T3>, lens3: Lens<T3, T4>, lens4: Lens<T4, T5>): Lens<T1, T5> {
    return compose(compose3(lens1, lens2, lens3), lens4);
}

// Convinience get and set functions:
export function get<T, K extends keyof T>(o: T, key: K): T[K] {
    return obj<T>().prop(key).get(o);
}

export function get2
    <T, K1 extends keyof T, K2 extends keyof T[K1]>
    (o: T, key1: K1, key2: K2): T[K1][K2] {
    return obj<T>().prop2(key1, key2).get(o);
}

export function get3
    <T, K1 extends keyof T, K2 extends keyof T[K1], K3 extends keyof T[K1][K2]>
    (o: T, key1: K1, key2: K2, key3: K3): T[K1][K2][K3] {
    return obj<T>().prop3(key1, key2, key3).get(o);
}

export function set<T, K extends keyof T>(o: T, key: K, value: T[K]): T {
    return obj<T>().prop(key).set(o, value);
}

export function set2
    <T, K1 extends keyof T, K2 extends keyof T[K1]>
    (o: T, key1: K1, key2: K2, value: T[K1][K2]): T {
    return obj<T>().prop2(key1, key2).set(o, value);
}

export function set3
    <T, K1 extends keyof T, K2 extends keyof T[K1], K3 extends keyof T[K1][K2]>
    (o: T, key1: K1, key2: K2, key3: K3, value: T[K1][K2][K3]): T {
    return obj<T>().prop3(key1, key2, key3).set(o, value);
}


// Fluent chaining style:
export function _<T>(value: T): RootChainWrapper<T> {
    return new RootChainWrapper(value);
}

class RootChainWrapper<T> {
    constructor(private object: T) {}

    prop<K extends keyof T>(key: K): LensChainWrapper<T, T[K]> {
        return new LensChainWrapper(obj<T>().prop(key), this.object);
    }

    pipe<V>(lens: Lens<T, V>): LensChainWrapper<T, V> {
        return new LensChainWrapper(lens, this.object);
    }
}

class LensChainWrapper<S, D> {
    constructor(private lens: Lens<S, D>, private original: S) {}

    prop<K extends keyof D>(key: K): LensChainWrapper<S, D[K]> {
        return new LensChainWrapper(compose(this.lens, obj<D>().prop(key)), this.original);
    }

    pipe<V>(lens: Lens<D, V>): LensChainWrapper<S, V> {
        return new LensChainWrapper(compose(this.lens, lens), this.original);
    }

    get(): D {
        return this.lens.get(this.original);
    }

    set(value: D): S {
        return this.lens.set(this.original, value);
    }
}