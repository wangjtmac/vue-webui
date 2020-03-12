<template>
  <div class="index">
    <Header :user="user" :sysName="sysName"/>
    <SideNav @navClick="navClick" :navs="navs" @slideNav="slideNav" />
    <!--右侧内容-->
    <div class="ce-main__cont" :style="{'margin-left':marginL}">
      <breadcrumb :crumb="crumb" />
      <div class="content-main bsb p10 ova">
        <router-view></router-view>
      </div>
    </div>
  </div>
</template>

<script>
    // @ is an alias to /src
    import Header from '@/components/layout/Header'
    import SideNav from '@/components/layout/SideNav'
    import Breadcrumb from "@/components/crumb/Breadcrumb";

    export default {
        name: 'Index',
        components: {
            Header,
            SideNav,
            Breadcrumb
        },
        data() {
            return {
                user: {
                    img_path: '',
                    name: 'admin'
                },
                crumb: [],
                sysName: '知识工程',
                navs: [
                    {
                        parent: '领域管理',
                        icon: '&#xe75d;',
                        arrow: false,
                        children: [],
                        path: '/knowledge/domain'
                    }, {
                        parent: '特征建模',
                        icon: '&#xe793;',
                        arrow: false,
                        children: [],
                        path: '/knowledge/feature'
                    }, {
                        parent: '领域建模',
                        icon: '&#xe72e;',
                        arrow: false,
                        children: [
                            {
                                child: '领域对象管理',
                                path: '/knowledge/object'
                            },
                            {
                                child: '领域关系管理',
                                path: '/knowledge/relation'
                            },
                            {
                                child: '领域行为管理',
                                path: '/knowledge/behavior'
                            },
                        ],
                    }, {
                        parent: '知识计算',
                        icon : '&#xe63e;',
                        arrow: false,
                        children: [
                            {
                                child: '离线库导入',
                                path: '/knowledge/process/database'
                            }, {
                                child: '离线规则计算',
                                path: '/knowledge/process/offlineRule'
                            }, {
                                child: '词条处理计算',
                                path: '/knowledge/process/entryHandle'
                            }
                        ]
                    }, {
                        parent: '配置管理',
                        icon : '&#xe63e;',
                        arrow: false,
                        children: [
                            {
                                child: '基础配置',
                                path: '/knowledge/setting/basic'
                            }
                        ]
                    }, {
                        parent: '语料管理',
                        icon : '&#xe63e;',
                        arrow: false,
                        children: [
                            {
                                child: '语料预处理',
                                path: '/knowledge/langMaterial/preTreatment'
                            }, {
                                child: '语料标注',
                                path: '/knowledge/langMaterial/mark'
                            }
                        ]
                    }
                ],
                marginL:200
            }
        },
        methods: {
            navClick(data) {
                this.crumb = data;
            },
            slideNav(val){
                this.marginL = val;
            }
        }
    }
</script>
<style scoped>
  .index {
    min-width: 1360px;
    position: relative;
  }
  .ce-main__cont {
    margin-left: 200px;
    height:calc(100vh - 50px);
    overflow: auto;
    background: #f8f8f8;
    transition: 500ms;
  }
  .content-main {
    height: calc(100% - 43px);
  }
</style>
<style>
  @import "../../../../public/css/element-adjust.css";
</style>
