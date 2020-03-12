<!--
 行为条件
 @Author: zhanbh
 @Date: 2019-12-10
-->
<template>
    <el-form class="behavior-condition"
             :model="form"
             ref="form"
             :rules="rules"
             hide-required-asterisk
             v-bind="$attrs"
             @submit.native.prevent>
        <div class="mb10">
            <el-form-item label="对象在" label-width="60px" prop="periodTime">
                <time-selector class="item-time" v-model="form.periodTime"></time-selector>
            </el-form-item>
            <el-form-item class="item-operations">
                <common-select
                        v-model="form.operation"
                        placeholder="操作符"
                        :props="{label: 'behLabel'}"
                        :data="inOutOptions"
                        :clearable="false">
                </common-select>
            </el-form-item>
            <el-form-item class="item-behavior" prop="behavior">
                <common-select
                        v-model="form.behavior"
                        placeholder="行为类型"
                        :props="behaviorProp"
                        :data="behaviorData"
                        :data-filter="behaviorFilter">
                </common-select>
            </el-form-item>
        </div>
        <div>
            <el-form-item class="item-site">
                <common-select
                        v-model="form.location"
                        placeholder="地理位置"
                        :props="siteProp"
                        :data="behaviorData"
                        :data-filter="siteFilter">
                </common-select>
            </el-form-item>
            <el-form-item class="item-operations">
                <common-select
                        v-model="form.function"
                        :data="functionOptions"
                        placeholder="聚合函数"
                        @change="handleChangeFunction">
                </common-select>
            </el-form-item>
            <el-form-item class="item-operations">
                <common-select
                        v-model="form.functionOper"
                        :data="operOptions"
                        placeholder="操作符"
                        :disabled="!hasFunction"
                        :clearable="false">
                </common-select>
            </el-form-item>
            <el-form-item class="item-num" :prop="hasFunction ? 'functionValue' : ''">
                <el-input-number v-model="form.functionValue"
                                 controls-position="right"
                                 placeholder="数量"
                                 :disabled="!hasFunction"
                                 :step="1"
                                 :step-strictly="form.function === FUNCTION.SUM"
                                 :min="1"
                                 @change="handleChangeNumber">
                </el-input-number>
            </el-form-item>
        </div>
    </el-form>
</template>
<script>
    import { operOptions, OPERTIONS, inOutOptions, IN_OUT, functionOptions, FUNCTION } from '../constant';
    import commonMixin from './mixin';

    import CommonSelect from '@/projects/Knowledge/components/CommonSelect';
    import TimeSelector from '../TimeSelector';
    import TreeSelect from 'ui-component-v4/lib/tree-select';

    export default {
        name: "BehaviorCondition",
        inheritAttrs: false,
        model: {
            event: 'change'
        },
        mixins: [commonMixin],
        props: {
            behaviorData: [Promise, Array, Function],
            value: Object, // { timeType startTime startTimeUnit endTime endTimeUnit, operation, behavior, location, function, functionOper, functionValue}
        },
        data() {
            const vm = this;
            return {
                inOutOptions,
                operOptions,
                functionOptions,
                FUNCTION,
                OPERTIONS,
                behaviorProp: {
                    label: 'behaviorName',
                    value: 'behaviorName'
                },
                siteProp: {
                    label: 'siteObjName',
                    value: 'siteObjName'
                },
                form: {
                    periodTime: {
                        timeType: '',
                        startTime: '',
                        endTime:'',
                        startTimeUnit: '',
                        endTimeUnit: '',
                    },
                    operation: '',
                    behavior: '',
                    location: '',
                    function: '',
                    functionOper: '',
                    functionValue: ''
                },
                rules: {
                    periodTime: { validator: vm.periodTimeValidater, trigger: 'input' },
                    behavior: { required: true, message: '行为不能为空', trigger: 'blur' },
                    functionValue: { required: true, message: '数量不能为空', trigger: 'blur' },
                },
            };
        },
        computed: {
            hasFunction() {
                return this.form.function !== '';
            }
        },
        methods: {
            initSpecialFormField(value = {}) {
                const vm = this;

                let { form } = vm;


                Object.keys(form).forEach(key => {

                   if (key !== 'periodTime') {

                       if (key === 'operation') {
                           form[key] = value[key] || IN_OUT.IN;
                       } else {
                           form[key] = value[key] || '';
                       }
                   }
                });

                // 触发函数改变事件，进行函数相关字段初始化
                vm.handleChangeFunction();
            },

            /**
             * 通过地理位置过滤行为
             * @param item
             * @returns {boolean}
             */
            behaviorFilter(item) {
                let { siteProp, form } = this;

                if (form.location === '') {
                    return true;
                } else {
                    return item[siteProp.value] === form.location;
                }
            },

            /**
             * 通过行为过滤地理位置
             * @param item
             * @returns {boolean}
             */
            siteFilter(item) {
                let { behaviorProp, siteProp, form } = this;

                // 没有地理位置信息，不展示
                if (!item[siteProp.value]) {
                    return false;
                }

                if (form.behavior === '') {
                    return true;
                } else {
                    return item[behaviorProp.value] === form.behavior
                }
            },

            /**
             * 函数改变事件
             * @param value
             */
            handleChangeFunction() {
                const { hasFunction, form } = this;

                form.functionOper = hasFunction ? form.functionOper || OPERTIONS.EQ : '';
                form.functionValue = hasFunction ? form.functionValue || '1' : undefined; // 只有undefined el-input-number 才会显示空
            },

            /**
             * 保留两位小数
             * @param num
             * @param field
             */
            handleChangeNumber(num) {
                const vm = this;
                if (num) {
                    vm.form.functionValue = num.toFixed(2);
                }
            }
        },
        created() {
        },
        components: {
            CommonSelect,
            TimeSelector,
            TreeSelect
        }
    };
</script>
<style scoped>
    .el-form-item{
        display: inline-block;
        margin-bottom: 0;
    }
    .el-form-item+.el-form-item {
        margin-left: 10px;
    }
    .el-input-number{
        width: 100%;
    }

    .item-time{
        width: 332px;;
    }
    .item-operations{
        width: 105px;
    }
    .item-behavior{
        width: calc(100% - 517px);
    }
    .item-site,.item-num {
        width: calc(50% - 120px);
    }
</style>