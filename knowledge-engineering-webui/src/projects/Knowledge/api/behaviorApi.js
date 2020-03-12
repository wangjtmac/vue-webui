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
export async function getBehaviorByObj (objId) {
    let data = await reqUtil.get({
        url: 'queryBehaviorByObj',
        errorMsg: '查询对象相关行为异常',
        successMsg: false
    }, {
        objId,
    });

    data.result = data.commonVoList || [];

    return data;
}
