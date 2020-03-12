<!--
 领域行为关联特征
 @Author: zhanbh
 @Date: 2019-11-03
-->
<template>
    <div class="relate-feature" v-loading="isLoading">
        <el-form  class="mr10"
                  ref="form"
                 label-width="80px"
                 :model="form"
                 :rules="rules"
                 @submit.native.prevent
        >
            <el-row>
                <el-col :span="12">
                    <el-form-item label="领域行为">
                        <el-input :value="behavior.name" disabled></el-input>
                    </el-form-item>
                </el-col>
                <el-col :span="12">
                    <el-form-item label="发生地理位置" label-width="110px" prop="siteObj.id">
                        <el-select v-model="form.siteObj.id"
                                   placeholder="领域对象"
                                   clearable
                                   filterable
                        >
                            <el-option
                                    v-for="item in siteObjOptions"
                                    :key="item.id"
                                    :label="item.name"
                                    :value="item.id">
                            </el-option>
                        </el-select>
                    </el-form-item>
                </el-col>
            </el-row>

            <el-row class="object-item">
                <el-col :span="12">
                    <el-form-item label="实施对象" prop="activeObj.id">
                        <el-select v-model="form.activeObj.id"
                                   placeholder="领域对象"
                                   clearable
                                   filterable
                        >
                            <el-option
                                    v-for="item in activeObjOptions"
                                    :key="item.id"
                                    :label="item.name"
                                    :value="item.id">
                            </el-option>
                        </el-select>
                    </el-form-item>
                </el-col>
                <el-col :span="12">
                    <el-form-item label="承受对象" prop="passiveObj.id">
                        <el-select v-model="form.passiveObj.id"
                                   placeholder="领域对象"
                                   clearable
                                   filterable
                        >
                            <el-option
                                    v-for="item in passiveObjOptions"
                                    :key="item.id"
                                    :label="item.name"
                                    :value="item.id">
                            </el-option>
                        </el-select>
                    </el-form-item>
                </el-col>
            </el-row>
            <el-form-item label="行为属性" class="feature-setting" prop="newFeatureId">
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
            behavior: {
                type: Object,
                required: true
            },
            domainId: String,
        },
        data() {
            return {
                form: {
                    id: '',
                    activeObj:{
                        id: ''
                    },
                    passiveObj:{
                        id: ''
                    },
                    siteObj:{
                        id: ''
                    },
                    newFeatureId: []
                },
                rules: {
                    'activeObj.id': [
                        { required: true, message: '请选择实施对象', trigger: 'blur' },
                    ],
                    'passiveObj.id': [
                        { required: true, message: '请选择承受对像', trigger: 'blur' },
                    ]
                },
                featureTree: [],
                objectTree: {
                    tree: [],
                    activeObjRoot: [],
                    passiveObjRoot: []
                },
                dicMap: {
                    dataType: [],
                    dataBaseType: [],
                    dataLevel: [],
                }, // 字典数据
                isLoading: false
            };
        },
        computed: {
            siteObjOptions() {
                return treeUtil.treeToList(this.objectTree.tree);
            },
            activeObjOptions() {
                const vm = this;
                let {tree, activeObjRoot: root = []} = vm.objectTree;
                return vm.getSubTreeList(tree, root);
            },
            passiveObjOptions() {
                const vm = this;
                let {tree, passiveObjRoot: root = []} = vm.objectTree;
                return vm.getSubTreeList(tree, root);
            }
        },
        watch: {
            behavior: {
                handler() {
                    const vm = this;
                    vm.initData();
                },
                immediate: true
            }
        },
        methods: {
            async reqSave(params) {
                const vm = this;
                vm.isLoading = true;
                let {data} = await vm.$axios.post('behaviorAssociated  ', params).catch((error) => {
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
            async reqData(params) {
                const vm = this;
                let {data} = await vm.$axios.post('getBehaviorById', params).catch((error) => {
                    return {data: {msg: '服务器异常，请联系管理员'}};
                });
                if (data.code !== 200) {
                    vm.$message.error(data.msg || `查询领域对象特征列表异常`);
                }
                return data;
            },
            async initData() {
                const vm = this;
                vm.clearForm();
                let info = {};

                let { behavior, domainId } = vm;
                if (behavior && domainId) {
                    vm.isLoading = true;
                    let id = behavior.id;
                    let data = await vm.reqData({ domainId, id });
                    if (vm.behavior && vm.behavior.id === id) {
                        vm.isLoading = false;
                        if (data.code === 200) {
                            info = data.domainBehavior || {};
                        }
                    } else {
                        return null;
                    }
                }
                // 初始化表单
                vm.form.id = info.id || '';
                vm.form.activeObj.id = (info.activeObj && info.activeObj.id) || '';
                vm.form.passiveObj.id = (info.passiveObj && info.passiveObj.id) || '';
                vm.form.siteObj.id = (info.siteObj && info.siteObj.id) || '';
                vm.form.newFeatureId = [...(new Set((info.ownFeatureIdList || []).map(item => item.id)))]; // 去重

                // 初始化数据
                vm.featureTree = info.allFeatureIdList || [];
                vm.objectTree.tree = info.objList || [];
                vm.objectTree.activeObjRoot = info.activeObjList || [];
                vm.objectTree.passiveObjRoot = info.passiveObjList || [];
                return info;
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
            initDic() {
                const vm = this;
                vm.reqDic('getEnumDomainDataLevelType', 'dataLevel', '数据等级');
                vm.reqDic('getEnumDomainStandardType', 'dataType', '数据类型');
                vm.reqDic('getEnumDomainFeaturesValType', 'dataBaseType', '数据基础类型');
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
            handleClickCancel() {
                this.$emit('cancel')
            },
            handleClickSave() {
                const vm = this;
                vm.$refs['form'].validate(async (valid) => {
                    if (valid) {
                        let params = JSON.parse(JSON.stringify(vm.form));
                        let success = await vm.reqSave(params);
                        if (success) {
                            vm.$emit('saved', params);
                        }
                    }
                })
            },
            handleClosedFeatureDialog() {
                this.initData();
            },
            clearForm() {
                const vm = this;
                if (vm.$refs['form']) {
                    vm.$refs['form'].resetFields();
                }
                if (vm.$refs['transfer']) {
                    vm.$refs['transfer'].resetFields();
                }
            }
        },
        created() {
            this.initDic();
        },
        activated() {
            const vm = this;
            vm.initData();
        },
        components: {
            FeatureTransfer,
        }
    };
</script>
<style scoped lang="less">
    .relate-feature{
        max-height: calc(90vh - 170px);
        overflow: auto;
    }
    .object-item .el-form-item{
        margin-bottom: 10px;
    }
    /deep/ .el-transfer-panel {
        min-width: 200px;
        width: calc(50% - 33px);
    }
</style>