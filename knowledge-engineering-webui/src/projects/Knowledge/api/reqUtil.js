/**
 * axios请求相关工具 根据需要自行增强
 * @Author: zhanbh
 * @Date: 2019-11-08
 * @Project knowledge-engineering-webui
 */
import Vue from 'vue'
import * as $message from '../assets/js/utils/messageUtil'

let $axios = Vue.prototype.$axios;

/**
 * 通用的请求方法
 * 对错误进行消息展示 默认会展示错误信息
 * 如果指定成功信息，展示成功信息
 * 返回data
 * @param config
 * @param errorMsg
 * @param successMsg 设置为true则直接展示后台返回的信息
 * @returns {Promise<*>}
 */
export async function request(config, errorMsg = '请求服务异常, 未知错误', successMsg = false ) {
    let {data} = await $axios.request(config).catch((error) => {
        return {data: {msg: '服务器异常，请联系管理员'}};
    });

    if (errorMsg && data.code !== 200) {
        $message.error(data.msg || errorMsg);
    }

    if (successMsg && data.code === 200) {

        if (successMsg === true) {
            $message.success(data.msg || '操作成功');
        } else {
            $message.success(successMsg);
        }
    }

    return data;
}

/**
 * 执行get请求
 * @param urlObj 可直接是url字符串 如果是字符串
 *         url, errorMsg, successMsg = false
 *         将errorMsg 与 successMsg 设为假值 则设置为不展示错误信息
 * @param params
 * @param config   里面的params 会合并到params，优先级比较低
 * @returns {Promise<*>}
 */
export async function get(urlObj, params = {}, config = {}) {
    if (typeof urlObj === 'string') {
        urlObj = { url: urlObj };
    }
    let { url, errorMsg, successMsg } = urlObj;
    let mergedConfig = Object.assign({}, config, {
        url,
        method: 'get',
        params
    });
    if (config.params) {
        mergedConfig.params = Object.assign({}, config.params, params);
    }
    return await request( mergedConfig, errorMsg, successMsg );
}

/**
 * 执行post请求
 * @param urlObj 可直接是url字符串 如果是字符串
 *         url, errorMsg, successMsg = false
 *         将errorMsg 与 successMsg 设为假值 则设置为不展示错误信息
 * @param data
 * @param config   里面的data 会合并到data，优先级比较低
 * @returns {Promise<*>}
 */
export async function post(urlObj, data = {}, config = {}) {
    if (typeof urlObj === 'string') {
        urlObj = { url: urlObj };
    }
    let { url, errorMsg, successMsg } = urlObj;
    let mergedConfig = Object.assign({}, config, {
        url,
        method: 'post',
        data
    });
    if (config.data) {
        mergedConfig.data = Object.assign({}, config.data, data);
    }
    return await request( mergedConfig, errorMsg, successMsg );
}

