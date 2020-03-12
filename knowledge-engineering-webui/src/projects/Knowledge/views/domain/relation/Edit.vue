<!--
 领域编辑页，
 @Author: zhanbh
 @Date: 2019-10-19
-->
<template>
    <el-form class="domain-edit"
             ref="form"
             :model="form"
             :rules="rules"
             label-width="125px"
             @submit.native.prevent
             v-loading="isLoading"
    >
        <el-form-item label="关系类型" prop="name">
            <el-input v-model.trim="form.name"
                      placeholder="请输入关系类型"
                      maxlength="50"
                      show-word-limit
            ></el-input>
        </el-form-item>
        <el-form-item label="所属父级" prop="parentObjList">
            <el-select v-model="form.parentObjList"
                       placeholder="请选择所属父级"
                       multiple
                       clearable
                       filterable
            >
                <el-option
                        v-for="item in objectOptions"
                        :key="item.id"
                        :label="item.name"
                        :value="item.id">
                </el-option>
            </el-select>
        </el-form-item>
        <el-form-item class="edit-btns">
            <el-button size="small" @click.stop="handleClickCancel">取消</el-button>
            <el-button size="small" type="primary" @click.stop="handleClickSave">保存</el-button>
        </el-form-item>
    </el-form>
</template>
<script>
    export default {
        name: "RelationEdit",
        props: {
            data: Object,
            objectTree: Array,
            domainId: String
        },
        data() {
            this.isAdd = true; // 是否是新增
            return {
                form: {
                    id: '',
                    name: '',
                    parentObjList: [],
                    parentId: '', // 默认存放
                },
                rules: {
                    name: [
                        { required: true, message: '请输入关系类型', trigger: 'blur' },
                        { max: 50, message: '不能超过50个字符', trigger: 'blur' }
                    ],

                },
                isLoading: false
            };
        },
        computed: {
            objectOptions() { // 去掉自身及子节点 避免生成环
                let {objectTree, data} = this;

                // 拿出自身子树
                let selfTree = [];
                if (data) {
                    let undo = [...objectTree];
                    while (undo.length > 0) {
                        let item = undo.shift();
                        if (item && item.id === data.id) { // 找到自身
                            selfTree.push(item);
                            break;
                        } else if (item && item.children && item.children.length > 0){
                            undo.push(...item.children);
                        }
                    }
                }

                // 生成自身及子节点id集合
                let selfSet = new Set();
                while (selfTree.length > 0) {
                    let item = selfTree.shift();
                    selfSet.add(item.id);
                    if (item.children && item.children.length > 0) {
                        selfTree.push(...item.children);
                    }
                }

                // 生成可当父亲的列表
                let idSet = new Set();
                let result = [];
                let undo = [...objectTree];
                while (undo.length > 0) {
                    let item = undo.shift();
                    if (item && (!data || item.id !== data.id)) { // 非自身
                        if (item.children && item.children.length > 0 ) {
                            undo.unshift(...item.children);
                        }
                        if (!selfSet.has(item.id) && !idSet.has(item.id)) {
                            idSet.add(item.id);
                            result.push(item);
                        }
                    }
                }
                return result;
            }
        },
        watch: {
            data: {
                handler(data) {
                    this.initForm(data);
                },
                immediate: true
            }
        },
        methods: {
            async reqAdd(params) {
                const vm = this;
                vm.isLoading = true;
                let {data} = await vm.$axios.post('saveObjRelationType',params).catch((error) => {
                    return {data: {msg: '服务器异常，请联系管理员'}};
                });
                vm.isLoading = false;
                if (data.code === 200) {
                    return true;
                } else {
                    vm.$message.error(data.msg || '新增领域对象异常');
                    return false;
                }
            },
            async reqUpdate(params) {
                const vm = this;
                vm.isLoading = true;
                let {data} = await vm.$axios.post('updateRelationType',params).catch((error) => {
                    return {data: {msg: '服务器异常，请联系管理员'}};
                });
                vm.isLoading = false;
                if (data.code === 200) {
                    return true;
                } else {
                    vm.$message.error(data.msg || '修改领域对象异常');
                    return false;
                }
            },
            /**
             * 请求当前对象信息
             * @param id
             * @returns {Promise<*>}
             */
            async reqData(id) {
                const vm = this;
                vm.isLoading = true;
                let {data} = await vm.$axios.post('changeUpdateObj',{id}).catch((error) => {
                    return {data: {msg: '服务器异常，请联系管理员'}};
                });
                vm.isLoading = false;
                if (data.code === 200) {
                    return data.result;
                } else {
                    vm.$message.error(data.msg || '获取领域对象信息异常');
                    return {};
                }
            },
            async initForm(data) {
                const vm = this;
                if (vm.$refs['form']) {
                    vm.$refs['form'].clearValidate();
                }
                data = data || {};
                vm.isAdd = !data.hasOwnProperty('id');
                let result = {};
                if (!vm.isAdd) {
                    result = await vm.reqData(data.id);
                }
                Object.keys(vm.form).forEach(key => {
                    if (key === 'parentObjList') {
                        let values = result[key] || [];
                        vm.form[key] = [...new Set(values)]; // 去重
                    } else {
                        let value = result[key] || '';
                        vm.form[key] = value;
                    }
                });
            },
            handleClickSave() {
                const vm = this;
                vm.$refs['form'].validate(async (valid) => {
                    if (valid) {
                        let params = Object.assign({domainId: vm.domainId}, vm.form);
                       /* if (`${params.isCreatInstanceTable}` === '0' && params.parentObjList.length === 1) {
                            params.parentId = params.parentObjList[0];
                        } else if (`${params.isCreatInstanceTable}` === '1') {
                            params.parentId = '';
                        }*/
                        let success = false;
                        if (vm.isAdd) {
                            success = await vm.reqAdd(params);
                        } else {
                            success = await vm.reqUpdate(params)
                        }
                        if (success) {
                            vm.$emit('saved', params);
                        }
                    }
                });
            },
            handleClickCancel() {
                this.$emit('cancel');
            },
            clearForm() {
                const vm = this;
                if (vm.$refs['form']) {
                    vm.$refs['form'].resetFields();
                }
            }
        },
        created() {
        }
    };
</script>
<style scoped lang="less">
    .el-form {
        max-width: 460px;
    }
    .el-cascader{
        display: initial;
    }
    .edit-btns {
        text-align: right;
    }
</style>