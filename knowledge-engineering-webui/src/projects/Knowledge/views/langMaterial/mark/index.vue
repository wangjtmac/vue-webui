<!--
 语料标注列表页
 @Author: zhanbh
 @Date: 2020-02-06
-->
<template>
    <left-main-layout class="lang-mark" v-loading="isLoading || domain.isLoading" :show-left="false">
        <div class="ovh">
            <div class="fl mb10 mr15 lh40">
                <el-button type="primary"
                           size="small"
                           @click.stop="handleClickAdd"
                >标注方案</el-button>
            </div>
            <el-form :inline="true"
                     ref="form"
                     :model="form"
                     class="fl"
                     @submit.native.prevent>
                <el-form-item prop="desc">
                    <el-input v-model="form.name"
                              placeholder="方案名称">
                    </el-input>
                </el-form-item>
                <el-form-item prop="desc">
                    <el-input v-model="form.material"
                              placeholder="预处理语料">
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
                               @click="handleClickSearch"
                    >查询</el-button>
                </el-form-item>
            </el-form>
        </div>
        <common-table :columns="columns"
                      :data="list"
                      ref="table"
        >
            <template slot="expand">
                <material-list></material-list>
            </template>
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
                width="90vw">
            <template slot="title">
                <span class="el-dialog__title">{{edit.title}} </span>
            </template>
            <edit ref="edit"
                  v-if="edit.dialogVisible"
                  :data="edit.data"
                  @saved="handleEditSaved"
                  @cancel="edit.dialogVisible = false"
            />
        </common-dialog>
    </left-main-layout>
</template>
<script>
    import * as domainApi from '@/projects/Knowledge/api/domainApi';

    import LeftMainLayout from '@/projects/Knowledge/components/LeftMainLayout'
    import CommonTable from '@/projects/Knowledge/components/CommonTable'
    import CommonDialog from '@/projects/Knowledge/components/CommonDialog'
    import CommonSelect from '@/projects/Knowledge/components/CommonSelect'
    import edit from './edit';
    import materialList from './materialList'

    export default {
        name: "LangMark",
        props: {},
        data() {
            const vm = this;
            return {
                form: {
                    name: '',
                    material: '',
                    domain: '',
                },
                list: [{}],
                columns: [
                    {
                        prop: 'expand',
                        type: 'expand'
                    }, {
                        prop: 'name',
                        label: '方案名称',
                        align: 'center',
                    }, {
                        prop: 'material',
                        label: '预处理语料',
                        align: 'center',
                    }, {
                        prop: 'domain',
                        label: '所属领域',
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
                    },
                    {
                        title: '新增语料',
                        handler: this.handleClickEdit,
                        icon: '&#xe701;',
                    }, {
                        title: '删除方案',
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
                edit.title = '标注配置';
                edit.disabled = false;
                edit.data = null;
            },
            handleClickEdit(data){
                const {edit} = this;
                edit.dialogVisible = true;
                edit.title = `标注配置 > ${data.name}`;
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
                    let success = await vm.reqDelete(data);
                    if (success) {
                        vm.reqList();
                    }
                }).catch(_ => {});;
            },
            handleEditSaved() {
                const vm = this;
                let {edit} = vm;
                edit.dialogVisible = false;
                vm.reqList();
            },
            handleClickReset() {
                const vm = this;
                let { form: formVm } = vm.$refs;
                formVm && formVm.resetFields();
            },
            handleClickSearch() {
                this.reqList();
            },
            handleClosedEditDialog() {
                const vm = this;
                vm.edit.data = null;
            },

            resize() {
                const vm = this;
                let { table: tableVm } = vm.$refs;
                tableVm && tableVm.doLayout();
            }
        },
        created() {
            const vm = this;
            vm.initDomain();
        },
        components: {
            LeftMainLayout,
            CommonTable,
            CommonDialog,
            CommonSelect,
            edit,
            materialList
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