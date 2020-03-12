<template>
    <!--左侧导航-->
    <div class="sideNav" ref="sideNav">
        <ul class="selectn" ref="max_nav">
            <div v-for="(nav , index) in navs" :key="index">
                <li class="ce-side__nav" v-if="nav.children.length" :title="nav.parent" @click="navTab($event)">
                    <div class="ce-nav__tap">
                        <em class="icon ce-nav__icon" v-html="nav.icon"></em>
                        <div class="ce-nav__name">{{nav.parent}}</div>
                        <i class="icon ce-nav__arrow" v-show="nav.children" v-html="nav.arrow ? arrow_up : arrow_down">&#xe872;</i>
                    </div>
                </li>

                <li class="ce-side__nav" v-else :title="nav.parent" @click="navTab($event,'',nav)">
                    <router-link :to="nav.path"  active-class="active">
                        <div class="ce-nav__tap" >
                            <em class="icon ce-nav__icon" v-html="nav.icon"></em>
                            <div class="ce-nav__name">{{nav.parent}}</div>
                            <i class="icon ce-nav__arrow" v-show="nav.children.length"
                               v-html="nav.arrow ? arrow_up : arrow_down">&#xe872;</i>
                        </div>
                    </router-link>
                </li>

                <ul class="dn ovh ce-nav__ul" v-show="nav.children.length">
                    <router-link v-for="(item , inx) in nav.children" :key="inx" :to="item.path" active-class="active">
                        <li class="ce-nav__child" id="item.child" :title="item.child" @click="getCrumb($event)">
                            {{item.child}}
                        </li>
                    </router-link>
                </ul>
            </div>
        </ul>
        <div class="ce-side__arrow" :class="{'ce-side__arrowF':navHide}" @click="slideNav"></div>
    </div>
</template>

<script>
    import $ from 'jquery'

    export default {
        name: "SideNav",
        data() {
            return {
                arrow_up: '&#xe872;',
                arrow_down: '&#xe871;',
                navHide : false
            }
        },
        props: {
            navs: Array
        },
        methods: {
            navTab(e, i ,node) {
                let nav = e.currentTarget || $(this.$refs.max_nav).children('div').eq(i).children('.ce-side__nav')[0],
                    $thisNav = $(nav),
                    inx = $thisNav.parent().index(),
                    childT = $thisNav.next('ul'),
                    siblingsC = $thisNav.parent().siblings().find('ul');
                if (!childT.is(':animated')) {
                    let isShow = !childT.is(':visible');
                    siblingsC.slideUp(500);
                    childT.css({'height': `calc(100vh - 50px - ${this.childNavH()}px)`}).slideToggle(500);
                    this.navArrowChange(inx, isShow);
                }
                if(node) this.$emit('navClick',[node.parent]);
            },
            childNavH() {
                let $nav = $(this.$refs.max_nav).children('div'),
                    len = $nav.length,
                    navH = $nav.children('.ce-side__nav').outerHeight() + 1,
                    childH = navH * len;
                return childH;
            },
            navArrowChange(inx, isShow) {
                this.navs.forEach((nav, i) => {
                    if (i === inx && isShow) {
                        nav.arrow = true;
                    } else {
                        nav.arrow = false;
                    }
                })
            },
            getCrumb(e, n, m) {
                let navTxt = e ? $(e.currentTarget).text() :
                    !isNaN(m) ? this.navs[n].children[m].child : '' ,
                    parTxt = e ? $(e.currentTarget).parents('.ce-nav__ul').prev('.ce-side__nav').attr('title') :
                        this.navs[n].parent;
                navTxt ?
                    this.$emit('navClick', [parTxt , navTxt]):
                    this.$emit('navClick', [parTxt]);
            },
            slideNav(){
                if(this.navHide){
                    $('.sideNav').css('left',0);
                    this.navHide = false;
                    this.$emit('slideNav', '200px');
                }else {
                    $('.sideNav').css('left',-200);
                    this.navHide = true;
                    this.$emit('slideNav',0);
                }
            },
            reLoadCrumb(){
                let inx , cInx ;
                if($('.router-link-exact-active').parent().hasClass('ce-nav__ul')){
                    inx = $('.router-link-exact-active').parent().parent().index();
                    cInx = $('.router-link-exact-active').index();
                }else {
                    inx = $('.router-link-exact-active').parent().parent().index();
                }
                this.navTab('', inx);
                this.getCrumb('', inx, cInx);
            }
        },
        created() {
            //this.getCrumb('', '0', '0');
        },
        mounted() {
          this.reLoadCrumb();
        }
    }
</script>

<style scoped lang="less">
    @import "../../../public/css/global";

    .sideNav {
        position: absolute;
        left: 0;
        top: 50px;
        height: calc(100vh - 50px);
        width: 200px;
        background: #083755;
        transition: 500ms;
    }

    .ce-sideNav__min {
        width: 50px;
    }

    .ce-side__nav {
        background-color: #0f476a;
        margin-bottom: 1px;
        cursor: pointer;
    }

    .ce-nav__tap {
        padding-left: 10px;
        font-size: 16px;
        line-height: 40px;
        color: #fff;
        display: block;
        overflow: hidden;
    }

    .ce-nav__icon {
        float: left;
        font-size: 18px;
        padding-right: 12px;
    }

    .ce-nav__name {
        float: left;
        width: calc(100% - 70px);
        overflow: hidden;
        text-overflow: ellipsis;
        word-break: keep-all;
        white-space: nowrap;
    }

    .ce-nav__arrow {
        padding: 0 12px;
        float: right;
        font-size: 14px;
        color: @bg-color;
    }

    .ce-nav__child {
        margin-bottom: 1px;
        cursor: pointer;
        overflow: hidden;
        text-overflow: ellipsis;
        word-break: keep-all;
        white-space: nowrap;
        color: #fff;
        opacity: 0.9;
        font-size: 14px;
        line-height: 38px;
        height: 38px;
        padding-left: 46px;
    }

    .ce-nav__ul > .active > li,
    .ce-nav__child:hover {
        background-color: @bg-color;
    }
    .ce-side__nav > .active > .ce-nav__tap {
        background-color: @bg-color;
    }
    .ce-side__arrow {
        cursor: pointer;
        position: absolute;
        right: -10px;
        top: 50%;
        margin-top: -30px;
        z-index: 20;
        width: 10px;
        height: 60px;
        background: url(../../assets/images/header/contract_arrow1.png) no-repeat;
    }

    .ce-side__arrowF {
        background: url(../../assets/images/header/contract_arrow0.png) no-repeat;
    }

</style>