/**
 * 值判断的工具
 * @Author: zhanbh
 * @Date: 2019-12-23
 * @Project knowledge-engineering-webui
 */
export function isObject(obj) {
    return typeof obj === 'object' && obj !== null;
}

export function isNotEmptyStr(str) {
    return typeof str === 'string' && str.trim() !== '';
}

/**
 * 解析json
 * @type {{}}
 */
export function jsonToObj(json) {
    let obj = null;

    try {
        obj = JSON.parse(json)
    } catch (e) {}

    if (typeof obj !== 'object') {
        obj = null;
    }

    return obj;
};