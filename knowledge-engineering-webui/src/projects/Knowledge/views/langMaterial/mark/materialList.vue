<!--
 语料列表页
 @Author: zhanbh
 @Date: 2020-02-06
-->
<template>
    <div class="material-list">
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
    </div>
</template>
<script>
    import CommonTable from '@/projects/Knowledge/components/CommonTable'

    export default {
        name: "index",
        props: {},
        data() {
            const vm = this;
            return {
                list: [],
                columns: [
                    {
                        type: 'index',
                        label: '序号',
                        align: 'center',
                        fixed: 'left'
                    }, {
                        prop: 'status',
                        label: '标注状态',
                        align: 'center',
                    }, {
                        prop: 'dataTable',
                        label: '表名',
                        align: 'center',
                    }, {
                        prop: 'createTime',
                        label: '新建时间',
                        align: 'center',
                    }, {
                        prop: 'dataSource',
                        label: '所属库名',
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
            handleClickReset() {
                const vm = this;
                let { form: formVm } = vm.$refs;
                formVm && formVm.resetFields();
            },
            handleClickSearch() {
                this.reqList();
            },

            resize() {
                const vm = this;
                let { table: tableVm } = vm.$refs;
                tableVm && tableVm.doLayout();
            }
        },
        created() {
            const vm = this;
        },
        components: {
            CommonTable,
        }
    };
</script>
<style scoped lang="less">
</style>