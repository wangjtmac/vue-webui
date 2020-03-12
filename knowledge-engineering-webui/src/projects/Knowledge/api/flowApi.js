/**
 * 流程相关api
 * @Author: zhanbh
 * @Date: 2019-11-27
 * @Project knowledge-engineering-webui
 */

import * as reqUtil from './reqUtil'

/**
 * 获取数据库导入计算左侧树数据
 * @param domainId
 * @returns {Promise<*>}
 */
export async function getDBMenuTree(domainId) {
    return await reqUtil.get({
        url: 'getOfflineWarehouse',
        errorMsg: '获取数据库表数据异常'
    }, {domainId});
}

/**
 * 获取数据库导入计算左侧树数据
 * @param domainId
 * @returns {Promise<*>}
 */
export async function getOfflineRuleScheme(domainId) {
    return await reqUtil.get({
        url: 'getOfflineRuleScheme',
        errorMsg: '获取离线规则树数据异常'
    }, {domainId});
}

/**
 * 创建离线库导入流程
 * @param params
 * @returns {Promise<*>}
 */
export async function createDBImportFlow(params) {
    let data =  await reqUtil.post({
        url: 'dbImport/getTransId',
        errorMsg: '新建流程异常',
        successMsg: '新建流程成功'
    }, params);
    data.result = data.transId;
    return data;
}

/**
 * 创建离线规则流程
 * @param params
 * @returns {Promise<*>}
 */
export async function createOfflineComputeFlow(params) {
    let data =  await reqUtil.post({
        url: 'offlineInputTrans/buildOfflineComputeTrans',
        errorMsg: '新建流程异常',
        successMsg: '新建流程成功'
    }, params);
    data.result = data.transId;
    return data;
}

/**
 * 获取离线库导入流程图数据
 * @param params
 * @returns {Promise<*>}
 */
export async function getDbImportGraph(params) {
    let data =  await reqUtil.post({
        url: 'dbImport/getProcessPlanGraph',
        errorMsg: '获取流程图数据异常',
        successMsg: false
    }, params);
    data.result = data.graph;
    return data;
}

/**
 * 获取离线规则流程图数据
 * @param params
 * @returns {Promise<*>}
 */
export async function getOfflineGraph(params) {
    let data =  await reqUtil.post({
        url: 'offlineInputTrans/getOfflineInputTransGraph',
        errorMsg: '获取流程图数据异常',
        successMsg: false
    }, params);
    data.result = data.graph;
    return data;
}

/**
 * 获取离线库导入流程图数据节点配置信息
 * @param params
 * @returns {Promise<*>}
 */
export async function getDbImportConfig(params) {
    return await reqUtil.post({
        url: 'dbImport/getDbImportConfigInfo',
        errorMsg: '获取流程图节点配置异常',
        successMsg: false
    }, params);
}

/**
 * 获取离线库导入流程图数据节点配置信息
 * @param params
 * @returns {Promise<*>}
 */
export async function saveDbImportConfig(params) {
    return await reqUtil.post({
        url: 'dbImport/updateDbImportConfigInfo',
        errorMsg: '保存流程图节点配置异常',
        successMsg: '保存成功'
    }, params);
}

/**
 * 执行方案
 * @param params
 * @returns {Promise<*>}
 */
export async function startTrans(transId) {
    return await reqUtil.post({
        url: 'knowledgeTrans/startTrans',
        errorMsg: '执行方案异常',
        successMsg: true
    }, {}, { params: {transId}});
}

/**
 * 暂停方案
 * @param params
 * @returns {Promise<*>}
 */
export async function stopTrans(transId) {
    return await reqUtil.post({
        url: 'knowledgeTrans/stopTrans',
        errorMsg: '暂停方案异常',
        successMsg: true
    }, {}, { params: {transId}});
}

/**
 * 删除方案
 * @param params
 * @returns {Promise<*>}
 */
export async function deleteTrans(transId) {
    return await reqUtil.post({
        url: 'knowledgeTrans/deleteTrans',
        errorMsg: '删除方案异常',
        successMsg: true
    }, {}, { params: {transId}});
}

/**
 * 调度配置
 * @param params
 * @returns {Promise<*>}
 */
export async function schedulingConfiguration(transId) {
    return await reqUtil.post({
        url: 'knowledgeTrans/getJobInfo',
        errorMsg: '查看方案调度配置异常'
    }, {}, { params: {transId}});
}

/**
 * 保存调度配置
 * @param params
 * @returns {Promise<*>}
 */
export async function saveJobInfo(params) {
    return await reqUtil.post({
        url: 'knowledgeTrans/updateTransformSchedule',
        errorMsg: '保存调度配置异常',
        successMsg: true
    }, params);
}

