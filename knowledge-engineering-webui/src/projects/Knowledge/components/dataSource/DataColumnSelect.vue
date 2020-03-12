<template>
    <el-select class="data-column-select"
               :value="loading ? '' : value"
               placeholder="字段名称"
               clearable
               filterable
               :loading="loading"
               v-on="$listeners"
    >
        <el-option
                v-for="item in filteredData"
                :title="item[props.code]"
                :key="item[props.value]"
                :label="item[props.label]"
                :value="item[props.value]">
        </el-option>
    </el-select>
</template>

<script>
    import {DataHouse} from '@/projects/Knowledge/api/dataSourceApi';

    export default {
        name: "DataColumnSelect",
        props: {
            value: {required: true},
            dataTableId: {
                default: ''
            },
            dataType: {
                default: ''
            },
            dataHouse: {
                type: DataHouse,
                required: true
            },
        },
        watch: {
            dataHouse: {
                handler() {
                    this.initData();
                },
                immediate: true
            },
            dataTableId() {
                this.initData();
            },
            loading(now) {
                this.$emit('loading', now);
            }
        },
        data() {
            return {
                loading: false,
                props: {
                    value: 'id',
                    label: 'name',
                    code:'code'
                },
                data: [],
                dataTypeList:[]
            }
        },
        computed: {
            filteredData() {
                const vm = this;
                let list = [];
                if (vm.dataType != '' && vm.dataType != null) {
                    let dataTypeList = vm.dataTypeList.filter((item, index, arr) => item.code == vm.dataType);
                    dataTypeList.forEach(function (value, index) {
                        vm.data.forEach(function (item, idx) {
                            if (item.dataTypeName.toUpperCase() === value.name) {
                                list.push(item)
                            }
                        });
                    })
                } else {
                    list= vm.data
                }
                return list;
            }
        },
        methods: {
            async initData() {
                const vm = this;
                let { dataHouse, dataTableId } = vm;
                let result = [];
                if (dataHouse !== null) {
                    vm.loading = true;
                    let  data=await dataHouse.getColumns(dataTableId);
                    if (dataTableId === vm.dataTableId && dataHouse === vm.dataHouse) {
                        vm.loading = false;
                        result = data.result || [];
                    }
                } else {
                    vm.loading = false;
                }
                vm.data = result;

                vm.$emit('dataLoaded', result);
                return result;
            },

            async reqDic() {
                const vm = this;
                let {data} = await vm.$axios.get("getDataType").catch((error) => {
                    return {data: {msg: '服务器异常，请联系管理员'}};
                });
                let list = [];
                if (data.code === 200) {
                    list = data.result || [];
                } else {
                    vm.$message.error(data.msg || `查询数据类型异常异常`);
                }
                vm.dataTypeList=list
            },

            getCurrent() {
                const vm = this;
                return vm.getItem(vm.value);
            },

            getItem(value) {
                const vm = this;
                let { data, props } = vm;

                return data.find(record => record[props.value] === value) || null;
            }
        },
        activated() {
            this.initData();
        },
        created() {
            this.reqDic();
        }
    }
</script>

<style scoped>

</style>