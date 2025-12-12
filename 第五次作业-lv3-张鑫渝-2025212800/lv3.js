function DeepClone(obj) {
    if (obj === null || typeof obj !== 'object') {
        return obj;
    }
    if (Array.isArray(obj)) {
        const nAry = [];
        for (let i = 0; i < obj.length; i++) {
            nAry[i] = DeepClone(obj[i]);
        }
        return nAry;
    }

    const newObj = {};

    for (let key in obj) {
        if (obj.hasOwnProperty(key)) {
            newObj[key] = DeepClone(obj[key]);
        }
    }
    return newObj;
}