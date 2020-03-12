/**
 * 常量相关接口
 * @Author: zhanbh
 * @Date: 2019-12-16
 * @Project knowledge-engineering-webui
 */

import * as reqUtil from './reqUtil';

/**
 * 获取数据库字段数据类型
 * @returns {Promise<*>}
 */
export async function getDataFieldType() {
    return await reqUtil.get({
        url: 'getKEEnumDomainStandardType',
        errorMsg: '获取数据类型字典数据异常'
    });
}

