
var name = 'window'
function Person(name) {
    this.name = name
    this.foo1 = function () {
        console.log(this.name)
    }
    this.foo2 = () => console.log(this.name)
    this.foo3 = function () {
        return function () {
            console.log(this.name)
        }
    }
    this.foo4 = function () {
        return () => {
            console.log(this.name)
        }
    }
}

var person1 = new Person('person1')
var person2 = new Person('person2')

person1.foo1()//foo1普通函数，this 指向 person1，输出 person1
person1.foo1.call(person2)//使用 call 显式绑定 this 为 person2，输出 person2

person1.foo2()//foo2箭头函数，箭头函数的 this 在定义时确定，构造函数中的 this，构造函数中的 this 指向 person1
person1.foo2.call(person2)//箭头函数的 this 无法通过 call改变

person1.foo3()()//返回一个普通函数，输出 undefined
person1.foo3.call(person2)()//没有输出（因为没有调用返回的函数）
person1.foo3().call(person2)//使用 call 调用该返回函数，this为 person2

person1.foo4()()//foo4 作为 person1 的调用，其 this 指向 person1
person1.foo4.call(person2)()//将 foo4 的 this 绑定为 person2
person1.foo4().call(person2)//箭头函数的 this 仍然是继承自 foo4 的 this（指向 person1）