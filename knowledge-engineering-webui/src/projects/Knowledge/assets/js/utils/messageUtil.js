/**
 * 页面消息提示工具
 * 基于element-ui 的 Message
 * 同样信息不会展示两条，会替换前一条
 * @Author: zhanbh
 * @Date: 2019-11-15
 * @Project knowledge-engineering-webui
 */

import { Message } from 'element-ui';

// 信息的映射，同种信息只保留一个实例
const _msgMap = new Map();

/**
 * 通用
 * @param msg 可以直接是config
 * @param config
 * @returns {*}
 */
export function message(msg, config = {}) {
    let mergedConfig = {};

    if (typeof msg === 'object') {
        mergedConfig =  Object.assign( mergedConfig, msg, config);
    } else {
        mergedConfig = Object.assign( mergedConfig, config, { message: msg });
    }

    let message = mergedConfig.message;

    // 重写onClose 用于清除_msgMap
    let customFn = mergedConfig.onClose;
    mergedConfig.onClose = (...args) => {
        _msgMap.delete(message);
        if (customFn instanceof Function) {
            customFn(...args);
        }
    }

    // 清除上一个相同信息的实例
    let lastMsg = _msgMap.get(message);
    if (lastMsg) {
        lastMsg.close();
    }
    _msgMap.set(message,  Message(mergedConfig));
    return _msgMap.get(message);
}

/**
 *
 * @param msg 可以直接是config
 * @param config
 * @returns {*}
 */
export function error(msg, config = {}) {
    return message(msg, Object.assign({}, config, {type: 'error'}));
}

/**
 *
 * @param msg 可以直接是config
 * @param config
 * @returns {*}
 */
export function success(msg, config = {}) {
    return message(msg, Object.assign({}, config, {type: 'success'}));
}

/**
 *
 * @param msg 可以直接是config
 * @param config
 * @returns {*}
 */
export function warning(msg, config = {}) {
    return message(msg, Object.assign({}, config, {type: 'warning'}));
}

/**
 *
 * @param msg 可以直接是config
 * @param config
 * @returns {*}
 */
export function info(msg, config = {}) {
    return message(msg, Object.assign({}, config, {type: 'info'}));
}