<!--
 领域发布页，
 @Author: zhanbh
 @Date: 2019-10-19
-->
<template>
    <el-form class="setting"
             ref="form"
             :model="form"
             :rules="rules"
             label-width="125px"
             @submit.native.prevent
             v-loading="isLoading"
    >
        <el-row  :gutter="5" >
            <el-col :span="16">
                <el-form-item label="调度计划：">
                    <el-radio-group v-model="form.scheduleMeta.schemeScheduleMode" @change="handleChangeSchedulingPlan">
                            <el-radio label="1">定时</el-radio>
                            <el-radio label="0">手动</el-radio>
                            <el-radio label="2">一次性</el-radio>
                            <el-radio label="3">间隔</el-radio>
                    </el-radio-group>
                </el-form-item>
            </el-col>
            <el-col :span="8">
                <el-form-item label="执行状态：">
                   {{form.scheduleMeta.scheduleStatus}}
                </el-form-item>
            </el-col>
        </el-row>
        <template v-if="`${form.scheduleMeta.schemeScheduleMode}` === '1' || `${form.scheduleMeta.schemeScheduleMode}` === '3'">
        <el-row :gutter="2">
                <el-form-item :label="label"
                >
                    <template v-if="`${form.scheduleMeta.schemeScheduleMode}` === '1' ">
                    <el-col :span="1">每</el-col>
                    <el-col :span="2">
                    <el-select v-model="form.scheduleMeta.scheduleInterval" size="small"
                    >
                        <el-option
                                v-for="item in scheduleInterval"
                                v-if="item"
                                :key="item.value"
                                :label="item.label"
                                :value="item.value">
                        </el-option>
                    </el-select>
                    </el-col>
                    </template>
                    <template v-if="`${form.scheduleMeta.schemeScheduleMode}` === '3' ">
                        <el-col :span="2">
                            <el-select v-model="form.scheduleMeta.scheduleMonth" size="small"
                            >
                                <el-option
                                        v-for="item in scheduleMonth"
                                        v-if="item"
                                        :key="item.value"
                                        :label="item.label"
                                        :value="item.value">
                                </el-option>
                            </el-select>
                        </el-col>
                        <el-col :span="1">
                            月
                        </el-col>
                    </template>
                    <template
                            v-if="`${form.scheduleMeta.schemeScheduleMode}` === '1' &&`${form.scheduleMeta.scheduleInterval}` === '2' ">
                        <el-checkbox-group v-model="form.scheduleWeek">
                            <el-col :span="2">
                                <el-checkbox label="1">周一</el-checkbox>
                            </el-col>
                            <el-col :span="2">
                                <el-checkbox label="2">周二</el-checkbox>
                            </el-col>
                            <el-col :span="2">
                                <el-checkbox label="3">周三</el-checkbox>
                            </el-col>
                            <el-col :span="2">
                                <el-checkbox label="4">周四</el-checkbox>
                            </el-col>
                            <el-col :span="2">
                                <el-checkbox label="5">周五</el-checkbox>
                            </el-col>
                            <el-col :span="2">
                                <el-checkbox label="6">周六</el-checkbox>
                            </el-col>
                            <el-col :span="2">
                                <el-checkbox label="7">周日</el-checkbox>
                            </el-col>
                        </el-checkbox-group>
                    </template>
                    <template v-if=" (`${form.scheduleMeta.schemeScheduleMode}` === '1' &&`${form.scheduleMeta.scheduleInterval}` === '3') || `${form.scheduleMeta.schemeScheduleMode}` === '3'">
                        <el-col :span="2">
                            <el-select v-model="form.scheduleMeta.scheduleDay" size="small"
                            >
                                <el-option
                                        v-for="item in scheduleDay"
                                        v-if="item"
                                        :key="item.value"
                                        :label="item.label"
                                        :value="item.value">
                                </el-option>
                            </el-select>
                        </el-col>
                        <el-col :span="1">
                            日
                        </el-col>
                    </template>
                    <template v-if=" `${form.scheduleMeta.schemeScheduleMode}` === '1' ||`${form.scheduleMeta.schemeScheduleMode}` === '3'  ">
                        <el-col :span="2">
                            <el-select v-model="form.scheduleMeta.scheduleHour" size="small"
                            >
                                <el-option
                                        v-for="item in scheduleHour"
                                        v-if="item"
                                        :key="item.value"
                                        :label="item.label"
                                        :value="item.value">
                                </el-option>
                            </el-select>
                        </el-col>
                        <el-col :span="1">
                            时
                        </el-col>
                        <el-col :span="2">
                            <el-select v-model="form.scheduleMeta.scheduleMinute" size="small"
                            >
                                <el-option
                                        v-for="item in scheduleMinute"
                                        v-if="item"
                                        :key="item.value"
                                        :label="item.label"
                                        :value="item.value">
                                </el-option>
                            </el-select>
                        </el-col>
                        <el-col :span="1">
                            分
                        </el-col>
                    </template>
                </el-form-item>

        </el-row>
        </template>
        <template v-if="`${form.scheduleMeta.schemeScheduleMode}` != '0'">
        <el-row >
            <el-col :span="12">
            <template v-if="`${form.scheduleMeta.schemeScheduleMode}` === '1' || `${form.scheduleMeta.schemeScheduleMode}` === '3' ">
                <el-form-item label="开始时间："
                >
                    <el-date-picker
                            v-model="form.scheduleMeta.beginTime"
                            type="date"
                            format="yyyy-MM-dd"
                            value-format="yyyy-MM-dd HH:mm:ss"
                            :picker-options="pickerOptions.startTime"
                            placeholder="选择日期">
                    </el-date-picker>
                </el-form-item>
            </template>
                <template v-if="`${form.scheduleMeta.schemeScheduleMode}` === '2' ">
                    <el-form-item label="开始时间："
                    >
                        <el-date-picker
                                v-model="form.scheduleMeta.beginTime"
                                type="datetime"
                                format="yyyy-MM-dd HH:mm:ss"
                                value-format="yyyy-MM-dd HH:mm:ss"
                                :picker-options="pickerOptions.startTimeData"
                                placeholder="选择日期">
                        </el-date-picker>
                    </el-form-item>
                </template>
            </el-col>
            <el-col :span="12">
            <template v-if="`${form.scheduleMeta.schemeScheduleMode}` === '1' || `${form.scheduleMeta.schemeScheduleMode}` === '3' ">
                <el-form-item label="结束时间："
                >
                    <el-date-picker
                            v-model="form.scheduleMeta.endTime"
                            type="date"
                            value-format="yyyy-MM-dd"
                            :picker-options="pickerOptions.endTime"
                            placeholder="选择日期">
                    </el-date-picker>
                </el-form-item>
            </template>
            </el-col>
        </el-row>
        </template>
        <el-row>
            <el-col>
                <el-form-item label="调度方案说明">
                    <el-input v-model="form.scheduleMeta.memo"
                              type="textarea"
                              :rows="2"
                              placeholder="请输入内容"
                    >
                    </el-input>
                </el-form-item>
            </el-col>
        </el-row>

        <el-form-item class="edit-btns">
            <el-button size="small" @click.stop="handleClickCancel">取消</el-button>
            <el-button size="small" type="primary" @click.stop="handleClickSave">保存</el-button>
        </el-form-item>
    </el-form>

</template>
<script>
    import * as flowApi from '@/projects/Knowledge/api/flowApi';

    import dateFormatter from '@/projects/Knowledge/assets/js/utils/dateFormatter';

    export default {
        name: "Setting",
        props: {
            transId: String
        },
        data() {
            const vm = this;
            return {
                isLoading: false,
                form: {
                    scheduleMeta:{
                        id: '',
                        schemeScheduleMode: '0',
                        scheduleStatus: '',
                        memo: '',
                        scheduleInterval: '',
                        scheduleMonth: '',
                        scheduleHour: '',
                        scheduleMinute: '',
                        scheduleDay: '',
                        beginTime:'',
                        endTime: '',
                        jobStrategyId:''
                    },
                    scheduleWeek: [],
                },
                scheduleMonth:[],
                scheduleInterval: [],
                scheduleHour: [],
                scheduleMinute: [],
                scheduleDay:[],
                rules: {},
                label:'',
                pickerOptions: {
                    startTime: {
                        disabledDate(date) {
                            let endTime = vm.form.scheduleMeta.endTime;
                            let dates = dateFormatter.format(date, "yyyy-MM-dd");
                            let thisDates = dateFormatter.format(new Date(), "yyyy-MM-dd");
                            if (dates >= thisDates) {
                                if (!endTime) {
                                    return false;
                                } else {
                                    let dateStr = dateFormatter.format(date, "yyyy-MM-dd");
                                    return dateStr > endTime;
                                }
                            }
                            return true;
                        }
                    },
                    startTimeData: {
                        disabledDate(date) {
                            let dates = dateFormatter.format(date, "yyyy-MM-dd");
                            let thisDates = dateFormatter.format(new Date(), "yyyy-MM-dd");
                            return dates < thisDates;
                        }
                    },
                    endTime: {
                        disabledDate(date) {
                            let startTime = vm.form.scheduleMeta.beginTime;
                            let dates = dateFormatter.format(date, "yyyy-MM-dd");
                            let thisDates = dateFormatter.format(new Date(), "yyyy-MM-dd");
                            if (dates >= thisDates) {
                                if (!startTime) {
                                    return false;
                                } else {
                                    let startTimeDate = vm.timeToDate(startTime);

                                    let dateStr = dateFormatter.format(date, "yyyy-MM-dd");
                                    return dateStr < startTimeDate;
                                }
                            }
                            return true;
                        }
                    }
                },
            };
        },
        computed: {},
        watch: {},
        methods: {
            clearForm() {
                const vm = this;
                let {form} = vm;
                for (let key in form) {
                    form[key] = '';
                }
                if (vm.$refs['form']) {
                    vm.$refs['form'].clearValidate();
                }
            },
            async initData() {
                const vm = this;
                let {transId,form} = vm;
                vm.isLoading = true;
                let data = await flowApi.schedulingConfiguration(transId);
                vm.isLoading = false;
                if (data.code == 200) {
                    let result = data.result;
                    if (result.scheduleInterval === '0' || result.scheduleInterval ==null) {
                        result.scheduleInterval='1';
                    }
                    for (let key in form.scheduleMeta ){
                        form.scheduleMeta[key] = result[key]
                    }
                    form.scheduleMeta.beginTime = this. stringToDate(form.scheduleMeta.beginTime);
                    form.scheduleMeta.endTime = this.stringToDate(form.scheduleMeta.endTime);
                    form.scheduleMeta.scheduleStatus = data.scheduleStatus;
                }
            },
            handleChangeSchedulingPlan() {
                const vm = this;
                let schemeScheduleMode = vm.form.scheduleMeta.schemeScheduleMode;
                if (schemeScheduleMode==='1') {
                    vm.label="执行时间： ";
                }else if (schemeScheduleMode === '3') {
                    vm.label="间隔时间： "
                }else {
                    vm.label=""
                }
               
            },
            /**
             * 字符串日期转化为日期格式
             * 20191226100220--》2019-12-26
             * */
            stringToDate(dataString){
                let format=  dateFormatter.parse(dataString,"yyyyMMddHHmmss");
                if (format==false){
                    return "";
                }
               let dates=dateFormatter.format(format,"yyyy-MM-dd HH:mm:ss");
               return dates;
            },

            /**
             * 时间转化为日期格式
             * 2019-12-08 12:00:00--》2019-12-08
             * */
            timeToDate(dataString){
                let format=  dateFormatter.parse(dataString,"yyyy-MM-dd HH:mm:ss");
                if (format==false){
                    return "";
                }
                let dates=dateFormatter.format(format,"yyyy-MM-dd");
                return dates;
            },
            initScheduleInterval() {
                this.scheduleInterval = [
                    {value: "1", label: "日"},
                    {value: "2", label: "周"},
                    {value: "3", label: "月"}];
               /* this.form.scheduleInterval = '0'*/
            },
            initScheduleMinute() {
                for (let i = 0; i < 60; i++) {
                    let scheduleMinute = {value: i, label: i,};
                    this.scheduleMinute.push(scheduleMinute);
                }
                // this.form.scheduleMinute = '0'
            },
            initScheduleMonth(){
                for (let i = 1; i < 13; i++) {
                    let scheduleMonth = {value: i, label: i,};
                    this.scheduleMonth.push(scheduleMonth);
                }
                // this.form.scheduleMonth = '1'
            },
            initScheduleHour() {
                for (let i = 0; i < 24; i++) {
                    let scheduleHour = {value: i, label: i,};
                    this.scheduleHour.push(scheduleHour);
                }
                // this.form.scheduleHour = '0'
            },
            initScheduleDay(){
                for (let i = 1; i < 32; i++) {
                    let scheduleDay = {value: i, label: i,};
                    this.scheduleDay.push(scheduleDay);
                }
                // this.form.scheduleDay = '1'
            },
            handleClickCancel() {
                this.$emit('cancel');
            },
            async handleClickSave() {
                console.log(this.form);
                let vm = this;
                let {form} = vm;
                if (form.scheduleMeta.schemeScheduleMode === '1'&& form.scheduleMeta.scheduleInterval==='2') {
                    alert("暂不支持每周定时执行配置");
                    return;
                }
              if (form.scheduleMeta.schemeScheduleMode==='3') {
                 let begin= form.scheduleMeta.beginTime;
                 let end  = form.scheduleMeta.endTime;
                  form.scheduleMeta.beginTime= this.timeToDate(begin);
                  form.scheduleMeta.endTime = this.timeToDate(end);
              }
                vm.isLoading = true;
                let data = await flowApi.saveJobInfo(form);
                vm.isLoading = false;
                if (data.code === 200) {
                    vm.$emit('saved');
                }
            }
        },
        created() {
            this.initScheduleInterval();
            this.initScheduleHour();
            this.initScheduleMinute();
            this.initScheduleDay();
            this.initScheduleMonth();
        },
        activated() {
           this.initData();
        }
    };
</script>
<style scoped lang="less">

    .el-cascader {
        display: initial;
    }

    .edit-btns {
        text-align: right;
    }

    .el-row {
        margin-bottom: 20px;
    &:last-child {
         margin-bottom: 0;
     }
    }
    .el-col {
        border-radius: 4px;
    }
    .bg-purple-dark {
        background: #99a9bf;
    }
    .bg-purple {
        background: #d3dce6;
    }
    .bg-purple-light {
        background: #e5e9f2;
    }
    .grid-content {
        border-radius: 4px;
        min-height: 36px;
    }
    .row-bg {
        padding: 10px 0;
        background-color: #f9fafc;
    }
</style>