<!--
 领域图谱
 @Author: zhanbh
 @Date: 2019-12-19
-->
<template>
    <div class="graph-view"></div>
</template>
<script>
    import echarts from 'echarts';

    import { getDomainGraph } from '@/projects/Knowledge/api/domainApi';

    export default {
        name: "GraphView",
        props: {
            domain: Object
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
                        data: ['领域对象', '对象特征', '领域行为', '领域关系' ]
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
                                    name: '领域',
                                    itemStyle: {
                                        color: "#409ccc",
                                    },
                                    symbolSize: 100,
                                }, {
                                    name: '领域对象',
                                    itemStyle: {
                                        color: "#409eff",
                                    }
                                }, {
                                    name: '对象特征',
                                    itemStyle: {
                                        color: "#01b3ee",
                                    }
                                }, {
                                    name: '领域行为',
                                    itemStyle: {
                                        color: "#91abee",
                                    }
                                }, {
                                    name: '领域关系',
                                    itemStyle: {
                                        color: "#39b7b2",
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
            }
        },
        computed: {},
        watch: {
            domain() {
                this.updateGraphData();
            }
        },
        methods: {

            /**
             * 初始化图谱实例与配置与数据
             **/
            initChartObj() {
                const vm = this;
                vm.chartObj = echarts.init(vm.$el);
                vm.chartObj.setOption(vm.options);
                vm.updateGraphData();
            },

            /**
             * 更新数据
             **/
            async updateGraphData() {
                const vm = this;
                let { chartObj, domain } = vm;
                let dataList = [];
                let linkList = [];

                if (chartObj === null) {
                    return false;
                }

                if (domain && domain.id) {
                    chartObj.showLoading();
                    let data = await getDomainGraph(domain.id);

                    if (domain === vm.domain) {
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
        beforeDestroy() {
            this.dispose();
        },
        mounted() {
            const vm = this;
            vm.initChartObj();
        }
    };
</script>
<style scoped>
    .graph-view {
        height: 100%;
    }
</style>