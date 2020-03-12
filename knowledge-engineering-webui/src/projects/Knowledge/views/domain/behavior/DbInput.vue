<template>
    <el-form class="database-import"
             v-loading="isLoading"
             ref="form"
             :model="form"
             label-width="100px"
             size="small"
             @submit.native.prevent>

        <el-form-item label-width="0"  prop="list">
            <el-row :gutter="20">
                <el-col :span="8">
                    <data-source-select
                            v-model="form.dataSourceId"
                            :data-house="dataHouse"
                            @input="handleChangeDataSource">
                    </data-source-select>
                </el-col>
                <el-col :span="8">
                    <data-table-select
                            v-model="form.dataObjId"
                            :data-house="dataHouse"
                            :data-source-id="form.dataSourceId"
                            @input="handleChangeTable">
                    </data-table-select>
                </el-col>
                <el-col :span="8">
                    <data-column-select
                            v-model="form.dataColumnId"
                            :data-house="dataHouse"
                            :data-table-id="form.dataObjId"
                            @input="initList()"
                    >
                    </data-column-select>
                </el-col>
            </el-row>
        </el-form-item>

        <el-form-item label-width="0" prop="list" >
            <common-table :columns="columns"
                          :data="form.list">
                      <template #name="{$index, value}">
                       <span  >
                           {{value}}
                       </span>
                      </template>
                      <template #field="{$index, row}" >
                          <el-input
                                  v-model="row.inputName"
                                  maxlength="50"
                                  show-word-limit
                          ></el-input>
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
                            <div class="tr" style="text-align: center">
                                <p class="mb5">确定删除？</p>
                                <el-button   @click="row.popVisible = false">取消</el-button>
                                <el-button type="primary"  @click="handleConfirmDelete(row, $index)">确定</el-button>
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
            <el-button type="primary" @click.stop="handleClickSave(domainId)"
                       v-loading="isLoading">保存</el-button>
        </el-form-item>
    </el-form>
</template>

<script>

    import {DataHouse} from '@/projects/Knowledge/api/dataSourceApi';
    import * as objectApi from '@/projects/Knowledge/api/domainObjectApi';

    import CommonTable from '@/projects/Knowledge/components/CommonTable';
    import * as dataSourceComponents from '@/projects/Knowledge/components/dataSource';

    export default {
        name: "DatabaseImport",
        props: {
            behavior: {
                type: Object,
                required: true
            },
            domainId: String
        },
        data() {
            return {
                dataHouse: null,
                form: {
                    dataSourceId: '',
                    dataObjId: '',
                    dataColumnId: '',
                    list: [], // {dataSourceId, dataObjId, dataColumnId, popVisible} // popVisible 用来控制删除弹窗，不入库
                },

                columns: [
                    {
                        prop: 'name',
                        label: '字段值',
                        align: 'center'
                    },  {
                        prop: 'field',
                        label: '关系类型',
                        align: 'center'
                    },  {
                        prop: 'opers',
                        align: 'center',
                        width: 50
                    }
                ],
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
                vm.form.dataSourceId = '';
                vm.handleChangeDataSource();
                vm.$refs['form'] && vm.$refs['form'].clearValidate();
                vm.isLoading = false;
            },

            async doSave() {
                const vm = this;
                vm.isLoading = true;
                let params = {
                    domainId:vm.domainId,
                    parentId:vm.behavior.id,
                    commonVoList:[]
                };
                params.commonVoList = vm.form.list.map(item => {
                    let newItem = Object.assign({}, item);
                    delete newItem.popVisible;
                    return newItem;
                });

                let data = await objectApi.behaviorLibraryInto(params);
                if (data.code === 200) {
                    this.$emit('dbInput-save');
                    this.$message.success(data.result);
                    vm.isLoading = false;
                }
                vm.isLoading = false;
            },

            async initList() {
                const vm = this;
                vm.form.list = [];
                vm.isLoading = true;
                let list = [];
                let {data, form} = vm;
                let params = {
                    dataSourceId:form.dataSourceId,
                    tableId:form.dataObjId,
                    codeId:form.dataColumnId
                };
                if(!form.dataColumnId){
                    return;
                }
                let {data : respData} = await vm.$axios.post('getCodeValueByCode', params).catch((error) => {
                    vm.isLoading = false;
                    return {data: {msg: '服务器异常，请联系管理员'}};
                });
                if(respData.result.length == 0){
                    this.$message.error("未查询到数据");
                }
                for (let index in respData.result) {
                    list.push({ name: respData.result[index]});
                }
                vm.isLoading = false;
                form.list = list.map(item => {
                    return {
                        name: item.name,
                        inputName:  item.name,
                        popVisible: false
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
                    popVisible: false
                };
                vm.form.list.push(newItem);

                // 对数据源重新校验
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

            handleChangeDataSource() {//dataHouse dataSource columns
                const vm = this;
                vm.form.dataObjId = '';
                vm.handleChangeTable();
            },

            handleChangeTable() {
                const vm = this;
                vm.form.dataColumnId  = '';
                vm.form.list = [];
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
<style scoped>
    /deep/ .el-dialog__body{
        box-sizing: border-box;
        padding-top: 10px;
        max-height: calc(90vh - 105px);
        width: 500px;
        overflow: auto;
    }
</style>