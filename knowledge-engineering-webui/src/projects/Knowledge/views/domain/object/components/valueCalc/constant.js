/**
 * 值计算用到的一些常量
 * @Author: zhanbh
 * @Date: 2019-12-09
 * @Project knowledge-engineering-webui
 */

//-------------------------------------------------------------------//
/**
 * 操作符选项
 * @type {*[]}
 */
export let operOptions = [
    { label: '等于', value: 'eq' },
    { label: '不等于', value: 'neq' },
    { label: '大于', value: 'gt' },
    { label: '大于等于', value: 'gte' },
    { label: '小于', value: 'lt' },
    { label: '小于等于', value: 'lte' }
];

/**
 * 操作符常量
 * @type {{EQ: string, NEQ: string, GT: string, GTE: string, LT: string, LTE: string}}
 */
export let OPERTIONS = {
    EQ: 'eq',
    NEQ: 'neq',
    GT: 'gt',
    GTE: 'gte',
    LT: 'le',
    LTE: 'lte',
};

//-------------------------------------------------------------------//

/**
 * 开关选项
 * @type {*[]}
 */
export let inOutOptions = [
    { label: '包含', relLabel: '存在', behLabel: '做过', value: 'eq' },
    { label: '不包含', relLabel: '不存在', behLabel: '未做过', value: 'neq' }
];

/**
 * 开关常量
 * @type {{IN: string, OUT: string}}
 */
export let IN_OUT = {
    IN: 'eq',
    OUT: 'neq'
};

//----------------------------------------------------//
/**
 * 深度选项
 * @type {*[]}
 */
export let depthOptions = [
    { label: '1', value: '1' },
    /*{ label: '2', value: '2' },
    { label: '3', value: '3' }*/
];

/**
 * 深度常量
 * @type {{ONE: string, TWO: string, THREE: string}}
 */
export let DEPTH = {
    ONE: '1',
    TWO: '2',
    THREE: '3'
};

//------------------------------------------------//
/**
 * 函数选项
 * @type {*[]}
 */
export let functionOptions = [
    { label: '总次数', value: 'SUM' },
    { label: '平均次数', value: 'AVG' }
];

/**
 * 函数常量
 * @type {{SUM: string, AVG: string}}
 */
export let FUNCTION = {
    SUM: 'SUM',
    AVG: 'AVG'
};

//----------------------------------------------------//
/**
 * 逻辑选项
 * @type {*[]}
 */
export let logicOptions = [
    { label: '且', value: 'and' },
    { label: '或', value: 'or' },
];

/**
 * 逻辑常量
 * @type {{AND: string, OR: string}}
 */
export let LOGIC = {
    AND: 'and',
    OR: 'or'
};

//------------------------------------------//

export const timeUnitOptions = [
    { label: '年', value: 'YEAR'},
    { label: '月', value: 'MONTH'},
    { label: '周', value: 'WEEK'},
    { label: '日', value: 'DAY'},
    { label: '时', value: 'HOUR'},
    { label: '分', value: 'MINUTE'},
    { label: '秒', value: 'SECOND'},
];

export const TIME_UNIT = {
    YEAR : 'YEAR',
    MONTH : 'MONTH',
    WEEK : 'WEEK',
    DAY : 'DAY',
    HOUR : 'HOUR',
    MINUTE : 'MINUTE',
    SECOND : 'SECOND'
};

//------------------------------//
export const timeTypeOptions = [
    { label: '固定时间', value: 'static'},
    { label: '动态时间', value: 'dynamic'},
];

export const TIME_TYPE = {
    STATIC_TIME: 'static',
    DYNAMIC_TIME: 'dynamic',
}