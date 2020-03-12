<!--
 离线计算表单
 @Author: zhanbh
 @Date: 2019-12-31
-->
<template>
    <form-container class="offline-form"
                    :show-footer="false"
                    :title="title"
                    @close="handleClickCancel">
        <offline-calc :data="objectFeature"
                      :domain-id="domain && domain.id"
                      disabled>
        </offline-calc>
    </form-container>
</template>
<script>

    import OfflineCalc from '../../../domain/object/valueCalculators/OfflineCalc';
    import FormContainer from './FormContainer'
    export default {
        name: "OfflineForm",
        props: {
            title: String,
            objectFeature: {
                type: Object,
                default() {
                    return {}
                }
            },
            domain: {
                type: Object,
                default() {
                    return {}
                }
            }
        },
        data() {
            return {
            };
        },
        computed: {},
        methods: {
            handleClickCancel() {
                this.$emit('cancel')
            },
        },
        components: {
            FormContainer,
            OfflineCalc
        }
    };
</script>
<style scoped>
    .offline-form{
        width: 800px;
    }
</style>