/**
 * 计算特征条件项的通用方法，混入到条件项组件
 * @Author: zhanbh
 * @Date: 2019-12-23
 * @Project knowledge-engineering-webui
 */

import { Form } from 'element-ui';
import { isObject, isNotEmptyStr } from '@/projects/Knowledge/assets/js/utils/valueTool';

//-------------------------------------------//
/**
 * 生成表单方法，用于混入，注意原生表单引用必须是form
 * @type {{}}
 */
let formMethods = {};
Object.keys(Form.methods).forEach(key => {
    formMethods[key] = function (...args) {
        const vm = this;
        return vm.$refs.form && vm.$refs.form[key](...args);
    }
});

export default {
    inheritAttrs: false,
    model: {
        event: 'change'
    },
    watch: {

        /**
         * 值有改变，则同步到表单去
         */
        value: {
            handler(value) {
                const vm = this;
                vm.initConditionForm(value);
            },
            immediate: true,
            deep: true
        },

        /**
         * 表单有改变，同步到值去
         */
        form: {
            handler(form) {
                this.handleChange();
            },
            deep: true
        }
    },
    methods: {

        /**
         * 初始化条件表单
         * @param value
         */
        initConditionForm(value = {}) {
            const vm = this;
            let { form } = vm;

            if (!isObject(value)) {
                value = {}
            }

            // 初始化时间段
            if (form.hasOwnProperty('periodTime')) {
                let { periodTime } = form;

                if (typeof periodTime !== 'object' || null === periodTime) {
                    periodTime = {};
                    form.periodTime = periodTime;
                }

                periodTime.timeType = value.timeType || '';
                periodTime.startTime = value.startTime;
                periodTime.startTimeUnit = value.startTimeUnit || '';
                periodTime.endTime = value.endTime ;
                periodTime.endTimeUnit = value.endTimeUnit || '';
            }

            // 初始化特有字段
            if (vm.initSpecialFormField instanceof Function) {
                vm.initSpecialFormField(value); // 定义在各自的组件中，特殊属性特殊处理
            }

            vm.handleChange();
        },

        /**
         * 事件段校验器
         * @param rule
         * @param value
         * @param callback
         */
        periodTimeValidater(rule, time, callback) {
            if (!isObject(time)){
                callback(new Error('时间不能为空'));
            } else {

                let { startTime, endTime } = time;

                if (typeof startTime === 'number') {
                    startTime = `${startTime}`;
                }

                if (typeof endTime === 'number') {
                    endTime = `${endTime}`;
                }

                if (!isNotEmptyStr(startTime) && !isNotEmptyStr(endTime)) {
                    callback(new Error('时间不能为空'));
                } else {
                    callback();
                }
            }
        },

        /**
         * form值改变，抛事件到父级组件,
         */
        handleChange() {
            const vm = this;
            let {value} = vm;
            let params = {...vm.form};

            if (!isObject(value)) {
                value = {}
            }

            if (typeof vm.form.periodTime === 'object') {
                params = {...params, ...vm.form.periodTime};
                delete params['periodTime'];
            }

            Object.assign(value, params);

            vm.$emit('change', value);
        },
        ...formMethods
    }
}
