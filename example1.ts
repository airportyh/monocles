import { obj, compose, Lens, _ } from "./monocles";

interface IUser {
    username: string;
}

interface IProduct {
    name: string;
    price: number;
    category: ICategory;
    tags: string[];
}

interface ICategory {
    name: string;
}

interface IAppState {
    user: IUser;
    product: IProduct;
}

const s: IAppState = {
    user: { username: "airportyh" },
    product: {
        name: "Soccer ball",
        price: 19.50,
        category: {
            name: "sports"
        },
        tags: ["blah", "foo", "bar"]
    }
};

const l = compose(
    obj<IAppState>().prop("user"),
    obj<IUser>().prop("username")
);

const messageLens: Lens<IAppState, string> = {
    get(state: IAppState): string {
        return state.user.username + " has a " + state.product.name;
    },
    set(state: IAppState, value: string): IAppState {
        throw new Error("Cannot set message");
    }
};

const upperCaseLens: Lens<string, string> = {
    get(str: string): string {
        return str.toUpperCase();
    },
    set(str: string, value: string): string {
        throw new Error("Cannot set upper case");
    }
};

// const l2 = obj<IAppState>().prop2("product", "name");
// const l3 = obj<IAppState>().prop3("product", "tags", 1);
// console.log("get user.username", l.get(s));
// console.log("setting user name");
// const s2 = l.set(s, "mark");
// console.log("get user.username", l.get(s2));
// console.log("s2", s2);
// console.log("l2", l2.get(s));
// console.log("l3", l3.get(s));

// const l4 = compose(
//     l3,
//     upperCaseLens
// );
// console.log("l4", l4.get(s));

const username = _(s).prop("user").prop("username").get();
console.log(username);
const l2 = _(s).prop("product").prop("tags").prop(1);
const foo = l2.get();

console.log(l2.set("jen"));