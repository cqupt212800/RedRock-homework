// 循环
function factorialLoop(n) {
    if (n < 0) return undefined;
    if (n === 0) return 1;

    let result = 1;
    for (let i = 1; i <= n; i++) {
        result *= i;
    }
    return result;
}

// 递归
function factorialRecursive(n) {
    if (n < 0) return undefined;
    if (n === 0 || n === 1) return 1;
    return n * factorialRecursive(n - 1);
}

console.log(factorialRecursive(10));