<template>
    <div class="contextmenu-wrap" v-show="status" :style="style">
        <ContextMenu :icon="icon" :menu="menu" :resolve="resolve"></ContextMenu>
    </div>
</template>

<script>
    import ContextMenu from './ContextMenu';
    import $ from 'jquery'
    export default {
        name: 'contextmenu-wrap',
        props: {
            customEvent: {
                type: Object
            },
            icon: {
                // 是否显示icon
                type: Boolean,
                default: true
            },
            axis: {
                // 鼠标右键点击的位置
                type: Object,
                default() {
                    return {x: null, y: null};
                }
            },
            menu: {
                // 最重要的列表，没有的话直接不显示
                type: Array,
                default() {
                    return [ ];
                }
            },
            resolve: {
                // 点击menu按钮时执行的方法
                type: Function,
                default: function () {
                }
            }
            // reject: { // 不点击按钮点击其他地方关闭时执行的方法 .catch(e => {})
            //   type: Function,
            //   default: function() {}
            // }
        },
        computed: {
            style() {
                let x = this.axis.x;
                let y = this.axis.y;
                let menuH = 24;
                // 判断menu距离浏览器可视窗口底部距离,以免距离底部太近的时候，会导致menu被遮挡
                let menuHeight = this.menu.length * menuH; // 不能用scrollHeight,获取到的menu是上一次的menu宽高
                let menuWidth = 150; // 不能用scrollWidth,同理
                return {
                    left:
                        (document.body.clientWidth < x + menuWidth ? x - menuWidth : x) +
                        'px',
                    top:
                        (document.body.clientHeight < y + menuHeight ? y - menuHeight : y) +
                        'px'
                };
            }
        },
        data() {
            return {
                status: false
            };
        },
        methods: {
            fnHandler(item) {
                this.status = false;
                if (item.fn) item.fn(this.customEvent);
                this.resolve(item.action);
            }
        },
        beforeDestroy() {
            document.body.removeChild(this.$el);
        },
        mounted() {
            // 挂载后才开始计算左右，隐藏挂载后显示不会闪一下
            this.$nextTick(function () {
                this.status = true;
            });
        },
        components: {
            ContextMenu
        }
    };
</script>

<style  lang="less">
    .contextmenu-wrap {
        position: fixed;
        z-index: 9999;
        top: 0;
        left: 0;
    }
</style>
