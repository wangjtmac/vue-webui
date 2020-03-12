<!--
 数据库导入流程编辑表单
 @Author: zhanbh
 @Date: 2019-12-05
-->
<template>
    <form-container class="db-form"
                    :title="title"
                    v-loading="isLoading"
                    @close="handleClickCancel"
                    @save="handleClickSave">
        <el-input class="mb15"
                  v-model.trim="keyword"
                  clearable
                  prefix-icon="el-icon-search"
                  placeholder="特征项或表字段">
        </el-input>
        <el-form size="mini" :model="{data: tableList}" ref="form">
            <common-table class="mb15"
                          row-key="_key"
                          :columns="columns"
                          :data="tableList"
                          :span-method="spanMethod">
                <template v-if="isObjectType"
                          slot="featureGroup"
                          slot-scope="{ row, $index }">
                    <el-form-item :prop="`data.${$index}.featureGroup`"
                                  :rules="{ validator: (rule, value, callback) => { validateFeatureGroup(rule, value, callback, row) }, trigger: 'blur' }">
                        <el-input-number v-model="row.featureGroup"
                                         :ref="`number_${row._key}`"
                                         size="mini"
                                         controls-position="right"
                                         :step="1"
                                         step-strictly
                                         :min="1"
                                         :max="row._groupList.length"
                                         @change="handleChangeNumber(row, $event)"
                                         @blur="handleBlurNumber(row, $event)">
                        </el-input-number>
                    </el-form-item>
                </template>
                <template slot="header-check"
                          slot-scope="{column}">
                    <el-checkbox :indeterminate="checkGroupIndeterminate()"
                                 :value="checkGroupSelect()"
                                 @change="handleGroupCheckChange($event)">
                        {{column.label}}
                    </el-checkbox>
                </template>
                <template slot="check"
                          slot-scope="{row, column, $index}">
                    <el-checkbox v-if="row._isGroup"
                                 :indeterminate="checkGroupIndeterminate(row)"
                                 :value="checkGroupSelect(row)"
                                 @change="handleGroupCheckChange($event,row)">
                    </el-checkbox>
                    <el-form-item v-else
                                  :prop="`data.${$index}.isExportFields`"
                                  :rules="{ validator: (rule, value, callback) => { validateExport(rule, value, callback, row) }, trigger: 'change' }">
                        <el-checkbox v-model="row.isExportFields"
                                     @change="handleCheckChange($event,row)">
                        </el-checkbox>
                    </el-form-item>
                </template>
            </common-table>
        </el-form>
    </form-container>
</template>
<script>
    import {getDbImportConfig, saveDbImportConfig} from '@/projects/Knowledge/api/flowApi';
    import * as $message from '@/projects/Knowledge/assets/js/utils/messageUtil';

    import CommonTable from '@/projects/Knowledge/components/CommonTable';
    import FormContainer from './FormContainer'

    const OBJECT_TYPE = '0';
    const RELATION_TYPE = '1';
    const BEHAVIOR_TYPE = '2';

    export default {
        name: "DBForm",
        props: {
            title: String,
            domain: {
                type: Object,
                default() {
                    return {};
                }
            },
            dataPath: { // 库导入路径固定三级
                type: Array,
                default() {
                    return [];
                }
            },
            nodeData: {
                type: Object,
                required: true
            }
        },
        data() {
            const vm = this;
            return {
                keyword: '',
                staticColumns: [
                    {
                        type: 'index',
                        label: '序号',
                        align: 'center',
                        width: '50px',
                        index: vm.indexMethod
                    }, {
                        prop: 'featureItem',
                        label: '特征项',
                        align: 'center'
                    }, {
                        prop: 'tableField',
                        label: '表字段',
                        align: 'center'
                    }, {
                        prop: 'isPk',
                        label: '业务标识',
                        align: 'center',
                        width: '80px',
                        translator: ({value: isPk}) => isPk ? '是' : '否'
                    }, {
                        prop: 'check',
                        field: 'isExportFields',
                        label: '导出',
                        align: 'center',
                        width: '80px'
                    }
                ],
                groupedData: [],
                isLoading: false
            };
        },
        computed: {
            columns() {
                const vm = this;
                let { isObjectType, staticColumns } = vm;

                // 对象要有分组字段
                if ( isObjectType ) {
                    let columns = [...staticColumns];
                    columns.splice(1, 0, {
                        prop: 'featureGroup',
                        label: '标记分组',
                        align: 'center'
                    });
                    return columns;
                } else {
                    return staticColumns;
                }
            },

            /**
             * 是否是对象类型
             **/
            isObjectType() {
                const vm = this;
                return vm.conceptType === OBJECT_TYPE;
            },

            /**
             * 概念类型  对象， 行为， 关系
             **/
            conceptType() {
                const vm = this;
                let { dataPath } = vm;

                if (Array.isArray(dataPath) && dataPath.length > 0 && dataPath[dataPath.length - 1].origin) {
                    return dataPath[dataPath.length - 1].origin.domainObjType;
                } else {
                    return ''
                }
            },

            /**
             * 列表数据
             **/
            tableList() {
                const vm = this;
                let {groupedData, keyword} = vm;
                let list = [];

                groupedData.forEach(group => {

                    let filteredGroup = vm.filterData(group, keyword);

                    if (filteredGroup.length > 0) {

                        // 组
                        list.push({
                            _isGroup: true,
                            _key: filteredGroup[0].domainConceptName,
                            _groupName: filteredGroup[0].domainConceptName,
                            _members: filteredGroup // 方便做复选框判断
                        });

                        // 特征项
                        list.push(...filteredGroup);
                    }
                });

                return list;
            }
        },
        watch: {
            nodeData: {
                handler() {
                    this.init();
                },
                immediate: true
            }
        },
        methods: {

            init() {
                const vm = this;
                vm.reset();
                vm.initGroupedData();
            },

            /**
             * 格式化请求表单数据参数
             * @returns {}
             */
            formatInitParams() {
                const vm = this;
                let {domain, dataPath} = vm;

                return {
                    domainId: domain.id,
                    domainCode: domain.code,
                    instanceDatasourceId: domain.instanceDatasourceId,
                    dataSourceId: dataPath[0].origin.id,
                    tableId: dataPath[1].origin.id,
                    tableName: dataPath[1].origin.dataObjName,
                    nodeCondition: dataPath[2].origin.id,
                    domainConceptType: dataPath[2].origin.domainObjType
                }
            },

            /**
             * 初始化表单原始数据
             * @returns {Promise<void>}
             */
            async initGroupedData() {
                const vm = this;
                let {nodeData, domain, dataPath} = vm;

                if (nodeData !== null && domain !== null && Array.isArray(dataPath) && dataPath.length === 3) {
                    vm.isLoading = true;
                    let data = await getDbImportConfig(vm.formatInitParams()); 

                    if (nodeData === vm.nodeData) {
                        vm.isLoading = false;

                        if (data.code === 200) {
                            vm.groupedData = vm.brushData(data.result || []);
                        }
                    }

                } else {
                    vm.isLoading = false;
                }
            },

            /**
             * 重置组件状态
             **/
            reset() {
                const vm = this;
                vm.keyword = '';
                vm.groupedData = [];
                vm.isLoading = false;
                if (vm.$refs.form) {
                    vm.$refs.form.clearValidate();
                }
            },

            /**
             * 粉饰数据，
             * 添加必要扩展字段：
             * 按domainConceptName 分组
             * 根据featureItem分组
             **/
            brushData(data = []) {
                const vm = this;
                let { isObjectType } = vm;

                // 复制旧值, 扩展字段
                data.forEach((item, index) => {

                    Object.assign(item, {
                        _key: index, // 键值
                        _oldIsExportFields: item.isExportFields,
                        _isGroup: false,
                        _groupList: []
                    });

                    // 对象类型才需要特征分组信息
                    if (isObjectType) {
                        item._oldFeatureGroup = item.featureGroup;

                        // 校验featureGroup数据
                        if (!item.featureGroup) {
                            item.featureGroup = 1;
                        }
                    }

                });

                let groupedData = vm.groupData(data);

                return groupedData;
            },

            /**
             * 数据排序
             * 先按domainConceptName排序
             * 再按featureItem排序
             **/
            dataSort(list = []) {
                return list.sort((a, b) => {

                    if (a.domainConceptName !== b.domainConceptName) {
                        return a.domainConceptName > b.domainConceptName ? 1 : -1;

                    } else { // 按特征项排序，便于校验
                        return a.featureItem > b.featureItem ? 1 : -1;
                    }
                });
            },

            /**
             * 组装成组，并标序号
             **/
            groupData(list = []) {
                const vm = this;
                let sortedList = vm.dataSort(list);
                let [groupsList, group, currentName] = [ [], null, '' ];

                // 根据domainConceptName分组
                sortedList.forEach(item => {

                    if (group === null || currentName !== item.domainConceptName) {
                        currentName = item.domainConceptName;
                        group = [];
                        groupsList.push(group);
                    }

                    item._groupList = group;
                    group.push(item);
                });

                return groupsList;
            },

            /**
             * 生成保存参数
             **/
            geneSaveParams() {
                const vm = this;
                let { groupedData, isObjectType } = vm;

                let params = groupedData.reduce((list, group) => {

                    group.forEach(child => {

                        if (child.isExportFields !== child._oldIsExportFields ||
                            ( isObjectType && child.featureGroup !== child._oldFeatureGroup)) { // 有修改

                            let newItem = {
                                id: child.objFeatureId,
                                isImport: child.isExportFields
                            };

                            if (isObjectType && child.featureGroup !== child._oldFeatureGroup) {
                                Object.assign(newItem, {
                                    domainFeaturePrimevalOperatorCfgSet: [{
                                        id: child.featurePrimevalId,
                                        featureGroup: child.featureGroup
                                    }]
                                });
                            }

                            list.push(newItem);
                        }
                    });

                    return list;
                }, []);

                return params;
            },

            /**
             * 保存数据
             **/
            async saveData() {
                const vm = this;

                let params = vm.geneSaveParams();

                if (params.length > 0) {

                    vm.isLoading = true;
                    let data = await saveDbImportConfig(params);
                    vm.isLoading = false;

                    return data;
                } else {
                    return { code: 200 };
                }
            },

            /**
             * 根据关键字过滤数据
             **/
            filterData(list = [], keyword) {

                if (!keyword) {
                    return list;
                } else {
                    return list.filter(item => {
                        return item.featureItem.indexOf(keyword) > -1 || item.tableField.indexOf(keyword) > -1
                    });
                }
            },

            /**
             * 合并单元格，对组名进行合并
             * @param row
             * @param column
             * @param rowIndex
             * @param columnIndex
             * @returns {number[]}
             */
            spanMethod({ row, column, rowIndex, columnIndex }) {
                if (row._isGroup) {
                    const vm = this;
                    let { isObjectType } = vm;
                    let lastColNum = isObjectType ? 5 : 4; // 对象类型多了分组列
                    if (columnIndex === 0) {
                        return [1, lastColNum];
                    } else if (columnIndex === lastColNum) {
                        return [1, 1];
                    } else {
                        return [0, 0];
                    }
                }
            },

            /**
             * 生成序号，如果是组则展示组名
             **/
            indexMethod(index) {
                const vm = this;
                let { tableList } = vm;

                let data = tableList[index];

                if (data._isGroup) {
                    return data._groupName;
                } else {

                    let count = 0;
                    while (!data._isGroup && index > 0) {
                        count++;
                        index--;
                        data = tableList[index];
                    }
                    return count;
                }
            },

            /**
             * 判断组是否为半选
             * @param row
             */
            checkGroupIndeterminate(row) {
                const vm = this;
                let list = vm.getTableGroupData(row);

                return list.some(item => item.isExportFields) && list.some(item => !item.isExportFields);
            },

            /**
             * 判断组是否为全选
             * @param row
             */
            checkGroupSelect(row) {
                const vm = this;
                let list = vm.getTableGroupData(row);
                return list.every(item => item.isExportFields);
            },

            /**
             * 如果row为空 则以所有数据为基础，否则是指定组
             * @param row
             */
            getTableGroupData(row) {
                const vm = this;

                if (typeof row === 'object') {
                    return vm.filterData(row._members || [], vm.keyword);

                } else {
                    return vm.tableList.filter(item => {
                        return !item._isGroup;
                    });
                }
            },

            /**
             * 校验分组是否重复
             **/
            validateFeatureGroup(rule, value, callback, data) {
                const vm = this;

                vm.$nextTick(_ => {

                    if (data.isExportFields && data._groupList.some(item => {
                            return item !== data && item.featureItem === data.featureItem &&
                                        item.isExportFields && item.featureGroup === data.featureGroup
                        })
                    ) {
                        callback(new Error('标记分组重复'));
                    } else {
                        callback();
                    }
                });
            },

            /**
             * 校验导出，对象，行为，关系的逻辑都不同
             **/
            validateExport(rule, value, callback, data) {
                const vm = this;

                vm.$nextTick(_ => {

                    switch (vm.conceptType) {
                        case OBJECT_TYPE:
                            vm.validateObjectExport(rule, value, callback, data);
                            break;
                        case RELATION_TYPE:
                            vm.validateRelationExport(rule, value, callback, data);
                            break;
                        case BEHAVIOR_TYPE:
                            vm.validateBehaviorExport(rule, value, callback, data);
                            break;
                        default:
                            callback();
                    }
                });
            },

            /**
             * 对象类型校验  分组必须有业务标识
             **/
            validateObjectExport(rule, value, callback, data) {

                if ( (value && !data.isPk) || (!value && data.isPk) ) { // 勾选非业务标识或者取消业务标识
                    let exportGroup = data._groupList.filter(item => item.featureGroup === data.featureGroup && item.isExportFields);

                    // 同组不存在已勾选的业务标识
                    if (exportGroup.length > 0 && !exportGroup.some(item => item.isPk)) {
                        callback(new Error('分组必须存在业务标识'));
                        return false;
                    }
                }
                callback();
                return true;
            },

            /**
             * 关系类型校验 左右顶点必须有
             **/
            validateRelationExport(rule, value, callback, data) {
                let isLeft = obj => obj.featureItem === '左顶点';
                let isRight = obj => obj.featureItem === '右顶点';
                let isPoint = obj => isLeft(obj) || isRight(obj);

                if ((value && !isPoint(data)) || (!value && isPoint(data))) { // 勾选非顶点或者取消顶点
                    let exportGroup = data._groupList.filter(item => item.isExportFields);
                    let exportPoint = exportGroup.filter(item => isPoint(item));

                    if (exportGroup.length > 0 && ( exportPoint.length < 2 || exportPoint.every(item => !isLeft(item)) ||  exportPoint.every(item => !isRight(item)) ) ) {
                        callback(new Error('左右顶点必须导出'));
                        return false;
                    }
                }
                callback();
                return true;
            },

            /**
             * 行为类型校验 承受者实施者必须有一个
             **/
            validateBehaviorExport(rule, value, callback, data) {
                let isLeft = obj => obj.featureItem === '实施者';
                let isRight = obj => obj.featureItem === '承受者';
                let isPoint = obj => isLeft(obj) || isRight(obj);

                if ((value && !isPoint(data)) || (!value && isPoint(data))) { // 勾选非顶点或者取消顶点
                    let exportGroup = data._groupList.filter(item => item.isExportFields);
                    let exportPoint = exportGroup.filter(item => isPoint(item));

                    if (exportGroup.length > 0 && exportPoint.length === 0) {
                        callback(new Error('实施者与承受者必须导出一个'));
                        return false;
                    }
                }
                callback();
                return true;
            },

            /**
             * 批量校验，主要用在复选框选择批量校验分组
             */
            batchValidateField(dataList = [], field = 'featureGroup') {
                const vm = this;

                let { tableList } = vm;
                let propList = [];

                dataList.forEach(item => {
                    let index = tableList.indexOf(item);

                    if (index >= 0) {
                        propList.push(`data.${index}.${field}`);
                    }
                });

                vm.$refs.form.validateField(propList);
            },

            /**
             * 如果为空，填默认值1
             **/
            handleChangeNumber(row, value) {
                const vm = this;

                // 值改变，聚焦输入框，使得可以失焦触发校验
                vm.$refs[`number_${row._key}`].focus();

                if (value === undefined || value === null ) {

                    vm.$nextTick(_ => {
                        row.featureGroup = 1;
                    });
                }
            },

            /**
             * 失焦触发其他同特征项的校验 及所有的导出校验
             **/
            handleBlurNumber(row) {
                const vm = this;

                vm.batchValidateField(row._groupList.filter(item => item !== row && item.featureItem === row.featureItem));
                vm.batchValidateField(row._groupList, 'isExportFields');
            },

            /**
             * 切换组员选中状态
             * @param row
             */
            handleGroupCheckChange(isCheck, row) {
                const vm = this;
                let list = vm.getTableGroupData(row);
                let toValidExport = [];

                list.forEach(item => {

                    if (item.isExportFields !== isCheck) { // 值不同会自己触发一次change
                        item.isExportFields = isCheck;
                    } else {
                        toValidExport.push(item);
                    }
                });

                // 校验
                vm.batchValidateField(list);
                vm.batchValidateField(toValidExport, 'isExportFields');
            },

            /**
             * 导出改变进行校验
             */
            handleCheckChange(isCheck, row) {
                const vm = this;

                if (vm.isObjectType) {

                    // 校验分组
                    vm.batchValidateField(row._groupList);
                }

                // 校验其他的导出
                vm.batchValidateField(row._groupList.filter(item => item !== row), 'isExportFields');
            },

            handleClickCancel() {
                this.$emit('cancel')
            },

            handleClickSave() {
                const vm = this;

                vm.keyword = ''; // 关键字置空，使所有表单都展示再校验

                vm.$nextTick(() => {
                    vm.$refs.form.validate(async valid => {

                        if (valid) {
                            let result = await vm.saveData();

                            if (result.code === 200) {
                                vm.$emit('saved');
                            }
                        } else {
                            $message.error('表单校验不通过，请检查');
                        }
                    });
                });
            }
        },
        activated() {
            this.init();
        },
        components: {
            FormContainer,
            CommonTable
        }
    };
</script>
<style scoped lang="less">
    .db-form {
        width: 500px;

        /**
            合并单元格后宽度计算有问题，无法居中
         */
        /deep/ [colspan="4"] > .cell,
        /deep/ [colspan="5"] > .cell {
            width: 400px !important;
        }

        /* 表单项 */
        .el-form-item{
            margin-bottom: 0;
        }

        /* 导出校验失败样式 */
        .el-form-item.is-error{
            /deep/ .el-checkbox__inner{
                border-color: #F56C6C;
            }
            /deep/ .is-checked .el-checkbox__inner{
                background-color: #F56C6C;
            }
        }

        /* 分组样式 */
        .el-input-number {
            width: 100%;
        }
        .el-input-number.is-controls-right /deep/ .el-input__inner {
            padding-left: 4px;
            padding-right: 32px;
        }

    }
</style>