/**
 * 特征项相关接口
 * @Author: zhanbh
 * @Date: 2019-12-12
 * @Project knowledge-engineering-webui
 */

import * as reqUtil from './reqUtil'

export async function batchAdd(params) {
    return await reqUtil.post({
        url: 'bulkImport',
        errorMsg: '导入特征异常',
        successMsg: true
    }, params);
}

/**
 * 获取特征项图谱
 * @param domainId
 * @returns {Promise<*>}
 */
export async function getFeaturesGraph(params) {
    return await reqUtil.post({
        url: `getFeaturesGraph`,
        errorMsg: '获取领域图谱数据异常'
    }, params);
}

export async function getObjFeatureName (domainId,objId) {
    return await reqUtil.get({
        url: 'getObjFeatureName',
        errorMsg: '查询数据库特征名称异常',
        successMsg: false
    }, {domainId,objId});
}

