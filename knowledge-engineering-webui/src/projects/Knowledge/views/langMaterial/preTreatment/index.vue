<!--
 语料预处理列表页
 @Author: zhanbh
 @Date: 2020-02-06
-->
<template>
    <left-main-layout class="pre-treatment" v-loading="isLoading || domain.isLoading" :show-left="false">
        <div class="ovh">
            <div class="fl mb10 mr15 lh40">
                <el-button type="primary"
                           size="small"
                           @click.stop="handleClickAdd"
                >新建方案</el-button>
            </div>
            <el-form :inline="true"
                     ref="form"
                     :model="form"
                     class="fl"
                     @submit.native.prevent>
                <el-form-item prop="textName">
                    <el-input v-model="form.textName"
                              placeholder="文本处理描述"
                              @keyup.enter="handleClickSearch">
                    </el-input>
                </el-form-item>
                <el-form-item prop="domain">
                    <common-select v-model="form.domain"
                                   placeholder="所属领域"
                                   :data="domain.data"
                                   :props="domain.props"
                                   :loading="domain.isLoading">
                    </common-select>
                </el-form-item>
                <el-form-item>
                    <el-button size="small"
                               @click="handleClickReset"
                    >重置</el-button>
                    <el-button type="primary"
                               size="small"
                               @click="handleClickSearch(form)"
                    >查询</el-button>
                </el-form-item>
            </el-form>
        </div>
        <common-table :columns="columns"
                      :data="list"
                      ref="table"
        >
            <template slot="operations" slot-scope="{row}">
                <i class="icon ce_link pl5 pr5 f18"
                   v-for="(opt , index) in operations"
                   v-html="opt.icon"
                   v-show="opt.filter ? opt.filter(row) : true"
                   :key="index"
                   :title="opt.title"
                   :style="{color: opt.color}"
                   @click="opt.handler(row)"
                ></i>
            </template>
        </common-table>

        <common-dialog
                :visible.sync="edit.dialogVisible"
                @closed="handleClosedEditDialog"
                width="550px">
            <template slot="title">
                <span class="el-dialog__title">{{edit.title}} </span>
            </template>
            <edit ref="edit"
                  v-if="edit.dialogVisible"
                  :data="edit.data"
                  @preScheme_saved="handleEditSaved"
                  @cancel="edit.dialogVisible = false"
            />
        </common-dialog>
    </left-main-layout>
</template>
<script>
    import * as domainApi from '@/projects/Knowledge/api/domainApi';
    import * as preTreatmentApi from '@/projects/Knowledge/api/preTreatmentApi';
    import LeftMainLayout from '@/projects/Knowledge/components/LeftMainLayout'
    import CommonTable from '@/projects/Knowledge/components/CommonTable'
    import CommonDialog from '@/projects/Knowledge/components/CommonDialog'
    import CommonSelect from '@/projects/Knowledge/components/CommonSelect'
    import edit from './edit';

    export default {
        name: "index",
        props: {},
        data() {
            const vm = this;
            return {
                form: {
                    domainVo:{
                        id: '',
                        name:''
                    },
                    handleType:'',
                    textName:'',
                    dataSource:'',
                    dataTable:'',
                    dataSourceId:'',
                    dataObjId:'',
                    dataSourceName:'',
                    tableName:'',
                    operateTime:'',
                    isCreate:'0'
                },
                list: [],
                columns: [
                    {
                        type: 'index',
                        label: '序号',
                        align: 'center',
                        fixed: 'left'
                    }, {
                        prop: 'desc',
                        label: '文本处理描述',
                        align: 'center',
                    }, {
                        prop: 'type',
                        label: '处理类别',
                        align: 'center',
                    }, {
                        prop: 'domain',
                        label: '所属领域',
                        align: 'center',
                    }, {
                        prop: 'dataSourceName',
                        label: '所属库名',
                        align: 'center',
                    }, {
                        prop: 'dataTableName',
                        label: '所属表名',
                        align: 'center',
                    }, {
                        prop: 'updateTime',
                        label: '最近更新时间',
                        align: 'center',
                    }, {
                        prop: 'operations',
                        label: '操作',
                        width: '130',
                        align: 'center',
                        fixed: 'right'
                    }
                ],
                operations: [
                    {
                        title: '编辑',
                        handler: this.handleClickEdit,
                        icon: '&#xe765;',
                    }, {
                        title: '配置',
                        handler: this.handleClickSetting,
                        filter: row => true,
                        icon: '&#xe6bd;'
                    }, {
                        title: '删除',
                        handler: this.handleClickDelete,
                        filter: row => true,
                        color: '#f56c6c',
                        icon: '&#xe6f9;'
                    }
                ],
                edit: {
                    title: '',
                    dialogVisible: false,
                    data: null,
                },
                isLoading: false,
                domain: {
                    isLoading: false,
                    data: [],
                    reqCode: '',
                    props: {
                        value: 'id',
                        label: 'name'
                    },
                },
            }
        },
        watch: {},
        methods: {
            initList() {
                const vm = this;
                vm.$refs.form && vm.$refs.form.resetFields();
                if (vm.domainId) {
                    vm.reqList();
                } else {
                    vm.list = [];
                }
            },
            async initDomain() {
                const vm = this;
                let { domain } = vm;

                if (domain.reqCode !== 200) {
                    domain.isLoading = true;
                    let result = await domainApi.getAll();
                    domain.isLoading = false;

                    domain.reqCode = result.code;
                    domain.data = result.domainTree || [];
                }

                return domain.data;
            },
            handleClickAdd() {
                const {edit} = this;
                edit.dialogVisible = true;
                edit.title = '新增方案';
                edit.disabled = false;
                edit.data = null;
            },
            handleClickEdit(data){
                const {edit} = this;
                debugger
                edit.dialogVisible = true;
                edit.title = '编辑';
                edit.data = data;
            },
            handleClickSetting(data) {

            },
            handleClickDelete(data) {
                const vm = this;
                vm.$confirm('此操作将永久删除该数据, 是否继续?', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(async () => {
                    let success = await vm.$axios.post('delCorpusPreSchemeById',{id:data.id}).catch((error) => {
                        return {data: {msg: '服务器异常，请联系管理员'}};
                    });
                    if (success) {
                        vm.initData(vm.form);
                    }
                  //  let data = await preTreatmentApi.delCorpusPreSchemeById({id:data.id});
                  //  if (data) {
                  //      vm.initData(vm.form);
                  //  }
                }).catch(_ => {});;
            },
            handleEditSaved() {
                const vm = this;
                let {edit} = vm;
                vm.initData(vm.form);
                edit.dialogVisible = false;
                return {data: {msg: '保存成功'}};
            },
            handleClickReset() {
                const vm = this;
                let { form: formVm } = vm.$refs;
                formVm && formVm.resetFields();
            },
            handleClickSearch(params) {
                params.domainVo.id = params.domain;
                this.initData(params)
            },
            handleClosedEditDialog() {
                const vm = this;
                vm.edit.data = null;
            },

            resize() {
                const vm = this;
                let { table: tableVm } = vm.$refs;
                tableVm && tableVm.doLayout();
            },
            async initData(params) {
                const vm = this;
                let data =  await preTreatmentApi.getCorpusPreScheme(params);
                vm.isLoading = false;
                let list = data.result || [];
                list.forEach((item, index) => {
                    list[index] = {
                        id: item.id,
                        desc: item.textName,
                        type: item.handleType,
                        domain: item.domainVo.name,
                        dataTable:item.dataObjId,
                        dataSource:item.dataSourceId,
                        dataSourceName:item.dataSourceName ,
                        dataTableName: item.tableName,
                        updateTime:item.operateTime,
                    }
                });
                vm.list = list;

            }
        },
        created() {
            const vm = this;
            vm.initDomain();
            vm.initData(this.form);
        },
        components: {
            LeftMainLayout,
            CommonTable,
            CommonDialog,
            CommonSelect,
            edit,
        }
    };
</script>
<style scoped lang="less">
    .el-form-item{
        max-width: 200px;
        min-width: 130px;
        margin-bottom: 10px;
    }
</style>