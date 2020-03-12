<!--
 时间选择器
 @Author: zhanbh
 @Date: 2019-11-21
-->
<template>
    <el-popover
            class="time-selector"
            placement="bottom-start"
            v-model="popVisible"
            :disabled="timeDisabled"
            transition="el-zoom-in-top"
            @show="handleShowPopper"
            :width="410">
        <el-input slot="reference"
                  class="time-input"
                  :value="valueStr"
                  prefix-icon="el-icon-time"
                  placeholder="请选择时间">
            <i slot="suffix"
               v-show="!timeDisabled && valueStr !== '' && !popVisible"
               class="el-input__icon el-icon-circle-close"
               @click.stop="handleClickClearTime"></i>
        </el-input>
        <div class="time__popper">
            <div class="mb15">
                <span class="mr20">时间类型</span>
                <el-radio-group v-model="timeType" size="small" @change="handleChangeType">
                    <el-radio :label="TIME_TYPE.STATIC_TIME">固定时间</el-radio>
                    <el-radio :label="TIME_TYPE.DYNAMIC_TIME">动态时间</el-radio>
                </el-radio-group>
            </div>
            <div v-if="timeType === TIME_TYPE.STATIC_TIME"
                 class="time__main">
                <el-date-picker
                        class="time__item"
                        v-model="staticForm.startTime"
                        type="datetime"
                        size="small"
                        :format="format"
                        :value-format="format"
                        :picker-options="pickerOptions.startTime"
                        placeholder="请选择开始时间">
                </el-date-picker>
                <span class="time__item time__item_fit">至</span>
                <el-date-picker
                        v-model="staticForm.endTime"
                        class="time__item"
                        type="datetime"
                        size="small"
                        :format="format"
                        :value-format="format"
                        :picker-options="pickerOptions.endTime"
                        placeholder="请选择结束时间">
                </el-date-picker>
            </div>
            <div v-if="timeType === TIME_TYPE.DYNAMIC_TIME"
                 class="mb15 dynamic-time">
                <el-radio-group class="time-shorthand mb15"
                                :value="shortHand"
                                size="small"
                                @input="handleChangeShortHand">
                    <el-radio :label="TIME_UNIT.DAY" border>近一天</el-radio>
                    <el-radio :label="TIME_UNIT.WEEK" border>近一周</el-radio>
                    <el-radio :label="TIME_UNIT.MONTH" border>近一月</el-radio>
                    <el-radio :label="TIME_UNIT.YEAR" border>近一年</el-radio>
                </el-radio-group>
                <div class="time__main">
                    <div class="time__item">
                        <span class="time__label">过去</span>
                        <el-input-number v-model="dynamicForm.startTime"
                                         controls-position="right"
                                         placeholder="数值"
                                         size="small"
                                         :step="1"
                                         :min="1">
                        </el-input-number>
                        <common-select class="time__unit"
                                       size="small"
                                       :clearable="false"
                                       :filterable="false"
                                       v-model="dynamicForm.startTimeUnit"
                                       :data="timeUnitOptions">
                        </common-select>
                    </div>
                    <span class="time__item time__item_fit">至</span>
                    <div class="time__item">
                        <span  class="time__label">过去</span>
                        <el-input-number v-model="dynamicForm.endTime"
                                         controls-position="right"
                                         placeholder="数值"
                                         size="small"
                                         :step="1"
                                         :min="0" @change="handleChangeNumber($event,'endTime')">
                        </el-input-number>
                        <common-select class="time__unit"
                                       size="small"
                                       :clearable="false"
                                       :filterable="false"
                                       v-model="dynamicForm.endTimeUnit"
                                       :data="timeUnitOptions">
                        </common-select>
                    </div>
                </div>
            </div>
            <div class="tr">
                <el-button size="mini" type="text" @click.stop="popVisible = false">取消</el-button>
                <el-button type="primary" size="mini" @click.stop="handleClickConfirm">确定</el-button>
            </div>
        </div>
    </el-popover>
</template>

<script>
    import { timeUnitOptions, TIME_UNIT, TIME_TYPE } from './constant';
    import dateFormatter from '@/projects/Knowledge/assets/js/utils/dateFormatter';
    import { isObject, isNotEmptyStr } from '@/projects/Knowledge/assets/js/utils/valueTool';

    import CommonSelect from '@/projects/Knowledge/components/CommonSelect';

    const _transUnit = function(value) {
        let unit = timeUnitOptions.find(item => item.value === value);

        return unit ? unit.label : value;
    };

    export default {
        name: "TimeSelector",
        inheritAttrs: false,
        inject: {
            elForm: {
                default: ''
            },
            elFormItem: {
                default: ''
            }
        },
        model: {
            event: 'change'
        },
        props: {
            value: {
                type: Object, // {timeType, startTime, endTime, startTimeUnit?, endTimeUnit?}
                default() {
                    return {}
                }
            },
            format: {
                default: 'yyyy-MM-dd HH:mm:ss'
            },
            disabled: Boolean
        },
        data() {
            const vm = this;
            return {
                TIME_UNIT,
                TIME_TYPE,
                timeUnitOptions,

                popVisible: false,
                timeType: '',

                staticInited: false,
                staticForm: {
                    startTime: '',
                    endTime: ''
                },
                pickerOptions: {
                    startTime: {
                        disabledDate(date) {
                            let endTime = vm.staticForm.endTime;

                            if (!endTime) {
                                return false;
                            } else {
                                let dateStr = dateFormatter.format(date, vm.format);
                                return dateStr >= endTime;
                            }
                        }
                    },
                    endTime: {
                        disabledDate(date) {
                            let startTime = vm.staticForm.startTime;

                            if (!startTime) {
                                return false;
                            } else {
                                let dateStr = dateFormatter.format(date, vm.format);
                                return dateStr <= startTime;
                            }
                        }
                    }
                },

                dynamicInited: false,
                dynamicForm: {
                    startTime: '',
                    endTime: '',
                    startTimeUnit: '',
                    endTimeUnit: '',
                }
            }
        },
        computed:{
            valueStr() {
                let { value } = this;

                if (!isObject(value)) {
                    value = {};
                }

                let { startTime, endTime } = value;

                if (value.timeType === TIME_TYPE.DYNAMIC_TIME) {

                    if (`${startTime}` === '0') {
                        startTime = '现在';
                    } else {
                        startTime = startTime ? `过去${startTime}${_transUnit(value.startTimeUnit)}` : '';
                    }

                    if (`${endTime}` === '0') {
                        endTime = '现在';
                    } else {
                        endTime = endTime ? `过去${endTime}${_transUnit(value.endTimeUnit)}` : '';
                    }
                }

                if (!isNotEmptyStr(startTime) && !isNotEmptyStr(endTime)) {
                    return '';
                } else if (isNotEmptyStr(startTime) && isNotEmptyStr(endTime)) {
                    return startTime === endTime ? startTime : `${startTime} - ${endTime}`;
                } else if (isNotEmptyStr(startTime)) {
                    return `${startTime} 之后`;
                } else if (isNotEmptyStr(endTime)){
                    return `${endTime} 之前`;
                }

            },

            // 动态时间快捷方式
            shortHand() {
                const vm = this;
                let { dynamicForm } = vm;

                if (`${dynamicForm.startTime}` === '1' && (!dynamicForm.endTime || dynamicForm.endTime === '0')){
                    return dynamicForm.startTimeUnit;
                }
            },

            timeDisabled() {
                const vm = this;
                return vm.disabled || (vm.elForm || {}).disabled;
            },
        },
        methods: {

            /**
             *  重置面板状态
             **/
            reset() {
                const vm = this;
                vm.timeType = '';
                vm.staticInited = false;
                vm.dynamicInited = false;
            },

            /**
             * 初始化固定时间
             * 默认值为过去一天
             **/
            initStaticTime(value = {}) {
                const vm = this;

                if (!vm.staticInited) {
                    vm.staticInited = true;

                    if (!isObject(value)) {
                        value = {};
                    }

                    let { staticForm } = vm;
                    let { startTime, endTime } = value;

                    if (!isNotEmptyStr(startTime) && !isNotEmptyStr(endTime)) { // 设置初始值 过去一天
                        let now = new Date();
                        staticForm.startTime =  dateFormatter.format(new Date(now.getTime()-24*60*60*1000), vm.format);
                        staticForm.endTime =  dateFormatter.format(now, vm.format);
                    } else {
                        staticForm.startTime = value.startTime || '';
                        staticForm.endTime = value.endTime || '';
                    }
                }
            },

            /**
             * 初始化动态时间
             * 默认值为过去一天
             **/
            initDynamicTime(value = {}) {
                const vm = this;

                if (!vm.dynamicInited) {
                    vm.dynamicInited = true;

                    if (!isObject(value)) {
                        value = {};
                    }

                    let { dynamicForm } = vm;
                    let { startTime, endTime, startTimeUnit, endTimeUnit } = value;

                    if (!startTime && startTime !== 0 && !endTime && endTime !== 0) { // 设置初始值 过去一天
                        dynamicForm.startTime = '1';
                        dynamicForm.endTime =  '0';
                        dynamicForm.startTimeUnit = TIME_UNIT.DAY;
                        dynamicForm.endTimeUnit =  TIME_UNIT.DAY;

                    } else {
                        dynamicForm.startTime = startTime === null ? undefined : startTime;
                        dynamicForm.startTimeUnit = startTimeUnit || TIME_UNIT.DAY;
                        dynamicForm.endTime =  endTime === null ? undefined : endTime;
                        dynamicForm.endTimeUnit = endTimeUnit || TIME_UNIT.DAY;
                    }
                }
            },

            /**
             * 触发值改变
             */
            emitValue(value) {
                const vm = this;

                if (!isObject(value)) {
                    value = {
                        timeType: vm.timeType,
                        ...(vm.timeType === TIME_TYPE.DYNAMIC_TIME ? vm.dynamicForm : vm.staticForm)
                    };
                }

                vm.popVisible = false;
                vm.$emit('change', value);
            },

            /**
             * 改变时间类型，初始化对应设置面板
             **/
            handleChangeType(type) {
                const vm = this;

                if (type === TIME_TYPE.STATIC_TIME) {
                    vm.initStaticTime();
                } else if (type === TIME_TYPE.DYNAMIC_TIME){
                    vm.initDynamicTime();
                }
            },

            /**
             * 设置面板显示时重新初始化面板
             */
            handleShowPopper() {
                const vm = this;
                let { value } = this;

                vm.reset();

                if (!isObject(value)) {
                    value = {};
                }

                // 目前只有两种类型 默认静态类型
                if (value.timeType === TIME_TYPE.DYNAMIC_TIME) {
                    vm.timeType = TIME_TYPE.DYNAMIC_TIME;
                    vm.initDynamicTime(value);
                } else {
                    vm.timeType = TIME_TYPE.STATIC_TIME;
                    vm.initStaticTime(value);
                }
            },

            handleClickConfirm() {
                this.emitValue();
            },

            /**
             * 时间置空
             */
            handleClickClearTime() {
                const vm = this;

                vm.emitValue({
                    timeType: TIME_TYPE.STATIC_TIME,
                    startTime: '',
                    endTime: ''
                });
            },

            /**
             * 保留两位小数
             * @param num
             * @param field
             */
            handleChangeNumber(num, field) {
                const vm = this;
                if (num) {
                    vm.dynamicForm[field] = num.toFixed(2);
                }
            },

            handleChangeShortHand(val) {
                const vm = this;
                let { dynamicForm } = vm;
                dynamicForm.startTime = 1;
                dynamicForm.endTime = 0;
                dynamicForm.startTimeUnit = val;
                dynamicForm.endTimeUnit = val;
            }
        },
        components: {
            CommonSelect
        }
    }
</script>

<style scoped lang="less">
    .time-selector{
        display: block;

        /* 输入框 */
        .time-input{
            cursor: pointer;
            /deep/ .el-input__inner {
                cursor: pointer;
            }
        }
        .time-input {
            .el-icon-circle-close{
                display: none;
            }
        }
        .time-input:hover {
            .el-icon-circle-close{
                display: inline-block;
            }
        }
        .el-date-editor.el-input{
            width: 180px;
        }
    }

    /* 弹出框 */
    .time__popper{

        /deep/ .el-input__validateIcon{ /* 如果外部有form校验 会生成这个dom，导致样式问题*/
            display: none;
        }

        /* 时间项 */
        .time__main{
            margin-bottom: 15px;
            .time__item {
                display: inline-block;
                width: calc(50% - 15px);
            }
            .time__item_fit{
                width: 30px;
                text-align: center;
            }
        }

        /* 动态时间 */
        .dynamic-time {
            .time-shorthand {
                display: flex;
                justify-content: space-around;
                .el-radio{
                    margin-right: 0;
                }
            }

            .time__label{
                width: 2.5em;
                display: inline-block;
            }
            .el-input-number{
                display: inline-block;
                width: calc(100% - 3em - 60px);
                /deep/ .el-input__inner {
                    padding-left: 5px;
                    padding-right: 35px;
                }
            }
            .time__unit{
                display: inline-block;
                width: 60px;
                float: right;
            }
        }
    }
</style>