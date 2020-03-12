/**
 * 领域接口
 * @Author: zhanbh
 * @Date: 2019-11-20
 * @Project knowledge-engineering-webui
 */
import * as reqUtil from './reqUtil'

export async function add(params) {
    return await reqUtil.post({
        url: 'createDomain',
        errorMsg: '新增领域异常',
        successMsg: '新增领域成功'
    }, params);
}

export async function update(params) {
    return await reqUtil.post({
        url: 'changeDomain',
        errorMsg: '更新领域异常',
        successMsg: '更新领域成功'
    }, params);
}

export async function getAll() {
    return await reqUtil.get({
        url: 'getAllDomain',
        errorMsg: '查询领域列表异常',
        successMsg: false
    });
}

export async function del(id, name = '') {
    return await reqUtil.post({
        url: `removeDomainTree?domainId=${id}`,
        errorMsg: '删除领域异常',
        successMsg: name && `已删除 ${name}`
    });
}

export async function getDomainGraph(domainId) {
    return await reqUtil.get({
        url: `getDomainGraph`,
        errorMsg: '获取领域图谱数据异常'
    }, {domainId});
}


