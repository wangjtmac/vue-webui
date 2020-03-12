 <!--
 领域图谱
 @Author: bjx
 @Date: 2019-12-19
-->
<template>
    <div class="graph-view">
        <el-form :inline="true" ref="form" :model="form" @submit.native.prevent>
            <el-form-item v-for="item in selectList"
                          :key="item.field"
                          :prop="item.field">
                <el-select v-model="form[item.field]"
                           :key="item.field"
                           :clearable="item.clearable"
                           :placeholder="item.placeholder"
                >
                    <el-option v-for="option in optionMap[item.options]"
                               :key="option.code"
                               :label="option.name"
                               :value="option.code">
                    </el-option>
                </el-select>
            </el-form-item>
            <el-form-item prop="name">
                <el-input v-model="form.name"
                          placeholder="特征项名称"
                          clearable
                          @keyup.native.enter="handleClickSearch"
                ></el-input>
            </el-form-item>
            <el-form-item>
                <el-button size="small"
                           @click="handleClickReset"
                >重置</el-button>
                <el-button type="primary"
                           size="small"
                           @click="updateGraphData"
                >查询</el-button>
            </el-form-item>
        </el-form>
        <div class="graph-chart" ref="graph"></div>
    </div>
</template>
<script>
    import echarts from 'echarts';

    import { getFeaturesGraph } from '@/projects/Knowledge/api/featureApi';

    export default {
        name: "GraphView",
        props: {
            domainId: String,
            catalog: Object,
        },
        data() {
            return {
                chartObj: null,
                options: {
                    animationDurationUpdate: 1500,
                    animationEasingUpdate: 'quinticInOut',
                    legend: {
                        x: "right",
                        show: true,
                        data: ['定类', '定序', '定距', '定比' ]
                    },
                    series: [{
                        type: 'graph',
                        layout: 'force',
                        symbolSize: 60,
                        focusNodeAdjacency: true,
                        roam: true,
                        draggable: true,
                        categories: [
                            {
                                name: '特征分类',
                                itemStyle: {
                                    color: "#01b3ee",
                                }
                            }, {
                                name: '定类',
                                itemStyle: {
                                    color: "#5da8ee",
                                }
                            }, {
                                name: '定序',
                                itemStyle: {
                                    color: "#82a7ee",
                                }
                            }, {
                                name: '定距',
                                itemStyle: {
                                    color: "#00c7ee",
                                }
                            }, {
                                name: '定比',
                                itemStyle: {
                                    color: "#0e84ff",
                                }
                            }
                        ],
                        label: {
                            show: true,
                            fontSize: 12,
                            formatter: '{c}'
                        },
                        force: {
                            repulsion: 1000
                        },
                        edgeSymbolSize: [4, 50],
                        edgeLabel: {
                            show: false,
                        },
                        lineStyle: {
                            opacity: 0.9,
                            width: 1,
                            curveness: 0
                        },
                        data: [/*{
                                name: '徐贱云',
                                value: '',
                                category: 0,
                            }*/],
                        links: [/*{
                                source: 0,
                                target: 1
                            }*/]
                    }]
                },
                form: {
                    dataType: '',
                    dataBaseType: '',
                    dataLevel: '',
                    name: ''
                },
                selectList: [
                    {
                        field: 'dataType',
                        placeholder: '数据类型',
                        clearable: true,
                        options: 'dataType'
                    }, {
                        field: 'dataBaseType',
                        placeholder: '数据基础类型',
                        clearable: true,
                        options: 'dataBaseType'
                    }, {
                        field: 'dataLevel',
                        placeholder: '数据等级',
                        clearable: true,
                        options: 'dataLevel'
                    }
                ],
                optionMap: {
                    dataType: [],
                    dataBaseType: [],
                    dataLevel: [],
                    featureType: [
                        { name: '动态类型', code: '0' },
                        { name: '静态类型', code: '1' },
                    ]
                },
            }
        },
        computed: {},
        watch: {
            domainId: {
                handler() {
                    this.handleClickReset();
                    this.updateGraphData();
                },
                immediate: true
            },
            catalog() {
                this.handleClickReset();
                this.updateGraphData();
            }
        },
        methods: {
            /**
             * 初始化图谱实例与配置与数据
             **/
            initChartObj() {
                const vm = this;
                vm.chartObj = echarts.init(vm.$refs.graph);
                vm.chartObj.setOption(vm.options);
                vm.updateGraphData();
            },
            async reqDic(url, field, name = '') {
                const vm = this;
                let {data} = await vm.$axios.get(url).catch((error) => {
                    return {data: {msg: '服务器异常，请联系管理员'}};
                });
                let list = [];
                if (data.code === 200) {
                    list = data.result || [];
                } else {
                    vm.$message.error(data.msg || `查询${ name }异常`);
                }
                vm.optionMap[field] = list;
            },
            initDic() {
                const vm = this;
                vm.reqDic('getEnumDomainDataLevelType', 'dataLevel', '数据等级');
                vm.reqDic('getEnumDomainStandardType', 'dataType', '数据类型');
                vm.reqDic('getEnumDomainFeaturesValType', 'dataBaseType', '数据基础类型');
            },
            /**
             * 更新数据
             **/
            async updateGraphData() {
                const vm = this;
                let { chartObj, domainId } = vm;
                let dataList = [];
                let linkList = [];

                if (chartObj === null) {
                    return false;
                }
                if (domainId) {
                    chartObj.showLoading();
                    const vm = this;
                    let {form, catalog, domainId} = vm;
                    let params = Object.assign({domainId},form);
                    if (catalog) {
                        params.id = catalog.id;
                    }
                    vm.isLoading = true;
                    let data = await getFeaturesGraph(params);
                    if (domainId === vm.domainId) {
                        chartObj.hideLoading();
                        ({dataList, linkList} = vm.formatterGraphData(data));
                    } else {
                        return false; // 参数失效
                    }

                } else {
                    chartObj.hideLoading();
                }

                chartObj.setOption({
                    series: [{
                        data: dataList,
                        links: linkList
                    }]
                });

                vm.resize();
            },

            /**
             * 格式化图谱数据
             **/
            formatterGraphData(data = {}) {
                let [dataList, linkList] = [[], []];
                if (data.code === 200) {
                    let { edgeList = [], nodeList = [] } = data.result;
                    dataList = nodeList.map(item => {
                        return {
                            name: item.id,
                            value: item.name,
                            category: `${item.type || '特征分类'}`.replace('等级', ''),
                        }
                    });
                    linkList = edgeList.map(item => {
                        return {
                            source: item.from,
                            target: item.to
                        }
                    });
                }

                return {
                    dataList,
                    linkList
                }
            },

            /**
             * 摧毁图谱
             */
            dispose() {
                const vm = this;
                vm.chartObj.dispose();
            },

            handleClickReset() {
                const vm = this;
                let { form: formVm } = vm.$refs
                formVm && formVm.resetFields();
            },

            resize() {
                const vm = this;
                if (vm.chartObj !== null) {
                    vm.chartObj.resize();
                }
            }
        },
        beforeDestroy() {
            this.dispose();
        },
        created() {
            this.initDic();
        },
        mounted() {
            const vm = this;
            vm.initChartObj();
        }

    };
</script>
<style scoped lang="less">
    .graph-view {
        height: 100%;
        .el-form{
            position: absolute;
            max-width: calc(100% - 250px);
            z-index: 1;
        }
        .graph-chart{
            height: 100%;
        }
    }
</style>