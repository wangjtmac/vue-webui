<!--
 领域管理主页，
 @Author: zhanbh
 @Date: 2019-10-19
-->
<template>
    <left-main-layout class="domain rel">
        <template slot="left">
            <editable-tree
                    v-loading="isLeftLoading"
                    class="height100"
                    node-key="id"
                    :data="domainList"
                    :props="treeProps"
                    :do-add="handleAdd"
                    :do-edit="handleEdit"
                    :do-delete="handleDelete"
                    @current-change="handleCurrentChange"/>
        </template>

        <div class="domain-btns">
            <el-button type="primary"
                       size="small"
                       :disabled="domain === null"
                       @click.stop="handleClickRelease">发布</el-button>
            <el-button type="primary"
                       size="small"
                       :disabled="domain === null"
                       @click.stop="handleClickLog(1)">查看日志</el-button>
        </div>

        <template>
            <graph-view :domain="domain"></graph-view>
        </template>

        <common-dialog
                :title="edit.title"
                :visible.sync="edit.dialogVisible"
                width="550px"
               >
            <edit v-if="edit.dialogVisible"
                  :data="edit.data"
                  ref="edit"
                  @saved="handleEditSaved"
                  @cancel="edit.dialogVisible = false"/>
        </common-dialog>

        <common-dialog
                :title="release.title"
                :visible.sync="release.dialogVisible"
                width="550px"
                @close="handleCloseRelease">
            <keep-alive>
                <release v-if="release.dialogVisible"
                         :data="release.data"
                         ref="release"
                         @saved="handleRelease"
                         @cancel="release.dialogVisible = false"/>
            </keep-alive>
        </common-dialog>

        <common-dialog
                :title="logView.title"
                :visible.sync="logView.dialogVisible"
                width="550px"
                @close="handleCloseLog">
            <keep-alive>
                <release-log v-if="logView.dialogVisible"
                             :data="logView.data"
                             :flag = "logView.flag"
                             ref="logView"
                             @cancel="logView.dialogVisible = false"/>
            </keep-alive>
        </common-dialog>
    </left-main-layout>

</template>

<script>
    import * as domainApi from '@/projects/Knowledge/api/domainApi';

    import Edit from './Edit';
    import Release from './Release';
    import ReleaseLog from './ReleaseLog';
    import GraphView from './GraphView';
    import EditableTree from '@/projects/Knowledge/components/EditableTree'
    import LeftMainLayout from '@/projects/Knowledge/components/LeftMainLayout'
    import CommonDialog from '@/projects/Knowledge/components/CommonDialog'


    export default {
        name: 'domain',
        data() {
            this.treeProps = {
                label: 'name'
            };
            return {
                domainList: [],
                domain: null,
                edit: {
                    dialogVisible: false,
                    title: '',
                    data: null,
                },
                release:{
                    dialogVisible: false,
                    title: '',
                    data: null,
                },
                logView:{
                    dialogVisible: false,
                    title: '',
                    data: null,
                    flag:0
                },
                isLeftLoading: false
            }
        },
        methods: {
            async reqDomainList() {
                const vm = this;
                vm.isLeftLoading = true;
                let data = await domainApi.getAll();
                vm.isLeftLoading = false;
                if (data.code === 200) {
                    vm.domainList = data.domainTree || [];
                }
            },
            async reqDeleteDomain(domain) {
                const vm = this;
                vm.isLeftLoading = true;
                let data = await domainApi.del(domain.id, domain.name);
                vm.isLeftLoading = false;
                if (data.code === 200) {
                    vm.reqDomainList();
                }
            },
            handleAdd() {
                const {edit} = this;
                edit.dialogVisible = true;
                edit.title = '新增领域';
                edit.data = null;
            },
            handleEdit(data) {
                const {edit} = this;
                edit.dialogVisible = true;
                edit.title = '编辑领域';
                edit.data = data;
            },
            handleDelete(data) {
                const vm = this;
                vm.$confirm('此操作将永久删除该领域, 是否继续?', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(() => {
                    vm.reqDeleteDomain(data)
                }).catch(_ => {});
            },
            handleEditSaved(data) {
                const vm = this;
                vm.edit.dialogVisible = false;
                vm.reqDomainList();
            },


            /**
             * 点击发布按钮
             * @param data
             */
            handleClickRelease() {
                const {release} = this;
                if (this.domain != null) {
                    release.dialogVisible = true;
                    release.title = '发布';
                    release.data = this.domain;
                }
            },
            /**
             * 发布成功
             */
            handleRelease() {
                const vm = this;
                vm.release.dialogVisible = false;
              //  vm.reqDomainList();
                vm.handleClickLog(2);
            },
            handleCloseRelease() {
                this.$refs.release.clearForm();
            },
            handleClickLog(flag) {
                const {logView} = this;
                if (this.domain != null) {
                    logView.dialogVisible = true;
                    logView.title = '发布日志';
                    logView.data = this.domain;
                    logView.flag = flag;
                }
            },
            handleCloseLog() {
                this.$refs.logView.clearForm();
            },

            handleCurrentChange(data, node) {
              this.domain = data;
            },
        },
        created() {
           this.reqDomainList();
        },
        components: {
            LeftMainLayout,
            EditableTree,
            CommonDialog,
            Edit,
            Release,
            ReleaseLog,
            GraphView
        }
    }
</script>
<style scoped lang="less">
     .domain-btns{
         position: absolute;
         top: 0;
         left: 0;
         z-index: 1;
     }
</style>