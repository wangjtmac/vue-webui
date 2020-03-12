/**
 * 领域对象接口
 * @Author: zhanbh
 * @Date: 2019-12-02
 * @Project knowledge-engineering-webui
 */

import * as reqUtil from './reqUtil'

/**
 * 获取数据库导入特征配置数据
 * @returns {Promise<*>}
 */
export async function getDatabaseImport (objFeatureId) {
    return await reqUtil.get({
        url: 'databaseImport',
        errorMsg: '查询数据库导入特征配置异常',
        successMsg: false
    }, {objFeatureId});
}

/**
 * 获取数据库导入特征配置数据
 * @returns {Promise<*>}
 */
export async function saveDatabaseImport (params) {
    return await reqUtil.post({
        url: 'saveDatabaseImport',
        errorMsg: '保存数据库导入特征配置异常',
        successMsg: '保存成功'
    }, params);
}
/**
 * 获取数据库导入行为
 * @returns {Promise<*>}
 */
export async function behaviorLibraryInto (params) {
    return await reqUtil.post({
        url: 'behaviorLibraryInto',
        errorMsg: '数据库导入异常'
    }, params);
}

/**
 * 获取数据库导入关系
 * @returns {Promise<*>}
 */
export async function relationLibraryInto (params) {
    return await reqUtil.post({
        url: 'relationLibraryInto',
        errorMsg: '数据库导入异常',
    }, params);
}
/**
 * 获取数据库导入关系
 * @returns {Promise<*>}
 */
export async function getCodeValueByCode (params) {
    return await reqUtil.post({
        url: 'getCodeValueByCode',
        errorMsg: '数据查询异常',
        successMsg: false
    }, params);
}

export async function getDomainObjGraph(params) {
    return await reqUtil.post({
        url: `getDomainObjGraph`,
        errorMsg: '获取领域图谱数据异常'
    }, params);
}
