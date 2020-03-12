<!--
 数据库批量导入
 @Author: zhanbh
 @Date: 2019-12-12
-->
<template>
    <div class="db-batch-add" v-loading="isLoading">
        <div class="mb5">数据库字段: </div>
        <el-card v-loading="dataSource.isLoading" shadow="never" class="mb20">
            <el-row class="mb15" :gutter="10">
                <el-col :span="8">
                    <data-source-select
                            v-model="dataSource.sourceId"
                            :data-house="dataSource.dataHouse"
                            ref="dataSource"
                            @input="handleChangeDataSource">
                    </data-source-select>
                </el-col>
                <el-col :span="8">
                    <data-table-select
                            v-model="dataSource.tableId"
                            :data-house="dataSource.dataHouse"
                            :data-source-id="dataSource.sourceId"
                            ref="dataTable"
                            @input="handleChangeTable">
                    </data-table-select>
                </el-col>
                <el-col :span="8">
                    <common-select
                            v-model="dbDataType.value"
                            :data="dbDataTypeOptions"
                            :props="dbDataType.props"
                            multiple
                            collapse-tags
                            placeholder="数据类型">
                    </common-select>
                </el-col>
            </el-row>
            <common-table
                    v-loading="fieldTable.isLoading"
                    class="mb15"
                    :columns="fieldTable.columns"
                    :data="filteredTableList"
                    highlight-current-row
                    max-height="220px">

                <template slot="header-selection"
                          slot-scope="{column}">
                    <el-checkbox :disabled="checkableLength === 0"
                                 :value="checkedLength === checkableLength && checkedLength !== 0"
                                 :indeterminate="checkedLength > 0 && checkableLength > checkedLength"
                                 @change="handleChangeSelectAll">
                        {{checkedLength}}/{{checkableLength}}
                    </el-checkbox>
                </template>
                <template slot="selection" slot-scope="{row}">
                    <el-checkbox :disabled="row.disabled" v-model="row.checked"></el-checkbox>
                </template>
            </common-table>

            <div class="tr field-btns">
                <el-button size="small"
                           type="primary"
                           :disabled="checkedLength === 0"
                           @click.stop="handleClickAdd">
                    <span>添加</span>
                </el-button>
            </div>
        </el-card>
        <div class="mb5">
            <span class="mr10">特征映射:</span>
            <el-checkbox class="fr" v-model="isBatch">整列修改</el-checkbox>
        </div>
        <el-form size="mini" ref="form" :model="{data:featureList}">
            <common-table
                    class="mb15"
                    ref="table"
                    highlight-current-row
                    row-key="id"
                    :columns="featureTable.columns"
                    :global-bind="featureTable.globalBind"
                    :data="featureList"
                    :span-method="spanMethod"
                    max-height="220px">
                <template slot="parentId" slot-scope="{row, $index}">
                    <el-form-item :prop="`data.${$index}.parentId`" :rules="featureTable.rules.parentId">
                        <tree-select
                                v-model="row.parentId"
                                filterable
                                clearable
                                placeholder="特征分类"
                                :tree-props="treeProps"
                                :props="catalogProps"
                                :data="[catalog]"
                                @input="handleBatchChangeCol($event, 'parentId')">
                        </tree-select>
                    </el-form-item>
                </template>
                <template slot="name" slot-scope="{row, $index}">
                     <el-form-item :prop="`data.${$index}.name`" :rules="geneNameRule(row)">
                        <el-input v-model.trim="row.name"
                                  placeholder="特征名称"
                                  :title="row.name"
                                  maxlength="50">
                        </el-input>
                    </el-form-item>
                </template>
                <template slot="featureType" slot-scope="{row, $index}">
                    <el-form-item :prop="`data.${$index}.featureType`" :rules="featureTable.rules.featureType">
                        <common-select v-model="row.featureType"
                                       :ref="`featureType-${$index}`"
                                       :data="dicMap"
                                       data-field="featureType"
                                       placeholder="特征类型"
                                       :props="dicProps"
                                       @change="handleBatchChangeCol($event, 'featureType', `featureType-${$index}`)">
                        </common-select>
                    </el-form-item>
                </template>
                <template slot="dataType" slot-scope="{row, $index}">
                    <el-form-item :prop="`data.${$index}.dataType`" :rules="featureTable.rules.dataType">
                        <common-select v-model="row.dataType"
                                       :ref="`dataType-${$index}`"
                                       :data="dicMap"
                                       data-field="dataType"
                                       :props="dicProps"
                                       placeholder="数据类型"
                                       @change="handleBatchChangeCol($event, 'dataType', `dataType-${$index}`)">
                        </common-select>
                    </el-form-item>
                </template>
                <template slot="dataBaseType" slot-scope="{row, $index}">
                    <el-form-item :prop="`data.${$index}.dataBaseType`" :rules="featureTable.rules.dataBaseType">
                        <common-select v-model="row.dataBaseType"
                                       :ref="`dataBaseType-${$index}`"
                                       :data="dicMap"
                                       data-field="dataBaseType"
                                       :props="dicProps"
                                       placeholder="基础类型"
                                       @change="handleBatchChangeCol($event, 'dataBaseType', `dataBaseType-${$index}`)">
                        </common-select>
                    </el-form-item>
                </template>
                <template slot="dataLevel" slot-scope="{row, $index}">
                    <el-form-item :prop="`data.${$index}.dataLevel`" :rules="featureTable.rules.dataLevel">
                        <common-select v-model="row.dataLevel"
                                       :ref="`dataLevel-${$index}`"
                                       :data="dicMap"
                                       data-field="dataLevel"
                                       :props="dicProps"
                                       placeholder="数据等级"
                                       @change="handleBatchChangeCol($event, 'dataLevel', `dataLevel-${$index}`)">
                        </common-select>
                    </el-form-item>
                </template>
                <template slot="operation" slot-scope="{row, $index}">
                    <el-button type="text"
                               class="btn-icon_delete"
                               icon="el-icon-remove"
                               title="删除" @click="handleClickDelete(row)">
                    </el-button>
                </template>
            </common-table>
        </el-form>
        <div class="tr">
            <el-button size="small" @click.stop="handleClickCancel">取消</el-button>
            <el-button size="small" type="primary" :disabled="featureList.length === 0" @click.stop="handleClickImport">导入</el-button>
        </div>
    </div>
</template>
<script>
    import { DataHouse } from '@/projects/Knowledge/api/dataSourceApi';
    import { batchAdd } from '@/projects/Knowledge/api/featureApi';
    import { getDataFieldType } from '@/projects/Knowledge/api/constantApi';

    import * as $message from '@/projects/Knowledge/assets/js/utils/messageUtil'

    import * as dataSourceComponents from '@/projects/Knowledge/components/dataSource';
    import CommonSelect from '@/projects/Knowledge/components/CommonSelect';
    import CommonTable from '@/projects/Knowledge/components/CommonTable';
    import TreeSelect from 'ui-component-v4/lib/tree-select';

    export default {
        name: "DbBatchAdd",
        props: {
            catalog: [Object, Array],
            dicMap: Object,
            domainId: String,
        },
        watch: {
            catalog: {
                handler() {
                    this.init();
                },
                immediate: true
            }
        },
        data() {
            const vm = this;
            return {
                dataSource: {
                    dataHouse: null,
                    sourceId: '',
                    tableId: '',
                    isLoading: false
                },
                dbDataType: {
                    options: [],
                    props: {
                        label: 'name',
                        value: 'code'
                    },
                    isLoading: false,
                    isLoaded: false,
                    value: []
                },
                fieldTable: {
                    columns: [
                        {
                            type: 'index',
                            label: '序号',
                            align: 'center',
                            width: '100px'
                        }, {
                            prop: 'name',
                            label: '字段名',
                            align: 'center',
                        }, {
                            prop: 'dataType',
                            label: '数据类型',
                            align: 'center',
                            width: '150px',
                            translator: ({ value }) => {
                                let props = vm.dbDataType.props;
                                let item = vm.dbDataType.options.find(item => item[props.value] === value) || {};
                                return item[props.label] || '未知';
                            }
                        }, {
                            prop: 'selection',
                            label: '选择',
                            align: 'center',
                            width: '100px'
                        }
                    ],
                    data: [],
                    isLoading: false
                },
                featureTable: {
                    globalBind: {
                        align: 'center'
                    },
                    columns: [
                        {
                            prop: 'fieldName',
                            label: '字段名',
                            width: '80px'
                        }, {
                            prop: 'parentId',
                            label: '所属分类'
                        }, {
                            prop: 'name',
                            label: '特征项'
                        }, {
                            prop: 'featureType',
                            label: '特征类型'
                        }, {
                            prop: 'dataType',
                            label: '数据类型'
                        }, {
                            prop: 'dataBaseType',
                            label: '数据基础类型'
                        }, {
                            prop: 'dataLevel',
                            label: '数据等级'
                        }, {
                            prop: 'operation',
                            label: '操作',
                            width: '50px'
                        }
                    ],
                    dataTableMap: {}, // 以tableId为键值
                    tableIds: [], // 用于保证按添加顺序展示
                    rules: {
                        parentId: [
                            { required: true, message: '请选择所属分类', trigger: 'change' },
                        ],
                        dataLevel: [
                            { required: true, message: '请选择数据等级', trigger: 'change' },
                        ],
                        featureType: [
                            { required: true, message: '请选择特征类型', trigger: 'change' }
                        ],
                        dataBaseType: [
                            { required: true, message: '请选择基础数据类型', trigger: 'change' }
                        ],
                        dataType: [
                            { required: true, message: '请选择数据类型', trigger: 'change' }
                        ]
                    },
                },
                dicProps: {
                    label: 'name',
                    value: 'code'
                },
                catalogProps: {
                    label: 'name',
                    value: 'id',
                    children: 'children'
                },
                treeProps: {
                    'default-expand-all': true,
                    'expand-on-click-node': false
                },
                isBatch: false,
                isLoading: false
            };
        },
        computed: {
            // 没有选择数据表，则不能选择数据类型
            dbDataTypeOptions() {
                let { dbDataType, dataSource } = this;
                return dataSource.tableId ? dbDataType.options : [];
            },

            /**
             * 根据数据类型过滤了的表字段数据
             **/
            filteredTableList() {
                const vm = this;
                let [typeList = [], list = []] = [vm.dbDataType.value, vm.fieldTable.data];

                if (!Array.isArray(typeList) || typeList.length === 0) {
                    return list || [];
                } else {
                    return list.filter(item => typeList.includes(item.dataType));
                }
            },

            /**
             * 表字段已选择个数
             **/
            checkedLength() {
                return this.filteredTableList.filter(item => !item.disabled && item.checked).length;
            },

            /**
             * 表字段可选择个数
             **/
            checkableLength() {
                return this.filteredTableList.filter(item => !item.disabled).length;
            },

            /**
             * 特征列表
             **/
            featureList() {
                const vm = this;
                let { dataTableMap, tableIds } = vm.featureTable;
                let list = [];

                tableIds.forEach(id => {
                    let data = dataTableMap[id];

                    if (data && Array.isArray(data.list) && data.list.length > 0) {
                        list.push({
                            id: data.dataTable.id,
                            tableId: data.dataTable.id,
                            fieldName: `库名: ${data.dataSource.name} 表名: ${data.dataTable.name}`,
                            isGroup: true
                        });

                        list.push(...data.list);
                    }
                });

                return list;
            }
        },
        methods: {
            init() {
                const vm = this;

                vm.initDbDataType();
                vm.initDataSource();

                vm.$refs.form && vm.$refs.form.clearValidate();

                vm.featureTable.dataTableMap = {};
                vm.featureTable.tableIds = [];

                vm.isBatch = false;
                vm.isLoading = false;
            },

            initDataSource() {
                const vm = this;
                vm.dataSource.dataHouse = new DataHouse();
                vm.dataSource.sourceId = '';
                vm.handleChangeDataSource();
            },

            /**
             * 初始化数据类型字典
             * @returns {Promise<void>}
             */
            async initDbDataType() {
                const vm = this;
                let { dbDataType } = vm;

                dbDataType.value = [];

                if (!dbDataType.isLoading && !dbDataType.isLoaded) {

                    dbDataType.isLoading = true;
                    let data = await  getDataFieldType();
                    dbDataType.isLoading = false;

                    dbDataType.isLoaded = data.code === 200;
                    dbDataType.options = data.result || [];
                }
            },

            /**
             * 添加操作信息到数据中
             * @param list
             * @returns {Array}
             */
            addOperInfoToData(list = []) {
                const vm = this;
                let addedIdList = vm.getDataFromMap().list.map(item => item.id);

                list.forEach(item => {
                    if (addedIdList.includes(item.id)) {
                        item.disabled = true;
                        item.checked = true;
                    } else {
                        item.disabled = false;
                        item.checked = false;
                    }
                });
                return list;
            },

            /**
             * 生成特征名称的检验规则
             **/
            geneNameRule(row) {
                const vm = this;
                let { featureList } = vm;

                let validator = (rule, value, callback) => {

                    if (value === '') { // 判空
                        callback(new Error('特征名称不能为空'));
                    } else if (featureList.find(item => item !== row && item.name === value)) {
                        callback(new Error('特征名称不能重复'));
                    } else{
                        callback();
                    }
                };
                return { validator, trigger: 'blur' }
            },

            /**
             * 特征列表合并数据表名所在行单元格
             **/
            spanMethod({ row, column, columnIndex }) {

                if (row.isGroup) {
                    if (columnIndex === 0) {
                        return [1, 7];
                    } else if (columnIndex !== 7) {
                        return [0, 0];
                    }
                }
            },

            /**
             * 解除数据字段列表的禁用状态
             **/
            freeCheckable(list) {
                const vm = this;
                let data = vm.fieldTable.data || [];

                data.forEach(item => {

                    if (list.includes(item.id)) {
                        item.disabled = false;
                        item.checked = false;
                    }
                })
            },

            /**
             * 生成一个特征项数据
             **/
            geneFeatureItem(item, tableId) {
                const { domainId, catalog } = this;
                return {
                    id: item.id, // 不入库
                    fieldName: item.name, // 不入库
                    tableId, // 不入库
                    name: item.name,
                    domainId,
                    dataLevel: '',
                    dataType: item.dataType === '-1' ? '' : item.dataType,
                    dataBaseType: '',
                    featureType: '',
                    parentId: catalog.id
                }
            },

            /**
             * 从dataTableMap中获取当前表对应的数据
             * 有获取，无则先添加再获取
             **/
            getDataFromMap() {
                const vm = this;
                let { dataTableMap, tableIds } = vm.featureTable;
                let dataSource = vm.$refs.dataSource.getCurrent();
                let dataTable = vm.$refs.dataTable.getCurrent();
                let tableId = dataTable.id;

                if (!tableIds.includes(tableId)) {
                    tableIds.push(tableId);
                }

                if (!dataTableMap[tableId]) {
                    vm.$set(dataTableMap, tableId, {
                        dataSource,
                        dataTable,
                        list: []
                    });
                }

                return dataTableMap[tableId];
            },

            handleChangeDataSource() {
                const vm = this;
                let { dataSource, dbDataType } = vm;

                dataSource.tableId = '';
                dbDataType.value = [];

                vm.handleChangeTable();
            },

            async handleChangeTable(tableId) {
                const vm = this;
                let { fieldTable, dataSource, dbDataType } = vm;

                dbDataType.value = [];

                if (tableId) {
                    fieldTable.isLoading = true;
                    let data = await dataSource.dataHouse.getColumns(tableId);

                    if (tableId === dataSource.tableId) {
                        fieldTable.isLoading = false;
                        fieldTable.data = vm.addOperInfoToData(data.result || []);
                    }
                } else {
                    fieldTable.isLoading = false;
                    fieldTable.data = [];
                }
            },

            /**
             * 将已选的放到映射字段去
             */
            handleClickAdd() {
                const vm = this;
                let { filteredTableList } = vm;
                let data = vm.getDataFromMap();
                let list = data.list;
                let tableId = data.dataTable.id;

                filteredTableList.forEach(item => {
                    if (item.checked && !item.disabled) {
                        list.push(vm.geneFeatureItem(item, tableId));

                        item.disabled = true;
                    }
                });
            },

            handleChangeSelectAll(isCheck) {
                const vm = this;
                vm.filteredTableList.forEach(item => {

                    if (!item.disabled) {
                        item.checked = isCheck;
                    }
                 });
            },

            handleClickDelete(row) {
                const vm = this;
                let { dataTableMap, tableIds } = vm.featureTable;
                let list = dataTableMap[row.tableId].list;

                let toFreeIds = [];

                if (row.isGroup || list.length === 1) {
                    delete dataTableMap[row.tableId];
                    vm.featureTable.tableIds = tableIds.filter(id => id !== row.tableId);
                    toFreeIds = list.map(item => item.id);
                } else {
                    dataTableMap[row.tableId].list = list.filter(item => item !== row);
                    toFreeIds.push(row.id);
                }

                vm.freeCheckable(toFreeIds);
                if (vm.dataSource.tableId === row.tableId) {
                    vm.freeCheckable(toFreeIds);
                }
            },

            /**
             * 修改整列的值
             * @param value
             * @param prop
             */
            handleBatchChangeCol(value, prop, ref) {
                const vm = this;
                let { featureList } = vm;

                if (vm.isBatch && featureList.length > 2) {

                    vm.$confirm('是否同步修改整列的值?', '提示', {
                        confirmButtonText: '是',
                        cancelButtonText: '否',
                        type: 'warning'
                    }).then(() => {

                        featureList.forEach(item => {

                            if (!item.isGroup) {
                                item[prop] = value;
                            }
                        })
                    }).catch(() => {});

                    if (ref && vm.$refs[ref]) { // 解决弹窗后又自动聚焦 导致下拉面板又出现
                        vm.$nextTick(() => {
                            vm.$refs[ref].blur();
                        });
                    }
                }
            },

            handleClickCancel() {
                this.$emit('cancel');
            },

            handleClickImport() {
                const vm = this;
                let { featureList } = vm;
                let params = [];

                vm.$refs['form'].validate(async (valid) => {
                    if (valid) {
                        featureList.forEach(item => {

                            if (!item.isGroup) {
                                let newItem = {...item};
                                delete newItem.id;
                                delete newItem.fieldName;
                                delete newItem.tableId;
                                params.push(newItem);
                            }
                        });

                        vm.isLoading = true;
                        let data = await batchAdd(params);
                        vm.isLoading = false;

                        if (data.code === 200) {
                            vm.$emit('saved', params);
                        }
                    } else {
                        $message.error('特征项数据校验不通过，请检查');
                    }
                });
            }
        },
        activated() {
            const vm = this;
            vm.init();
        },
        components: {
            CommonSelect,
            CommonTable,
            TreeSelect,
            ...dataSourceComponents
        }
    };
</script>
<style scoped lang="less">
    .field-btns{
        margin-bottom: -10px;
    }
    .btn-icon_delete{
        line-height: 23px;
        font-size: 16px;
        padding: 0;
        color: #f56c6c;
    }
    .common-table {
        .el-form-item{
            margin-bottom: 0;
            /deep/ .el-form-item__error{
                width: 200%;
            }
        }
    }
</style>