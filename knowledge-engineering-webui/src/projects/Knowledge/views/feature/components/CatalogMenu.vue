<!--
 特征主页左侧分类菜单，
 @Author: zhanbh
 @Date: 2019-10-19
-->
<template>
    <div class="catalog-menu height100" v-loading="loading">
        <span class="mb5 dib">特征分类</span>
        <el-select v-model="form.domain"
                   class="mb10"
                   size="small"
                   filterable
                   placeholder="请选择所属领域"
                   @change="handleChangeDomain">
            <el-option
                    v-for="item in domainList"
                    :key="item.id"
                    :label="item.name"
                    :value="item.id">
            </el-option>
        </el-select>
        <editable-tree ref="tree"
                       class="ovh"
                       node-key="id"
                       inline-edit
                       draggable
                       :key="form.domain"
                       :data="list"
                       :addable="form.domain !== ''"
                       :props="treeProps"
                       :allow-drop="allowDrop"
                       :do-add="handleAdd"
                       :do-edit="handleEdit"
                       :do-delete="handleDelete"
                       @node-drop="handleNodeDrop"
                       @current-change="handleCurrentChange"/>
    </div>
</template>

<script>
    import EditableTree from '@/projects/Knowledge/components/EditableTree'

    export default {
        name: "CatalogMenu",
        data() {
            this.treeProps = {
                label: 'name',
                children: 'children'
            }
            return {
                form: {
                    domain: ''
                },
                domainList: [],
                list: [],
                loading: false
            }
        },
        methods: {
            async reqAdd(params) {
                const vm = this;
                vm.loading = true;
                let {data} = await vm.$axios.post('createFeatureClassify',params).catch((error) => {
                    return {data: {msg: '服务器异常，请联系管理员'}};
                });
                vm.loading = false;
                if (data.code === 200) {
                    return true;
                } else {
                    vm.$message.error(data.msg || '新增特征分类异常');
                    return false;
                }
            },
            async reqUpdate(params) {
                const vm = this;
                vm.loading = true;
                let {data} = await vm.$axios.post('moveFeatureClassify',params).catch((error) => {
                    return {data: {msg: '服务器异常，请联系管理员'}};
                });
                vm.loading = false;
                if (data.code === 200) {
                    return true;
                } else {
                    vm.$message.error(data.msg || '修改特征分类异常');
                    return false;
                }
            },
            async reqDelete(id) {
                const vm = this;
                vm.loading = true;
                let {data} = await vm.$axios.post('destoryFeatureClassify',{},{
                    params: {featureClassifyId: id}
                }).catch((error) => {
                    return {data: {msg: '服务器异常，请联系管理员'}};
                });
                vm.loading = false;
                if (data.code === 200) {
                    return true;
                } else {
                    vm.$message.error(data.msg || '删除特征分类异常');
                    return false;
                }
            },
            async reqDomainList() {
                const vm = this;
                vm.loading = true;
                let {data} = await vm.$axios.get('getAllDomain').catch((error) => {
                    return {data: {msg: '服务器异常，请联系管理员'}};
                });
                vm.loading = false;
                let list = [];
                if (data.code === 200) {
                    list = data.domainTree || [];
                } else {
                    vm.$message.error(data.msg || '查询领域列表异常');
                }
                vm.domainList = list;
                if (list.length > 0) {
                    vm.form.domain = list[0].id;
                    vm.handleChangeDomain();
                }
            },
            async reqCatalogTree() {
                const vm = this;
                vm.loading = true;
                let {data} = await vm.$axios.get(`initFeatureClassifyTree`,{
                    params: {
                        domainId: vm.form.domain
                    }
                }).catch((error) => {
                    return {data: {msg: '服务器异常，请联系管理员'}};
                });
                vm.loading = false;
                let tree = [];
                if (data.code === 200) {
                    tree = data.featureClassifyTree || [];
                } else {
                    vm.$message.error(data.msg || '查询特征分类异常');
                }
                vm.list = tree;
            },
            init(){
                const vm = this;
                vm.reqDomainList();
            },
            initDataByDomain() {
                const vm = this;
                if (vm.$refs.tree) {
                    vm.$refs.tree.resetFilter();
                }
                vm.reqCatalogTree();
            },
            allowDrop(node, dropNode, type) {
                if (type === 'inner') {
                    return node.parent !== dropNode;
                } else {
                    return node.parent !== dropNode.parent; // 没有顺序意义，同父亲只是改变顺序，没意义
                }
            },
            handleDelete(data) {
                const vm = this;
                vm.$confirm('此操作将永久删除该特征分类, 是否继续?', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(async () => {
                    let success = await vm.reqDelete(data.id);
                    if (success) {
                        vm.reqCatalogTree();
                    }
                }).catch(_ => {});;
            },
            async handleAdd(parent, text) {
                const vm = this;
                let data = {
                    name: text,
                    domainId: vm.form.domain
                };

                if (parent) {
                    data.parentId = parent.id;
                }

                let success = await vm.reqAdd(data);

                if (success) {
                    vm.reqCatalogTree();
                }

                return success;
            },
            async handleEdit(data, text) {
                const vm = this;

                let success = await vm.reqUpdate({
                    id: data.id,
                    name: text
                });

                if (success) {
                    vm.reqCatalogTree();
                }

                return success;
            },
            handleCurrentChange(data, node) {
                this.$emit('current-change', data);
            },
            handleChangeDomain() {
                const vm = this;
                vm.$emit('domain-change', vm.form.domain);
                vm.initDataByDomain();
            },
            async handleNodeDrop(node, dropNode, type, event) {
                const vm = this;
                let data = node.data;
                let params = { id: data.id, name: data.name };
                if (type === 'inner') {
                    params.parentId = dropNode.data.id;
                } else {
                    params.parentId = dropNode.data.pid;
                }
                await vm.reqUpdate(params);
                vm.reqCatalogTree();
            }
        },
        created() {
            this.init()
        },
        components: {
            EditableTree
        }
    }
</script>

<style scoped lang="less">
    .catalog-menu {
        display: flex;
        flex-direction: column;
    }
</style>