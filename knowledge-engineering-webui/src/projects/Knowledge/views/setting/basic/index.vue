<!--
 基础配置页
 @Author: zhanbh
 @Date: 2020-02-06
-->
<template>
    <div class="basic-setting">
        <el-card shadow="never">
            <span slot="header" class="f14">
                词典管理配置
            </span>
            <div class="word__config">
                <div v-loading="store.dataLoading || store.tableLoading"
                     class="word__store">
                    <span class="dib f14 mb10">词典存储配置：</span>
                    <i v-if="!store.editable"
                       class="ce_link f16 el-icon-edit-outline"
                       title="编辑"
                       @click.stop="handleClickEditStore"
                    ></i>
                    <template v-else>
                        <i class="ce_link f16 el-icon-circle-check mr5"
                           title="保存"
                           @click.stop="handleClickSaveStore"
                        ></i>
                        <i class="ce_link f16 el-icon-circle-close "
                           title="取消"
                           @click.stop="handleClickCancelStore"
                        ></i>
                    </template>
                    <table-config ref="storeConfig"
                                  :editable="store.editable"
                                  :data-house="dataHouse"
                                  :data="store.data"
                                  @loading="store.tableLoading = $event">
                    </table-config>
                </div>
                <div class="word__line"></div>
                <div class="word__type" v-loading="type.listLoading || type.domainLoading">
                    <span class="dib f14 mb10">词典类型配置：</span>
                    <i v-if="!type.editable"
                       class="ce_link f16 el-icon-edit-outline"
                       title="编辑"
                       @click.stop="handleClickEditType"
                    ></i>
                    <template v-else>
                        <i class="ce_link f16 el-icon-circle-check mr5"
                           title="保存"
                           @click.stop="handleClickSaveType"
                        ></i>
                        <i class="ce_link f16 el-icon-circle-close "
                           title="取消"
                           @click.stop="handleClickCancelType"
                        ></i>
                    </template>
                    <word-type-config ref="typeConfig"
                                      :editable="type.editable"
                                      :data="type.list"
                                      @loading="type.domainLoading = $event">
                    </word-type-config>
                </div>
            </div>
        </el-card>
    </div>
</template>
<script>
    import { DataHouse } from '@/projects/Knowledge/api/dataSourceApi';

    import TableConfig from './components/TableConfig'
    import WordTypeConfig from './components/WordTypeConfig'

    export default {
        name: "basic-setting",
        props: {},
        data() {
            return {
                store: {
                    editable: false,
                    data: {},
                    tableLoading: false,
                    dataLoading: false
                },
                type: {
                    editable: false,
                    list: [],
                    domainLoading: false,
                    listLoading: false
                },
                dataHouse: new DataHouse()
            };
        },
        computed: {},
        methods: {
            handleClickEditStore() {
                const vm = this;
                let { store } = vm;

                store.editable = true;
            },
            handleClickSaveStore() {
                const vm = this;
                let storeVm = vm.$refs.storeConfig;
                storeVm.validate(valid => {
                    if (valid) {
                        store.editable = false;
                    }
                });
            },
            handleClickCancelStore() {
                const vm = this;
                let { store } = vm;

                store.editable = false;
            },
            handleClickEditType() {
                const vm = this;
                let { type } = vm;

                type.editable = true;
            },
            handleClickSaveType() {
                const vm = this;
                let typeVm = vm.$refs.typeConfig;
                typeVm.validate(valid => {
                    if (valid) {
                        type.editable = false;
                    }
                });
            },
            handleClickCancelType() {
                const vm = this;
                let { type } = vm;

                type.editable = false;
            },
        },
        created() {
        },
        components: {
            TableConfig,
            WordTypeConfig
        }
    };
</script>
<style scoped lang="less">
    .basic-setting {
        display: flex;
        flex-direction: column;
        height: 100%;
        box-sizing: border-box;

        .el-card{
            flex-grow: 1;
            flex-shrink: 0;
            .word__config{
                display: flex;

                .word__store,.word__type{
                    flex-grow: 1;
                    width: 50%;
                }
                .word__line{
                    width: 1px;
                    margin: 0 15px;
                    background-color: #EBEEF5;
                }
            }
        }
    }
</style>