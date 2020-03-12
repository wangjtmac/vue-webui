<!--
 特征值离线计算
 一项条件的通用格式{timeType startTime startTimeUnit endTime endTimeUnit feature operation featureValue relation behavior location function functionOper functionValue}
 @Author: zhanbh
 @Date: 2019-11-19
-->
<template>
    <div class="offline-calc" v-loading="isLoading">
        <div class="mb20">
            <div class="calc__item">
                <span class="calc__item__title">特征值名称 :</span>
                <editable-tags v-model="currentRule"
                               :disabled="disabled"
                               :list="valueRuleList"
                               :props="tagProps"
                               :before-change="validateRuleItemForm"
                               :before-add="validateRuleItemForm"
                               @add="handleAddRule"
                               @delete="handleDeleteRule"
                               @edit="handleEditName">
                </editable-tags>
            </div>
            <div class="calc__item">
                <div>
                    <span class="calc__item__title mr20">特征规则配置 :</span>
                    <el-checkbox v-for="config in ruleTypeConfigs"
                                 v-show="!disabled"
                                 :key="config.checkLabel"
                                 :label="config.checkLabel"
                                 :value="ruleSwitches && ruleSwitches[config.field]"
                                 :disabled="ruleSwitches === null"
                                 @change="handleChangeSwitchCheck($event, config)">
                    </el-checkbox>
                </div>

                <!-- 规则面板 -->
                <el-card shadow="never">
                    <logic-container  v-if="isNotEmpty"
                                      left-width="40"
                                     :show-left="isMainLogicShow">
                        <common-select
                                slot="logic"
                                v-model="currentRule.ruleRelation"
                                class="logic-select"
                                size="mini"
                                :clearable="false"
                                :filterable="false"
                                :disabled="disabled"
                                :data="logicOptions">
                        </common-select>
                        <template>

                            <!-- 规则类型分组-->
                            <div class="rule-group"
                                 v-for="config in  ruleTypeConfigs"
                                 v-if="ruleSwitches[config.field]"
                                 :key="config.code">
                                <div class="calc__item__title">
                                    <span class="mr5">{{config.title}}</span>
                                    <i v-if="!disabled"
                                       class="btn-icon el-icon-circle-plus-outline"
                                       title="添加条件"
                                       @click="handleClickAddItem(config)">
                                    </i>
                                </div>
                                <logic-container left-width="40"
                                                 keep-space
                                                 :show-left="currentRule[config.field].length > 1">
                                    <template slot="logic">
                                        <span v-if="config.code === 'sequence'" class="db tc">且</span>
                                        <common-select
                                                v-else
                                                v-model="currentRule[config.logicField]"
                                                class="logic-select"
                                                size="mini"
                                                :clearable="false"
                                                :filterable="false"
                                                :disabled="disabled"
                                                :data="logicOptions">
                                        </common-select>
                                    </template>
                                    <template>

                                        <!-- 一项规则 -->
                                        <div class="rule-item"
                                             v-for="(ruleItem, index) in currentRule[config.field]"
                                             :key="ruleItem.key">
                                            <component :is="config.component"
                                                       v-model="currentRule[config.field][index]"
                                                       ref="ruleItemForm"
                                                       size="small"
                                                       :show-message="false"
                                                       :disabled="disabled"
                                                       v-bind="config.geneBindMethod({ ruleItem, index, config })">
                                            </component>
                                            <i v-if="!disabled"
                                               class="btn-icon btn-icon__delete el-icon-remove-outline"
                                               title="删除条件"
                                               @click="handleDeleteItem({ ruleItem, index, config })">
                                            </i>
                                        </div>
                                    </template>
                                </logic-container>
                            </div>
                        </template>
                    </logic-container>
                    <div v-else class="tc">暂无条件</div>
                </el-card>
            </div>
        </div>
        <div class="tr" v-if="!disabled">
            <el-button @click.stop="handleClickCancel">取消</el-button>
            <el-button type="primary" @click.stop="handleClickSave">保存</el-button>
        </div>
    </div>
</template>
<script>
    import { getOfflineCalc, saveOfflineCalc, getFeatureList } from '@/projects/Knowledge/api/objectApi';
    import { getRelationTree } from '@/projects/Knowledge/api/relationApi';
    import { getBehaviorByObj } from '@/projects/Knowledge/api/behaviorApi';

    import { logicOptions, LOGIC } from '../components/valueCalc/constant';
    import * as $message from '@/projects/Knowledge/assets/js/utils/messageUtil'

    import EditableTags from '../components/EditableTags';
    import LogicContainer from '../components/valueCalc/LogicContainer';
    import CommonSelect from '@/projects/Knowledge/components/CommonSelect';
    import ObjectProp from '../components/valueCalc/conditions/ObjectProp'
    import RelationCondition from '../components/valueCalc/conditions/RelationCondition'
    import BehaviorCondition from '../components/valueCalc/conditions/BehaviorCondition'
    import BehaviorSequence from '../components/valueCalc/conditions/BehaviorSequence'

    export default {
        name: "OfflineCalc",
        props: {
            data: Object, // 其中 id, objModelId, featureId 是必须的
            domainId: String,
            disabled: Boolean
        },
        data() {
            const vm = this;
            return {
                logicOptions,
                valueRuleList: [],
                tagProps: {
                    key: 'featureVal',
                    label: 'featureVal'
                },
                currentRule: null,
                ruleTypeConfigs: [ // 条件项的配置信息
                    {
                        code: 'feature', // 唯一标识
                        checkLabel: '属性条件',
                        title: '对象属性条件 :',
                        field: 'objConditions', // 条件数据对应的数据字段
                        logicField: 'objRelation', // 逻辑对应的数据字段
                        component: 'ObjectProp', // 条件对应的组件
                        geneBindMethod: vm.geneFeatureBind
                    }, {
                        code: 'relation',
                        checkLabel: '关系条件',
                        title: '对象关系条件 :',
                        field: 'relationConditions',
                        logicField: 'relRelation',
                        component: 'RelationCondition',
                        geneBindMethod: vm.geneRelationBind
                    }, {
                        code: 'behavior',
                        checkLabel: '行为条件',
                        title: '对象行为条件 :',
                        field: 'behaviorConditions',
                        logicField: 'behaviorRelation',
                        component: 'BehaviorCondition',
                        geneBindMethod: vm.geneBehaviorBind
                    }, {
                        code: 'sequence',
                        checkLabel: '行为序列条件',
                        title: '对象行为序列条件:',
                        field: 'behaviorSequence',
                        component: 'BehaviorSequence',
                        geneBindMethod: vm.geneSequenceBind
                    }
                ],
                domainDataMap: {}, // 当前对象领域有关的数据 特征，关系，行为
                ruleSwitchesMap: {}, // 条件项启用与关闭开关的映射数据
                nextItemKey: 0, // 条件项下一个键值，如果没有键值，则表单校验后修改会导致校验结果错误
                isLoading: false
            };
        },
        computed: {

            /**
             * 规则不为空
             **/
            isNotEmpty() {
                let { ruleSwitches } = this;
                return ruleSwitches !== null &&
                    Object.keys(ruleSwitches).filter(key => ruleSwitches[key] === true).length > 0;
            },
            isMainLogicShow() {
                let { ruleSwitches } = this;
                return ruleSwitches !== null &&
                    Object.keys(ruleSwitches).filter(key => ruleSwitches[key] === true).length > 1;
            },

            // 当前的规则开关数据
            ruleSwitches() { // 规则开关 四个条件
                const vm = this;
                let { currentRule, ruleSwitchesMap } = vm;

                if (currentRule === null || currentRule === undefined) {
                    return null;
                } else {
                    return ruleSwitchesMap[currentRule[vm.tagProps.key]] || null;
                }
            }
        },
        watch: {
            data: {
                handler() {
                    this.init();
                },
                immediate: true,
                deep: true
            },
            currentRule() {
                this.handleChangeCurrent();
            }
        },
        methods: {

            /**
             * 根据对象特征值配置数据，初始化整个组件
             **/
            async init() {
                const vm = this;

                // 重置状态
                vm.resetState();

                await vm.initValueRuleList();

                if (vm.valueRuleList.length > 0) { // 默认展示第一个
                    vm.currentRule = vm.valueRuleList[0];
                } else {
                    vm.currentRule = null;
                }
            },

            /**
             * 根据对象特征数据，初始化listData
             **/
            async initValueRuleList() {
                const vm = this;
                let { data: objectFeature} = vm;
                let valueRuleList = [];

                if (objectFeature && objectFeature.id) {
                    let id = objectFeature.id;

                    vm.isLoading = true;
                    let resp = await getOfflineCalc(id);

                    if (vm.data && vm.data.id === id) { // 条件依然有效
                        vm.isLoading = false;

                        if (resp.code === 200) {
                            valueRuleList = resp.result || [];
                        }
                    } else {
                        return false;
                    }
                } else {
                    vm.isLoading = false;
                }

                vm.valueRuleList = vm.brushRuleList(valueRuleList);
            },

            /**
             * 重置其他状态 包括条件选中状态，api
             */
            resetState() {
                const vm = this;

                vm.valueRuleList = [];

                // 重置数据映射
                vm.domainDataMap = {};

                // 初始化条件开关
                vm.ruleSwitchesMap = {};

                vm.isLoading = false;
            },


            /**
             * 保存配置
             **/
            async doSave(params) {
                const vm = this;

                vm.isLoading = true;
                let data = await saveOfflineCalc(params);
                vm.isLoading = false;

                if (data.code === 200) {
                    vm.$emit('saved', params);
                }
            },

            /**
             * 校验当前规则form信息
             **/
            validateRuleItemForm() {
                const vm = this;
                let allValid = true;

                let forms = vm.$refs['ruleItemForm'] || [];
                forms.forEach(conditionVm => {
                    conditionVm.validate((valid) => {
                        allValid = allValid && valid
                    });
                });

                if (!allValid) {
                    $message.error('当前特征规则校验不通过,请检查');
                }

                return allValid;
            },

            /**
             * 确保对应条件组是数组，且添加条件项key
             * 一条rule格式参考geneInitRuleItem
             **/
            brushRuleList(ruleList = []) {
                const vm = this;
                let groupFields = ['objConditions', 'relationConditions', 'behaviorConditions', 'behaviorSequence'];
                let logicFields = ['ruleRelation', 'objRelation', 'relRelation', 'behaviorRelation'];
                let unAddKeyConditions = [];

                ruleList.forEach(item => {

                    // 拿出规则项
                    groupFields.forEach(field => {

                        if (!Array.isArray(item[field])) {
                            item[field] = [];
                        }
                        unAddKeyConditions.push(...item[field]);
                    });

                    // 设置条件初始值 默认是且
                    logicFields.forEach(field => {

                       if (!item[field])  {
                           item[field] = LOGIC.AND;
                       }
                    });
                });

                // 添加key
                unAddKeyConditions.forEach(item => {
                    item.key = vm.nextItemKey++;
                });

                return ruleList;
            },

            /**
             * 生成一个初始状态的特征值配置
             * 与后台数据格式一一对应
             * @param name
             * @returns {}
             */
            geneInitRuleItem(name) {
                const vm = this;
                let { data = {} } = vm;
                return {
                    domainId: vm.domainId,
                    objModelId: data.objModelId,
                    objFeatureId: data.id,
                    featureVal: name,
                    objConditions: [],
                    relationConditions: [],
                    behaviorConditions: [],
                    behaviorSequence: [],
                    ruleRelation: LOGIC.AND,
                    objRelation:  LOGIC.AND,
                    relRelation: LOGIC.AND,
                    behaviorRelation: LOGIC.AND
                }
            },

            /**
             * 请求对象特征列表，返回promise
             **/
            async initFeatureData() {
                const vm = this;
                let { domainId, data: objectFeature } = vm;

                vm.isLoading = true;
                let data = await getFeatureList({
                    domainId,
                    domainObjIdList: [objectFeature.objModelId]
                });
                vm.isLoading = false;

                let result = data.result || [];

                return result.filter(item => item.featureId !== objectFeature.featureId);
            },

            /**
             * 生成特征条件组件的bind数据，主要是领域相关数据
             **/
            geneFeatureBind() {
                const vm = this;
                let { domainDataMap } = vm;

                if (!domainDataMap.hasOwnProperty('feature')) {
                    domainDataMap['feature'] = vm.initFeatureData();
                }

                return {
                    featureData: domainDataMap['feature'],
                };
            },

            /**
             * 请求对象关系列表，返回promise
             **/
            async initRelationData() {
                const vm = this;
                let { domainId } = vm;

                vm.isLoading = true;
                let data = await getRelationTree(domainId);
                vm.isLoading = false;

                return data.result || [];
            },

            /**
             * 生成关系条件组件的bind数据，主要是领域相关数据
             **/
            geneRelationBind() {
                const vm = this;
                let { domainDataMap } = vm;
                if (!domainDataMap.hasOwnProperty('relation')) {
                    domainDataMap['relation'] = vm.initRelationData();
                }

                return {
                    relationData: domainDataMap['relation'],
                };
            },

            /**
             * 请求对象行为列表，返回promise
             **/
            async initBehaviorData() {
                const vm = this;
                let { data: objectFeature } = vm;

                vm.isLoading = true;
                let data = await getBehaviorByObj(objectFeature.objModelId);
                vm.isLoading = false;

                return data.result || [];
            },

            /**
             * 生成行为条件组件的bind数据，主要是领域相关数据
             **/
            geneBehaviorBind() {
                const vm = this;
                let { domainDataMap } = vm;

                if (!domainDataMap.hasOwnProperty('behavior')) {
                    domainDataMap['behavior'] = vm.initBehaviorData();
                }

                return {
                    behaviorData: domainDataMap['behavior']
                };
            },

            /**
             * 生成行为序列条件组件的bind数据，主要是领域相关数据
             **/
            geneSequenceBind({condition, index, config}) {
                const vm = this;
                let { domainDataMap } = vm;

                if (!domainDataMap.hasOwnProperty('behavior')) {
                    domainDataMap['behavior'] = vm.initBehaviorData();
                }

                return {
                    behaviorData: domainDataMap['behavior']
                };
            },

            /**
             * 添加一项特征值配置
             * @param name
             */
            handleAddRule(name) {
                const vm = this;
                let newItem = vm.geneInitRuleItem(name);
                vm.valueRuleList.push(newItem);
                vm.currentRule = newItem;
            },

            /**
             * 修改名称
             **/
            handleEditName(data, name) {
                const vm = this;
                let { tagProps } = vm;

                // 如果键值等于展示值，则由于开关映射以键值为key，需要更新映射
                if (tagProps.key === tagProps.label) {
                    let { ruleSwitchesMap } = vm;
                    ruleSwitchesMap[name] = ruleSwitchesMap[data[vm.tagProps.key]];
                    delete ruleSwitchesMap[data[vm.tagProps.key]];
                }

                data[vm.tagProps.label] = name;
            },

            /**
             * 删除条件项，删除的是当前数据 则将当前数据设置为第一个数据
             **/
            handleDeleteRule(data) {
                const vm = this;
                let { valueRuleList, currentRule, ruleSwitchesMap } = vm;

                valueRuleList.splice(valueRuleList.indexOf(data), 1);
                delete ruleSwitchesMap[data[vm.tagProps.key]]

                /**
                 * 如果删除的是当前数据 则将当前数据设置为第一个数据
                 */
                if (currentRule === data) {
                    if (valueRuleList.length > 0) {
                        vm.currentRule = valueRuleList[0];
                    } else {
                        vm.currentRule = null;
                    }
                }
            },

            /**
             * 初始化当前数据的ruleSwitches
             **/
            handleChangeCurrent() {
                const vm = this;
                let { currentRule, ruleSwitchesMap, ruleTypeConfigs } = vm;

                if (currentRule !== null && !ruleSwitchesMap.hasOwnProperty(currentRule[vm.tagProps.key])) {
                    let switchValueInfo = {};

                    ruleTypeConfigs.forEach(config => {

                        if (!Array.isArray(currentRule[config.field])) {
                            currentRule[config.field] = [];
                        }

                        switchValueInfo[config.field] = currentRule[config.field].length > 0;
                    });

                    vm.$set(ruleSwitchesMap, currentRule[vm.tagProps.key], switchValueInfo);
                }
            },

            /**
             * 处理条件项的开闭，如果开启，对应条件没有数据则添加对应条件一项
             * @param isCheck
             * @param config
             */
            handleChangeSwitchCheck(isCheck, config) {
                const vm = this;
                vm.ruleSwitches[config.field] = isCheck;

                if (isCheck) {
                    let ruleGroup = vm.currentRule[config.field];

                    if (ruleGroup.length === 0) {
                        ruleGroup.push({ key: vm.nextItemKey++ }); // 如果没有键值，则表单校验后修改会导致校验结果错误
                    }
                }
            },

            /**
             * 添加一个条件子项
             * @param config
             */
            handleClickAddItem(config) {
                const vm = this;
                let ruleGroup = vm.currentRule[config.field];

                ruleGroup.push({ key: vm.nextItemKey++ }); // 如果没有键值，则表单校验后修改会导致校验结果错误
            },

            /**
             * 删除一个条件子项 如果全删了，则关闭条件选中
             * @param condition 子项值 json
             * @param index 子项对应的下标
             * @param config
             */
            handleDeleteItem({condition, index, config}) {
                const vm = this;
                let ruleGroup = vm.currentRule[config.field];

                ruleGroup.splice(index, 1);

                if (ruleGroup.length === 0) {
                    vm.ruleSwitches[config.field] = false;
                    vm.currentRule[config.logicField] = LOGIC.AND;
                }
            },

            handleClickCancel() {
                this.$emit('cancel');
            },

            /**
             * 进行规则校验，如果通过则保存数据
             */
            handleClickSave() {
                const vm = this;
                let ruleValided = vm.validateRuleItemForm();

                if (ruleValided) {
                    let { ruleSwitchesMap, valueRuleList } = vm;
                    let params = [];

                    valueRuleList.forEach(item => {
                        let param = {...item};
                        let ruleSwitches = ruleSwitchesMap[item[vm.tagProps.key]] || {};

                        Object.keys(ruleSwitches).forEach( key => { // 开关的键值就是对应的数据键值 对应开关关闭，则置空
                            if (ruleSwitches[key] === false) {
                                param[key] = [];
                            }
                        });

                        params.push(param);
                    });

                    vm.doSave({
                        objFeatureId: vm.data.id,
                        conditionsVoList: params
                    });
                }
            }
        },
        activated() {
            this.init();
        },
        components: {
            EditableTags,
            LogicContainer,
            CommonSelect,
            ObjectProp,
            RelationCondition,
            BehaviorCondition,
            BehaviorSequence
        }
    };
</script>
<style scoped lang="less">

    /* 外层布局 */
    .calc__item{
        margin-bottom: 10px;
    }
    .calc__item__title {
        display: inline-block;
        margin-bottom: 10px;
    }

    /* 条件项布局 */
    .rule-group{
        margin-bottom: 5px;
        .rule-item{
            position: relative;
            padding-right: 23px;
            margin-bottom: 10px;
            overflow: hidden;
            .btn-icon{
                position: absolute;
                right: 0;
                top: 0;
                height: 32px;
                line-height: 32px;
            }
        }
    }

    /* 逻辑下拉 */
    .logic-select{
        /deep/ .el-input__inner{
            padding: 0 20px 0 5px;
        }
        /deep/ .el-input__suffix{
            right: 0;
        }
    }

    /* 操作按钮 */
    .btn-icon{
        font-size: 18px;
        color: #409eff;
        cursor: pointer;
    }
    .btn-icon__delete{
        color: #f56c6c;
    }
</style>