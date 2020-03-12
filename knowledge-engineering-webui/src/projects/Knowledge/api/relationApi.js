/**
 * 领域关系接口
 * @Author: zhanbh
 * @Date: 2019-12-02
 * @Project knowledge-engineering-webui
 */

import * as reqUtil from './reqUtil';

/**
 * 查询领域行为列表
 * @returns {Promise<*>}
 */
export async function getRelationTree (domainId) {
    let data = await reqUtil.get({
        url: 'getDomainTree',
        errorMsg: '查询领域行为列表异常',
        successMsg: false
    }, {
        domainId,
        domainObjType: '1'
    });

    data.result = data.domainTrees || [];

    return data;
}
