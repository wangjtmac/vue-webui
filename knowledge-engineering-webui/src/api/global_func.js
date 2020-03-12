function flyMPage(data, curP, pageSize) { //分页操作
    var created = [];
    for (let i = 1; i <= pageSize; i++) {
        data[(curP - 1) * pageSize + i] ? created.push(data[(curP - 1) * pageSize + i]) : created.push({});
    }
    return created;
}

export default {
    install(Vue){
        Vue.prototype.flyMPage = (data, curP, pageSize) => flyMPage(data, curP, pageSize);
    }
}