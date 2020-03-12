<!--
 此处填写文件描述
 @Author: zhanbh
 @Date: 2019-11-03
-->
<template>
    <div class="relate-feature" v-loading="isLoading">
        <el-form  class="mr10"
                  ref="form"
                 label-width="90px"
                 :model="form"
                 :rules="rules"
                 @submit.native.prevent
        >
            <el-form-item label="领域关系">
                <el-input :value="relation.name" disabled></el-input>
            </el-form-item>
            <el-row>
                <el-col :span="11">
                    <el-form-item label="左顶点(出)" prop="outDomainObjId">
                        <el-select v-model="form.outDomainObjId"
                                   placeholder="领域对象"
                                   clearable
                                   filterable
                        >
                            <el-option
                                    v-for="item in outObjOptions"
                                    :key="item.id"
                                    :label="item.name"
                                    :value="item.id">
                            </el-option>
                        </el-select>
                    </el-form-item>
                </el-col>
                <el-col :span="2"><i class="relate__icon el-icon-right"></i></el-col>
                <el-col :span="11">
                    <el-form-item label="右顶点(入)" prop="inDomainObjId">
                        <el-select v-model="form.inDomainObjId"
                                   placeholder="领域对象"
                                   clearable
                                   filterable
                        >
                            <el-option
                                    v-for="item in inObjOptions"
                                    :key="item.id"
                                    :label="item.name"
                                    :value="item.id">
                            </el-option>
                        </el-select>
                    </el-form-item>
                </el-col>
            </el-row>
            <el-form-item label="关系属性" class="feature-setting" prop="newFeatureId">
                <feature-transfer v-model="form.newFeatureId"
                                  ref="transfer"
                                  :data="featureTree"
                                  :dic-map="dicMap"
                                  @closed-dialog="handleClosedFeatureDialog"
                ></feature-transfer>
            </el-form-item>
            <div class="tr mb2 mt20">
                <el-button size="small" @click.stop="handleClickCancel"> 取消</el-button>
                <el-button size="small" type="primary" @click.stop="handleClickSave">确定</el-button>
            </div>
        </el-form>
    </div>
</template>
<script>
    import FeatureTransfer from '@/projects/Knowledge/components/FeatureTransfer'
    import * as treeUtil from '@/projects/Knowledge/assets/js/utils/treeUtil'

    export default {
        name: "RelateFeature",
        props: {
            relation: {
                type: Object,
                required: true
            },
            domainId: String
        },
        data() {
            return {
                form: {
                    inDomainObjId: '',
                    outDomainObjId: '',
                    newFeatureId: []
                },
                rules: {
                    outDomainObjId: [
                        { required: true, message: '请选择左顶点对象', trigger: 'blur' },
                    ],
                    inDomainObjId: [
                        { required: true, message: '请选择右顶点对象', trigger: 'blur' },
                    ]
                },
                featureTree: [],
                objectTree: {
                    tree: [],
                    outObjRoot: [],
                    inObjRoot: []
                },
                objectOptions: [],
                dicMap: {
                    dataType: [],
                    dataBaseType: [],
                    dataLevel: [],
                }, // 字典数据
                isLoading: false
            };
        },
        computed: {
            inObjOptions() {
                const vm = this;
                let {tree, inObjRoot: root = []} = vm.objectTree;
                return vm.getSubTreeList(tree, root);
            },
            outObjOptions() {
                const vm = this;
                let {tree, outObjRoot: root = []} = vm.objectTree;
                return vm.getSubTreeList(tree, root);
            }
        },
        watch: {
            relation: {
                handler() {
                    const vm = this;
                    vm.initData();
                    vm.initObjects();
                    vm.initFeatures();
                },
                immediate: true
            },
            /*domainId() {
                const vm = this;
                vm.initObjects();
                vm.initFeatures();
            }*/
        },
        methods: {
            async reqSave(params) {
                const vm = this;
                vm.isLoading = true;
                let {data} = await vm.$axios.post('saveRelationType', params).catch((error) => {
                    return {data: {msg: '服务器异常，请联系管理员'}};
                });
                vm.isLoading = false;
                if (data.code === 200) {
                    vm.$message.success('关联特征项成功');
                    return true;
                } else {
                    vm.$message.error(data.msg || `关联特征项异常`);
                    return false;
                }
            },
            async reqData() {
                const vm = this;
                let { relation, domainId } = vm;
                vm.isLoading = true;
                let {data} = await vm.$axios.get('relationType', {
                    params: {
                        domainId: domainId,
                        relationId: relation.id
                    }
                }).catch((error) => {
                    return {data: {msg: '服务器异常，请联系管理员'}};
                });
                vm.isLoading = false;
                let result = {};
                if (data.code === 200) {
                    result = data.result || {};
                } else {
                    vm.$message.error(data.msg || `查询领域对象特征列表异常`);
                }
                return result;
            },
            async initData() {
                const vm = this;
                vm.clearForm();
                let data = {};
                if (vm.relation) {
                    data = await vm.reqData();
                }
                // 初始化表单
                vm.form.outDomainObjId = data.outDomainObjId || '';
                vm.form.inDomainObjId = data.inDomainObjId || '';
                vm.form.newFeatureId = [...(new Set((data.ownFeatureIdList || []).map(item => item.id)))]; // 去重

                vm.objectTree.tree = data.objList || [];
                vm.objectTree.outObjRoot = data.outObjList || [];
                vm.objectTree.inObjRoot = data.inObjList || [];
            },
            async reqDic(url, field, name) {
                const vm = this;
                let {data} = await vm.$axios.get(url).catch((error) => {
                    return {data: {msg: '服务器异常，请联系管理员'}};
                });
                let list = [];
                if (data.code === 200) {
                    list = data.result || [];
                } else {
                    vm.$message.error(data.msg || `查询${ name || '' }异常`);
                }
                vm.dicMap[field] = list;
            },
            async reqObjects() {
                const vm = this;
                let {data} = await vm.$axios.get(`getDomainTree`,{
                    params: {
                        domainId: vm.domainId,
                        domainObjType: '0'
                    }
                }).catch((error) => {
                    return {data: {msg: '服务器异常，请联系管理员'}};
                });
                let tree = [];
                if (data.code === 200) {
                    tree = data.domainTrees || [];
                } else {
                    vm.$message.error('查询领域对象列表异常');
                }
                return tree;
            },
            async reqFeatures() {
                const vm = this;
                let {data} = await vm.$axios.get(`getClassifyAndFeatures`,{
                    params: {
                        domainId: vm.domainId
                    }
                }).catch((error) => {
                    return {data: {msg: '服务器异常，请联系管理员'}};
                });
                let tree = [];
                if (data.code === 200) {
                    tree = data.result || [];
                } else {
                    vm.$message.error('查询领域对象列表异常');
                }
                return tree;
            },
            initDic() {
                const vm = this;
                vm.reqDic('getEnumDomainDataLevelType', 'dataLevel', '数据等级');
                vm.reqDic('getEnumDomainStandardType', 'dataType', '数据类型');
                vm.reqDic('getEnumDomainFeaturesValType', 'dataBaseType', '数据基础类型');
            },
            async initObjects(){
                const vm = this;
                const { domainId } = vm;
                let tree = await vm.reqObjects();
                if (vm.domainId !== domainId) {
                    return false;
                }
                vm.objectOptions = treeUtil.treeToList(tree);
            },
            async initFeatures() {
                const vm = this;
                const { domainId } = vm;
                let tree = await vm.reqFeatures();
                if (vm.domainId !== domainId) {
                    return false;
                }
                vm.featureTree = tree;
            },
            handleClickCancel() {
                this.$emit('cancel')
            },
            handleClickSave() {
                const vm = this;
                vm.$refs['form'].validate(async (valid) => {
                    if (valid) {
                        let params = Object.assign({id: vm.relation.id}, vm.form);
                        let success = await vm.reqSave(params);
                        if (success) {
                            vm.$emit('saved', params);
                        }
                    }
                })
            },
            handleClosedFeatureDialog() {
                this.initFeatures();
            },
            clearForm() {
                const vm = this;
                if (vm.$refs['form']) {
                    vm.$refs['form'].resetFields();
                }
                if (vm.$refs['transfer']) {
                    vm.$refs['transfer'].resetFields();
                }
            },
            /**
             * 如果id为空，则认为是整棵树，由后台返回数据决定
             * @param tree
             * @param ids
             * @returns {*}
             */
            getSubTreeList(tree = [], ids = []) {
                let appointRoot = ids.filter(id => Boolean(id));
                if (ids.length === 0 || appointRoot.length < ids.length) { // 包含整棵树
                    return treeUtil.treeToList(tree);
                } else {
                    let subTree = [];
                    appointRoot.forEach(id => {
                        subTree.push(...treeUtil.getNode(tree, id));
                    });
                    return treeUtil.treeToList(subTree);
                }
            },
        },
        created() {
            this.initDic();
        },
        activated() {
            const vm = this;
            vm.initData();
            vm.initObjects();
            vm.initFeatures();
        },
        components: {
            FeatureTransfer,
        }
    };
</script>
<style scoped lang="less">
    .relate-feature{
        max-height: calc(85vh - 120px);
        overflow: auto;
    }
    .el-row .el-form-item{
        margin-bottom: 10px;
    }
    .relate__icon {
        display: block;
        font-size: 2em;
        width: 1em;
        margin: auto;
        line-height: 40px;
    }
    /deep/ .el-transfer-panel {
        min-width: 200px;
        width: calc(50% - 33px);
    }
</style>