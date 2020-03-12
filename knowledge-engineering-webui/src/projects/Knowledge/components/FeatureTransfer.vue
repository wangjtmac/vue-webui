<!--
 特征项穿梭框  左侧一定是树
 配置项参考风谷的穿梭框

 children 与 pid 暂时是固定的，后期需要的话可改为可配置

 @params isMultiFilter 是否启用多条件查询
 @params dicMap 查询条件的字段map 后期需要去除
 @params showAddLink 是否展示新建特征按钮

 @method resetFields 重置搜索框
 @method doTreeFilter(keyword) 对特征项进行搜索

 @ref form 搜索表单
 @ref transfer 穿梭框

 @Author: zhanbh
 @Date: 2019-11-07
-->
<template>
    <div class="feature-transfer">
        <el-button type="text" v-if="showAddLink" @click="handleClickCreateFeature">新建特征</el-button>
        <el-form v-if="isMultiFilter"
                 class="ovh mb5"
                 ref="form"
                 :model="form"
                 :show-message="false"
                 @submit.native.prevent
        >
            <el-row :gutter="20">
                <el-col :span="12">
                    <el-form-item prop="dataLevel">
                        <el-select v-model="form.dataLevel"
                                   filterable
                                   clearable
                                   multiple
                                   collapse-tags
                                   placeholder="数据等级"
                        >
                            <el-option
                                    v-for="item in dicMap.dataLevel"
                                    :key="item.code"
                                    :label="item.name"
                                    :value="item.code">
                            </el-option>
                        </el-select>
                    </el-form-item>
                </el-col>
                <el-col :span="12">
                    <el-form-item prop="dataBaseType">
                        <el-select v-model="form.dataBaseType"
                                   filterable
                                   multiple
                                   clearable
                                   collapse-tags
                                   placeholder="数据基础类型"
                        >
                            <el-option
                                    v-for="item in dicMap.dataBaseType"
                                    :key="item.code"
                                    :label="item.name"
                                    :value="item.code">
                            </el-option>
                        </el-select>
                    </el-form-item>
                </el-col>
            </el-row>
            <el-row :gutter="20">
                <el-col :span="12">
                    <el-form-item prop="dataType">
                        <el-select v-model="form.dataType"
                                   filterable
                                   clearable
                                   multiple
                                   collapse-tags
                                   placeholder="数据类型"
                        >
                            <el-option
                                    v-for="item in dicMap.dataType"
                                    :key="item.code"
                                    :label="item.name"
                                    :value="item.code">
                            </el-option>
                        </el-select>
                    </el-form-item>
                </el-col>
                <el-col :span="12">
                    <el-form-item prop="name">
                        <el-input v-model="form.name" placeholder="特征分类或特征项"></el-input>
                    </el-form-item>
                </el-col>
            </el-row>
        </el-form>
        <dg-transfer v-bind="mergedAttrs"
                     :data="tree"
                     :value="value"
                     :key="treeVersion"
                     v-on="$listeners"
                     ref="transfer"
        ></dg-transfer>
        <el-dialog
                v-if="showAddLink"
                title="特征建模"
                :visible.sync="dialogVisible"
                :close-on-click-modal="false"
                top="10vh"
                append-to-body
                width="90%"
                @closed="handleClosedFeatureDialog"
        >
            <transition name="el-fade-in-linear">
                <keep-alive>
                    <feature class="feature-dialog" v-if="dialogVisible"></feature>
                </keep-alive>
            </transition>
        </el-dialog>
    </div>
</template>
<script>
    import DgTransfer from 'ui-component-v4/lib/transfer'
    import Feature from '../views/feature'

    const defaultProps = {
        'label-name': 'name',
        'value-name': 'id',
        'titles': ['全部', '已选'],
        'accept': 'list'
    }

    export default {
        name: "FeatureTransfer",
        inheritAttrs: false,
        props: {

            // 是否启用多条件搜索
            isMultiFilter: {
                type: Boolean,
                default: true
            },

            // 是否展示新建特征按钮
            showAddLink: {
                type: Boolean,
                default: true
            },

            // 选项配置数据
            data: {
                type: Array,
                default() {
                    return [];
                }
            },

            value: {
                type: Array,
                default() {
                    return [];
                }
            },

            // 字典，后期要移除掉
            dicMap: {
                type: Object,
                default() {
                    return {}
                }
            }
        },
        data() {
            return {
                form: {
                    dataBaseType: [],
                    dataLevel: [],
                    dataType: [],
                    name: ''
                },
                tree: [],
                nodeMap: new Map(),
                treeVersion: 0, // 穿梭框对data不会响应，加版本作为key
                dialogVisible: false
            };
        },
        computed: {
            mergedAttrs() {
                const vm = this;
                return Object.assign({ 'filter-node-from': vm.treeFilterMethod}, defaultProps, vm.$attrs, { type: 'tree' });
            }
        },
        watch: {
            data(tree) {
                const vm = this;
                vm.resetFields();
                vm.tree = vm.filterEmptyClassify(tree);
                vm.nodeMap = vm.geneNodeMap(tree);
                vm.treeVersion++;
            },
            isMultiFilter() {
                this.resetFields();
            },
            form: {
                handler() {
                    this.doTreeFilter();
                },
                deep: true
            },
            value: {
                handler() {
                    this.doTreeFilter();
                },
                deep: true
            }
        },
        methods: {
            filterEmptyClassify(tree) {
                let undone = [tree || []];
                while (undone.length > 0) {
                    let list = undone.pop();
                    for (let i = 0; i < list.length; i++) {
                        let item = list[i];
                        let children = item.children || [];
                        if (children.length > 0) {
                            // 有儿子，都认为是分类
                            item.featuresClassify = true;
                        }
                        if (item.featuresClassify && children.length === 0) {
                            list.splice(i, 1);
                            i--;
                        } else if(children.length !== 0){
                            undone.push(children);
                        }
                    }
                }
                return tree;
            },
            geneNodeMap(tree) {
                let list = Array.from(tree || []);
                let map = new Map();
                let undone = [...list];
                let key = defaultProps['value-name'];
                while (undone.length > 0) {
                    let item = undone.shift();
                    if (item && item[key]) {
                        map.set(item[key], item);
                    }
                    if (item && item.children && item.children.length > 0) {
                        undone.push(...item.children);
                    }
                }
                return map;
            },
            treeFilterMethod(value = '', data) {
                value = `${value || ''}`.trim();
                // 特征分类都设置不展示  只作为特征项父级带出
                if (data.featuresClassify) {
                    return false;
                }
                const vm = this;
                let isShow = true;
                const { form } = vm;
                Object.keys(form).forEach(key => {
                    if (!isShow) {
                        return false;
                    }
                    if (key !== 'name') { // 下来框
                        let types =  form[key];
                        isShow = types.length === 0 || types.includes(data[key]);
                    } else { // 关键字的
                        let keyword = form[key].trim();
                        if (value || keyword){
                            if (value === keyword) {
                                value = '';
                            }
                            let keys = [];
                            value && keys.push(value);
                            keyword && keys.push(keyword);
                            let name = defaultProps['label-name'];
                            let { nodeMap } = vm;
                            keys.forEach(word => {
                                if (!isShow) {
                                    return false;
                                }
                                let pathNode = data;
                                let match = false;
                                while (!match && pathNode) {
                                    match = pathNode[name].indexOf(word) !== -1 ;
                                    if (!match) { // 自身没命中，查找父级分类
                                        pathNode = nodeMap.get(pathNode.pid);
                                    }
                                }
                                isShow = match;
                            })
                        }
                    }
                })
                return isShow;
            },
            handleClickCreateFeature() {
                this.dialogVisible = true;
            },
            handleClosedFeatureDialog() {
                this.$emit('closed-dialog');
            },
            doTreeFilter(val) {
                const vm = this;
                if (vm.$refs.transfer) {
                    vm.$refs.transfer.$children[0].$refs['from-tree'].$nextTick(() => {
                        vm.$refs.transfer.$children[0].$refs['from-tree'].filter(val);
                    })
                }
            },
            resetFields() {
                const vm = this;
                if (vm.$refs.form) {
                    vm.$refs.form.resetFields();
                }
            },
            getCheckedData() {
                const {value, nodeMap} = this;
                let result = [];
                value.forEach(id => {
                    let item = nodeMap.get(id);
                    if (item) {
                        result.push(item);
                    }
                })
                return result;
            }
        },
        created() {
        },
        components: {
            DgTransfer,
            Feature
        }
    };
</script>
<style scoped>
    .el-form-item {
        margin-bottom: 10px;
    }
    /deep/ .el-transfer__buttons{
        padding: 0 15px;
    }
    .feature-dialog{
        height: calc(90vh - 170px);
    }
    /deep/ .el-tree{
        display: inline-block;
        min-width: 100%;
    }
</style>