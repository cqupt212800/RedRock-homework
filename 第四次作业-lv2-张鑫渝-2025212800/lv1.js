// 我们创建了一个对象
let obj = {
    name: "Freya",
    age: 19,
    gender: 'female'
};

// 方式一
function copy(targetobj) {
    let newObj = {};
    for (let i in targetobj) {
        newObj[i] = targetobj[i];
    }
    return newObj;
}

// 生成自定义复制的3个对象
const s111 = copy(obj);
const s112 = copy(obj);
const s113 = copy(obj);

// 方式二：使用 Object.assign() 浅复制（简洁写法）
const s1 = Object.assign({}, obj);
const s2 = Object.assign({}, obj);
const s3 = Object.assign({}, obj);

// 方式三：使用展开运算符 ... 浅复制（最简洁写法）
const s11 = { ...obj };
const s12 = { ...obj };
const s13 = { ...obj };



// 分别存入数组（便于表格打印）
const scopy = [s111, s112, s113];
const assigncopy = [s1, s2, s3];
const spreadcopy = [s11, s12, s13];

// 控制台打印表格（直观展示结果）
console.log("方式1:");
console.table(scopy);

console.log("方式2:");
console.table(assigncopy);

console.log("方式3:");
console.table(spreadcopy);