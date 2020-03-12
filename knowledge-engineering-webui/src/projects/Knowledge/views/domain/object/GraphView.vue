<!--
 领域图谱
 @Author: zhanbh
 @Date: 2019-12-19
-->
<template>
    <div class="graph-view">
        <div class="form">
        <el-form :inline="true" ref="form" :model="form" class="fl" @submit.native.prevent>
            <el-form-item v-for="item in selectList"
                          :key="item.field"
                          :prop="item.field">
                <el-select v-model="form[item.field]"
                           :key="item.field"
                           filterable
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
            <el-form-item>
                <el-input v-model.trim="form.key"
                          placeholder="特征"
                          clearable
                          @keyup.native.enter="handleClickSearch"
                ></el-input>
            </el-form-item>
            <el-form-item class="search-btn">
                <el-button type="primary"
                           size="small"
                           @click="handleClickSearch"
                >查询</el-button>
            </el-form-item>
        </el-form>
        </div>
        <div class="graph-chart" ref="graph"></div>
    </div>

</template>
<script>
    import echarts from 'echarts';

    import { getDomainObjGraph } from '@/projects/Knowledge/api/domainObjectApi';

    export default {
        name: "ObjectFeatureGraphView",
        props: {
            domainId: String,
            object: Object,
        },
        data() {
            return {
                form: {
                    standardType: '',
                    featuresValType: '',
                    dataLevelType: '',
                    key: ''
                },
                selectList: [
                    {
                        field: 'dataLevelType',
                        placeholder: '数据等级',
                        clearable: true,
                        options: 'dataLevel'
                    },
                    {
                        field: 'standardType',
                        placeholder: '数据类型',
                        clearable: true,
                        options: 'dataType'
                    },
                    {
                        field: 'featuresValType',
                        placeholder: '数据基础类型',
                        clearable: true,
                        options: 'dataBaseType'
                    }
                ],
                optionMap: {
                    dataType: [],
                    dataBaseType: [],
                    dataLevel: [],
                    statusType: []
                },
                chartObj: null,
                options: {
                    animationDurationUpdate: 1500,
                    animationEasingUpdate: 'quinticInOut',
                    legend: {
                        x: "right",
                        show: true,
                        top: '50',
                        data: ['定类等级', '定序等级', '定距等级', '定比等级' ]
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
                                name: '定比等级',
                                itemStyle: {
                                    normal: {
                                        color: "#4592FF",
                                    }
                                }
                            },
                            {
                                name: '领域对象',
                                itemStyle: {
                                    normal: {
                                        color: "#459200",
                                    }
                                }
                            }, {
                                name: '定类等级',
                                itemStyle: {
                                    normal: {
                                        color: "#afa3f5",
                                    }
                                }
                            }, {
                                name: '定序等级',
                                itemStyle: {
                                    normal: {
                                        color: "#00d488",
                                    }
                                }
                            }, {
                                name: '定距等级',
                                itemStyle: {
                                    normal: {
                                        color: "#f1bb4c",
                                    }
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
                        data: [],
                        links: []
                    }]
                },
            }
        },
        computed: {},
        watch: {
            domainId: {
                handler() {
                    this.updateGraphData();
                },
                immediate: true
            },
            object() {
                this.updateGraphData();
            }
        },
        methods: {
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
             * 初始化图谱实例与配置与数据
             **/
            initChartObj() {
                const vm = this;
                vm.chartObj = echarts.init(vm.$refs.graph);
                vm.chartObj.setOption(vm.options);
                vm.updateGraphData();
            },
            handleClickSearch() {
                this.updateGraphData();
            },

            /**
             * 更新数据
             **/
            async updateGraphData() {
                const vm = this;
                let { object,chartObj, domainId } = vm;
                let dataList = [];
                let linkList = [];

                if (chartObj === null) {
                    return false;
                }

                if (domainId) {
                    chartObj.showLoading();
                    let params = {
                        domainId:domainId
                    };
                    if (object) {
                        params.objModelId = object.id;
                    }
                    params.conditionVo = Object.assign({}, vm.form);
                    let data = await getDomainObjGraph(params);

                    chartObj.hideLoading();
                    ({dataList, linkList} = vm.formatterGraphData(data));


                } else {
                    chartObj.hideLoading();
                }

                chartObj.setOption({
                    series: [{
                        data: dataList,
                        links: linkList
                    }]
                });

                chartObj.resize();
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
                            category: item.type,
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
                this.chartObj.dispose();
            }
        },
        created() {
            this.initDic();
        },
        activated(){
            this.chartObj.resize();
        },
        beforeDestroy() {
            this.dispose();
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
        .form{
            position: absolute;
            z-index: 1;
        }
        .graph-chart{
            height: 100%;
        }
    }
</style>