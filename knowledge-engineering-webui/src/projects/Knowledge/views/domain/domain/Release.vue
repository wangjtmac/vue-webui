<!--
 领域发布页，
 @Author: zhanbh
 @Date: 2019-10-19
-->
<template>
    <el-form class="domain-release"
             ref="form"
             :model="form"
             :rules="rules"
             label-width="125px"
             @submit.native.prevent
             v-loading="isLoading"
    >
        <el-form-item label="发布地址" prop="releaseUri">
            <el-input v-model="form.releaseUri"
                      placeholder="请输入发布地址"
                      show-word-limit
            ></el-input>
        </el-form-item>
        <el-form-item class="edit-btns">
            <el-button size="small" @click.stop="handleClickCancel">取消</el-button>
            <el-button size="small" type="primary" @click.stop="handleClickSave">发布</el-button>
        </el-form-item>
    </el-form>
</template>
<script>
    export default {
        name: "DomainRelease",
        props: {
            'data': Object
        },
        data() {
            return {
                form: {
                    id:'',
                    releaseUri: '',
                },
                rules: {
                    name: [
                        { required: true, message: '请输入发布地址', trigger: 'blur' }
                    ],

                },
                isLoading: false
            };
        },
        computed: {

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
            reqRelease() {
                const vm = this;
                let { form} = vm;
                let params =form;
                vm.isLoading = true;
                vm.$axios.post('release',params).then(({data}) => {
                    if (data.code === 200) {
                       form.releaseUri='';
                        vm.$emit('saved', params);
                        vm.$message.success('已发布');
                    } else {
                        vm.$message.error('发布异常');
                    }
                }).catch((error) => {
                    vm.$message.error('服务器异常，请联系管理员');
                }).then(() => {
                    vm.isLoading = false;
                });
            },
            handleClickSave() {
                const vm = this;
                vm.$refs['form'].validate(async (valid) => {
                    if (valid) {
                        let params = Object.assign(vm.form);
                        let success = await vm.reqRelease(params);
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
                let {form} = vm;
                for (let key in form) {
                    form[key] = '';
                }
                if (vm.$refs['form']) {
                    vm.$refs['form'].clearValidate();
                }
            },
            initForm(data) {
                const vm = this;
                let form = vm.form;
                data = data || {};
                Object.keys(form).forEach(key => {
                    form[key] = data[key] || '';
                })
            },
        },
        created() {
            this.initForm(this.data);
        },
        activated(){
            this.initForm(this.data);
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