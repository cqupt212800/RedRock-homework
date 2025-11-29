// 数组拉平
const arr = [[1, 2], [3, 4], [5, 6]]
function fn(array) {
    // 初始化数组为[]（使用ES6语法），第一次reduce回调中相当于执行[].concat([1,2])
    // 之后正常叠加
    const a = array.reduce((newArr = [], present) => {
        console.log(newArr); //[1,2] //[1,2,3,4]  //[1,2,3,4,5,6]
        return newArr.concat(present)
    })
    return a;
}
console.log(fn(arr));