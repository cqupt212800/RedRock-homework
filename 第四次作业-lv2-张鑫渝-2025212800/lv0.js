let obj = new Object();
obj.name = "Freya";
obj.age = 19;
obj.gender = "女";
console.log(obj);

let obj2 = {
    name: "Frank",
    age: 19,
    gender: "男"
};
console.log(obj2);

function Person(name, age, gender) {
    this.name = 'Mary';
    this.age = 20;
    this.gender = "女";
}
let p1 = new Person();
console.log(p1);