<template>
    <el-form class="database-import"
             v-loading="isLoading"
             ref="form"
             :model="form"
             :rules="rules"
             label-width="70px"
             size="small"
             @submit.native.prevent>
        <el-row :gutter="20">
            <el-col :span="12">
                <el-form-item label="领域对象" prop="objName">
                    <el-input :value="form.objName" disabled></el-input>
                </el-form-item>
            </el-col>
            <el-col :span="12">
                <el-form-item label="特征项" prop="featuresName">
                    <el-input :value="form.featuresName" disabled></el-input>
                </el-form-item>
            </el-col>
        </el-row>
        <el-form-item label="数据源" prop="list">
            <common-table :columns="columns"
                          :data="form.list"
                          row-key="rowKey">
                <template #header-source="{column}">
                    <span class="is-required-col">{{column.label}}</span>
                </template>
                <template #source="{$index, row}">
                    <el-form-item :key="form.list[$index].dataSourceId" :prop="`list.${$index}.dataSourceId`"
                                  :rules="{required: true, message: '库名不能为空', trigger: 'blur'}">
                        <data-source-select
                                v-model="row.dataSourceId"
                                :data-house="dataHouse"
                                @input="handleChangeDataSource(row)">
                        </data-source-select>
                    </el-form-item>
                </template>
                <template #header-table="{column}">
                    <span class="is-required-col">{{column.label}}</span>
                </template>
                <template #table="{$index, row}">
                    <el-form-item :prop="`list.${$index}.dataObjId`"
                                  :rules="{required: true, message: '表名不能为空', trigger: 'blur'}">
                        <data-table-select
                                v-model="row.dataObjId"
                                :data-house="dataHouse"
                                :data-source-id="row.dataSourceId"
                                @input="handleChangeTable(row)">
                        </data-table-select>
                    </el-form-item>
                </template>
                <template #header-field="{column}">
                    <span class="is-required-col">{{column.label}}</span>
                </template>
                <template #field="{$index, row}">
                    <el-form-item :prop="`list.${$index}.dataColumnId`"
                                  :rules="{required: true, message: '字段名不能为空', trigger: 'blur'}">
                        <data-column-select
                                v-model="row.dataColumnId"
                                :data-house="dataHouse"
                                :data-type="form.dataType"
                                :data-table-id="row.dataObjId">
                        </data-column-select>
                    </el-form-item>
                </template>
                <template #header-opers="{row}">
                    <el-button type="text"
                               icon="el-icon-circle-plus"
                               title="添加" @click.stop="handleClickAdd"></el-button>
                </template>
                <template #opers="{row, $index}">
                    <el-popover
                            placement="top"
                            width="160"
                            :disabled="isRowDeletable(row)"
                            v-model="row.popVisible">
                        <template>
                            <p class="mb5">已配置数据，确定删除？</p>
                            <div class="tr">
                                <el-button size="mini" type="text" @click="row.popVisible = false">取消</el-button>
                                <el-button type="primary" size="mini" @click="handleConfirmDelete(row, $index)">确定</el-button>
                            </div>
                        </template>
                        <el-button slot="reference"
                                   type="text"
                                   class="btn-icon_delete"
                                   icon="el-icon-remove"
                                   title="删除" @click="handleClickDelete(row, $index)">
                        </el-button>
                    </el-popover>
                </template>
            </common-table>
        </el-form-item>
        <el-form-item class="tr">
            <el-button @click.stop="handleClickCancel">取消</el-button>
            <el-button type="primary" @click.stop="handleClickSave">保存</el-button>
        </el-form-item>
    </el-form>
</template>

<script>

    import {DataHouse} from '@/projects/Knowledge/api/dataSourceApi';
    import * as objectApi from '@/projects/Knowledge/api/objectApi';

    import CommonTable from '@/projects/Knowledge/components/CommonTable';
    import * as dataSourceComponents from '@/projects/Knowledge/components/dataSource';

    export default {
        name: "DatabaseImport",
        props: {
            data: {
                type: Object,
                required: true
            }
        },
        data() {
            return {
                dataHouse: null,
                form: {
                    objName: '',
                    dataType:'',
                    featuresName: '',
                    list: [], // {rowKey, dataSourceId, dataObjId, dataColumnId, popVisible}
                              // popVisible 用来控制删除弹窗，不入库 rowKey：行键值，不加的话会因为vue复用组件，导致表单校验结果错位
                },
                rules: {
                    list: {required: true, message: '数据源不能为空', trigger: 'blur'}
                },
                columns: [
                    {
                        prop: 'source',
                        label: '数据库名称',
                        align: 'center'
                    }, {
                        prop: 'table',
                        label: '数据库表名',
                        align: 'center'
                    },  {
                        prop: 'field',
                        label: '字段名',
                        align: 'center'
                    },  {
                        prop: 'opers',
                        align: 'center',
                        width: 50
                    }
                ],
                nextRowKey: 0, // 作为行键值 不加的话会因为vue复用组件，导致表单校验结果错位
                isLoading: false
            }
        },
        watch: {
            data: {
                handler() {
                    this.initData();
                },
                immediate: true,
                deep: true
            }
        },
        methods: {
            initData() {
                const vm = this;
                vm.dataHouse = new DataHouse();
                let {data, form} = vm;

                if (data === null) {
                    data = {};
                }

                vm.$refs['form'] && vm.$refs['form'].clearValidate();
                form.objName = data.objName;
                form.featuresName = data.featuresName;
                form.dataType = '';
                form.list =[];

                vm.isLoading = false;

                vm.initList();
            },

            async doSave() {
                const vm = this;
                let params = {
                    objFeatureId: vm.data.id
                };
                params.domainFeaturePrimevalOperatorCfgList = vm.form.list.map(item => {
                    let newItem = Object.assign({}, item);
                    delete newItem.popVisible;
                    delete newItem.rowKey;
                    return newItem;
                });

                let data = await objectApi.saveDatabaseImport(params);
                if (data.code === 200) {
                    vm.$emit('saved', params);
                }
            },

            async initList() {
                const vm = this;
                vm.isLoading = false;
                let list = [];
                let {data, form} = vm;

                if (data !== null && typeof data.id === 'string') {
                    let objFeatureId = data.id;
                    vm.isLoading = true;
                    let respData = await objectApi.getDatabaseImport(objFeatureId);

                    if (vm.data && objFeatureId === vm.data.id) {
                        vm.isLoading = false;
                        if (respData.code === 200) {
                            list = respData.result.domainFeaturePrimevalOperatorCfgList || [];
                            form.dataType = respData.result.dataType;
                        }
                    } else {
                        return false;
                    }
                }

                form.list = list.map(item => {
                    return {
                        rowKey: vm.nextRowKey++, // 不入库
                        dataSourceId: item.dataSourceId,
                        dataObjId: item.dataObjId,
                        dataColumnId: item.dataColumnId,
                        id:item.id,
                        popVisible: false, // 不入库
                    }
                });
            },

            isRowDeletable(row) {
                let fields = ['dataSourceId', 'dataObjId', 'dataColumnId'];
                return !row || fields.every(field => row[field] === '');
            },

            handleClickAdd() {
                const vm = this;
                let newItem = {
                    rowKey: vm.nextRowKey++, // 不入库
                    dataSourceId: '',
                    dataObjId: '',
                    dataColumnId: '',
                    popVisible: false, // 不入库
                };
                vm.form.list.push(newItem);

                // 对数据源列表重新校验  注意不是对里面的column校验
                vm.$refs['form'].validateField('list');
            },

            handleClickDelete(row, index) {
                const vm = this;
                if (vm.isRowDeletable(row)) {
                    vm.handleConfirmDelete(row, index);
                }
            },

            handleConfirmDelete(row, index) {
                const vm = this;
                vm.form.list.splice(index, 1);

                // 对数据源重新校验
                vm.$refs['form'].validateField('list');
            },

            handleChangeDataSource(row) {
                const vm = this;

                if (row) {
                    row.dataObjId = '';
                    vm.handleChangeTable(row);
                }
            },

            handleChangeTable(row) {
                if (row) {
                    row.dataColumnId = ''
                }
            },

            handleClickCancel() {
                this.$emit('cancel');
            },

            handleClickSave() {
                const vm = this;
                vm.$refs['form'].validate((valid) => {

                    if (valid) {
                        vm.doSave();
                    }
                });
            }
        },
        activated() {
            this.initData();
        },
        components: {
            CommonTable,
            ...dataSourceComponents
        }
    }
</script>

<style scoped lang="less">
    .common-table {
        .el-form-item{
            margin-bottom: 0;
        }
        .is-required-col:before{
            content: '*';
            color: #f5222d;
            margin-right: 4px;
        }
    }
    .el-table{
        .el-button{
            line-height: 23px;
            font-size: 16px;
            padding: 0;
        }
        .btn-icon_delete{
            color: #f56c6c;
        }
    }

</style>