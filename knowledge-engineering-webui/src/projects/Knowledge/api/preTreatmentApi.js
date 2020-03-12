/**
 * 领域行为相关接口
 * @Author: zhanbh
 * @Date: 2019-12-11
 * @Project knowledge-engineering-webui
 */

import * as reqUtil from './reqUtil';

/**
 * 查询对象相关行为
 * @returns {Promise<*>}
 */
export async function delCorpusPreSchemeById (params) {
    let data = await reqUtil.post({
        url: 'delCorpusPreSchemeById',
        errorMsg: '删除语料预处理失败',
        successMsg: false
    }, params
    );
    return data;
}
export async function getCorpusPreScheme (params) {
    let data = await reqUtil.post({
            url: 'getCorpusPreScheme',
            errorMsg: '查询语料预处理方案异常',
            successMsg: false
        }, params
    );
    return data;
}

export async function addCorpusPreScheme (params) {
    let data = await reqUtil.post({
            url: 'addCorpusPreScheme',
            errorMsg: '新增语料预处理方案异常',
            successMsg: false
        }, params
    );
    return data;
}

export async function updateCorpusPreScheme (params) {
    return await reqUtil.post({
            url: 'updateCorpusPreScheme',
            errorMsg: '修改语料预处理方案异常',
            successMsg: false
        }, params
    );
}

