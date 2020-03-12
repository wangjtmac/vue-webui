/**
 * 数据源接口，库，表，字段
 * @Author: zhanbh
 * @Date: 2019-11-29
 * @Project knowledge-engineering-webui
 */

import * as reqUtil from './reqUtil'

export async function getDataSources() {
    let data = await reqUtil.get({
        url: 'getDatasourceTree',
        errorMsg: '获取数据源异常'
    });
    return {
        code: data.code,
        result: data.dataSourceList
    }
}

export async function getDataTables(dataSourceId) {
    return await reqUtil.get({
        url: 'getTableByDataSource',
        errorMsg: '获取数据库表异常'
    }, {
        dataSourceId
    });
}

export async function getDataColumns(tableId,dataType) {
    return await reqUtil.get({
        url: 'getTableColumnsByObjId',
        errorMsg: '获取数据库表字段异常'
    }, {
        tableId,dataType
    });
}

/**
 * 数据源仓库类，
 * 主要功能是获取过的数据不会再获取
 */
export class DataHouse {

    constructor() {
        // 数据里存的都是promise 作为存储的仓库
        this.sources = null;
        this.tablesMap = new Map();
        this.columnsMap = new Map();
    }

    /**
     * 获取数据源
     * 如果有且成功直接获取数据 否则去后台获取数据
     * @returns {Promise<any>}
     */
    async getSources() {

        if (this.sources === null) {
            this.sources = getDataSources();

        } else {
            let data = await this.sources;

            if (data.code !== 200) { // 数据请求不成功，重新请求
                this.sources = getDataSources();
            }
        }

        let data = await this.sources;

        return JSON.parse(JSON.stringify(data)); // 复制一份，防止被修改
    }

    /**
     * 获取数据表
     * 如果有且成功直接获取数据 否则去后台获取数据
     * @returns {Promise<any>}
     */
    async getTables(sourceId) {

        if ((typeof sourceId !== 'string' || `${sourceId}`.trim() === '') && typeof sourceId !== 'number') {
            return { code: 200, result: [] }
        }

        if (this.tablesMap.has(sourceId)) {
            let data = await this.tablesMap.get(sourceId);

            if (data.code !== 200) {
                this.tablesMap.set(sourceId, getDataTables(sourceId));
            }

        } else {
            this.tablesMap.set(sourceId, getDataTables(sourceId));
        }

        let data = await this.tablesMap.get(sourceId);

        return JSON.parse(JSON.stringify(data));
    }

    /**
     * 获取数据表字段
     * 如果有且成功直接获取数据 否则去后台获取数据
     * @returns {Promise<any>}
     */
    async getColumns(tableId) {
        if ((typeof tableId !== 'string' || `${tableId}`.trim() === '') && typeof tableId !== 'number') {
            return { code: 200, result: [] }
        }

        if (this.columnsMap.has(tableId)) {
            let data = await this.columnsMap.get(tableId);

            if (data.code !== 200) {
                this.columnsMap.set(tableId, getDataColumns(tableId));
            }

        } else {
            this.columnsMap.set(tableId, getDataColumns(tableId));
        }

        let data = await this.columnsMap.get(tableId);

        return JSON.parse(JSON.stringify(data));
    }
}
