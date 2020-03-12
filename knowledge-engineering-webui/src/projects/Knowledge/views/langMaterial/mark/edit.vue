<!--
 语料预处理编辑页，
 @Author: zhanbh
 @Date: 2019-10-19
-->
<template>
    <div class="mark-edit">
        <el-steps class="mb20" ref="step" :active="step" finish-status="success">
            <el-step title="基础配置"></el-step>
            <el-step title="语料选择"></el-step>
            <el-step title="自动标注"></el-step>
        </el-steps>
        <keep-alive>
            <base-setting v-if="step === 0" ref="baseSetting" :data-house="dataHouse"></base-setting>
            <material-pick v-else-if="step === 1" ref="materialPick"  :data-house="dataHouse">></material-pick>
        </keep-alive>
        <div class="edit-btns">
            <el-button v-if="step !== 0" size="small" type="primary" @click.stop="handleClickBack">上一步</el-button>
            <el-button v-if="step !== 2" size="small" type="primary" @click.stop="handleClickNext">下一步</el-button>
            <el-button v-if="step !== 2" size="small" @click.stop="handleClickCancel">取消</el-button>
            <el-button v-if="step === 2" size="small" type="primary" @click.stop="handleClickSave">保存</el-button>
            <el-button v-if="step === 2" size="small" type="primary" @click.stop="handleClickSaveAndMark">保存并自动标注</el-button>
        </div>
    </div>
</template>
<script>
    import { DataHouse } from '@/projects/Knowledge/api/dataSourceApi';
    import BaseSetting from './components/BaseSetting'
    import MaterialPick from './components/MaterialPick'

    export default {
        name: "markEdit",
        props: {
            data: Object,
        },
        data() {
            return {
                dataHouse: new DataHouse(),
                step: 0
            };
        },
        computed:{
            isAdd() {
                let {data} = this;
                return !data || (!data.id && data.id !== 0);
            },
        },
        watch: {
            data: {
                handler(data) {
                },
                immediate: true
            }
        },
        methods: {
            saveBaseSetting() {
                const vm = this;

                let settingVm = vm.$refs.baseSetting;
                settingVm.validate(async (valid) => {
                    //if (valid) {
                        vm.step = 1;
                        vm.$refs.step.$el.scrollIntoView();
                    //}
                });
            },
            saveMaterialPick() {
                const vm = this;
                vm.step = 2;
                vm.$refs.step.$el.scrollIntoView();
            },
            handleClickBack() {
               this.step--;
               vm.$refs.step.$el.scrollIntoView();
            },
            handleClickNext() {
                const vm = this;

                if (vm.step === 0) {
                    vm.saveBaseSetting();
                } else {
                    vm.saveMaterialPick();
                }
            },
            handleClickCancel() {
                this.$emit('cancel');
            },
            handleClickSave() {

            },
            handleClickSaveAndMark() {

            }
        },
        created() {
        },
        activated() {
        },
        components: {
            BaseSetting,
            MaterialPick
        }
    };
</script>
<style scoped lang="less">
    .base-setting,
    .material-pick{
        width: 500px;
        margin: auto;
    }
    .edit-btns {
        text-align: right;
    }
</style>