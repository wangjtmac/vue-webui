/**
 * 领域对象接口
 * @Author: zhanbh
 * @Date: 2019-12-02
 * @Project knowledge-engineering-webui
 */

import * as reqUtil from './reqUtil'

/**
 * 获取对象特征列表
 * @param params domainId domainObjIdList
 * @returns {Promise<*>}
 */
export async function getFeatureList(params) {
    return await reqUtil.post({
        url: 'selectDomainObj',
        errorMsg: '查询领域对象特征列表异常',
        successMsg: false
    }, params);
}

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
 * 保存数据库导入特征配置数据
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
 * 获取离线导入特征配置数据
 * @param featureId
 * @returns {Promise<*>}
 */
export async function getOfflineCalc(objFeatureId) {
    let data = await reqUtil.get({
        url: 'getOfflineCalFeatureByObjFeatureId',
        errorMsg: '查询离线导入特征配置异常',
        successMsg: false
    }, {objFeatureId});

    data.result = data.ConditionsVo;

    return data;
}

/**
 * 保存离线导入特征配置数据
 * @returns {Promise<*>}
 */
export async function saveOfflineCalc (params) {
    return await reqUtil.post({
        url: 'addOfflineCalFeature ',
        errorMsg: '保存离线导入特征配置异常',
        successMsg: '保存成功'
    }, params);
}