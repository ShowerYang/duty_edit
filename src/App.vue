<template>
<div class="vDuty" :class="{'notranslate': isTranslated}">
    <div class="duty-container"> 
        <div class="duty-item-container"> 
            <!-- 業務 -->
            <div
                class="duty-item"
                :class="{'active-duty-item': duty.active}"
                v-for="(duty, dutyIndex) in dutyData"
                :key="dutyIndex"
                @mouseover="setActiveDutyItem(duty.flag)"
                @mouseout="setActiveDutyItem(null)">
                <!-- 業務標題 -->
                <div class="item-title">
                    <div :id="`title_${duty.flag}`" class="title">
                        {{ duty.unit_string }}
                        <span v-if="duty.i_position_id > 0 && duty.title_string != ''"> - {{ duty.title_string }}業務</span>
                        <span v-else> - 個人業務</span>
                    </div> 
                </div>
                <div class="item-block">
                    <!-- 呈現內容 -->
                    <div v-if="editDuty.id != duty.flag" class="show-duty">
                        <template v-if="duty.t_duty_title && duty.t_duty_title.length != 0">
                            <div class="item-main" v-for="(main, mainIndex) in duty.t_duty_title" :key="mainIndex">
                                <div class="main-container level1">
                                    <div class="marker">
                                        <div class="fas fa-globe-asia"></div>
                                    </div>
                                    <div class="title">{{ main.mainItem }}</div>
                                </div> 
                                <div class="item-sub" v-for="(sub, subIndex) in main.subItem" :key="subIndex">
                                    <div class="sub-container level2">
                                        <div class="marker">
                                            <div class="number">{{ subIndex + 1 }}.</div>
                                            <div class="separate"></div>
                                        </div>
                                        <div class="title">{{ sub }}</div>
                                    </div>
                                </div>
                            </div>
                        </template>
                        <template v-else>
                            <div>{{ $t('__noData') }}</div>
                        </template>
                        <!-- 編輯按鈕 -->
                        <div v-if="!editing" class="pencil-container" :title="$t('__toEdit')" @click.stop.prevent="setEditDutyFromJSON(duty.flag)">
                            <i class="fas fa-edit pencil"></i>
                        </div>
                    </div>
                    <!-- 編輯內容 -->
                    <div v-show="editDuty.id == duty.flag" class="edit-duty">
                        <div class="block-edit">
                            <div class="editor-container">
                                <div class="section-container">
                                    <!-- 主項目 -->
                                    <Container @drop="onMainDrop" @get-child-payload="getMainPayload" lock-axis="y" drag-handle-selector=".section-drag" drag-class="">                                        
                                        <Draggable v-for="main in editDuty.data" :key="main.id" style="overflow: visible;" >
                                            <div class="section" :class="{'active-section': main.section}">
                                                <div class="section-card">
                                                    <div class="section-control" :title="$t('__toCOE')" @click.stop.prevent="controlSection(main.id)">
                                                        <div :class="{'control-collapse': main.collapse, 'control-expand': !main.collapse}"></div>  
                                                        <div class="section-info">
                                                            <div class="title">
                                                                {{ main.content }}
                                                            </div>
                                                            <div class="count" v-if="main.collapse">
                                                                ({{ main.sub.length }})
                                                            </div>
                                                        </div> 
                                                    </div>
                                                    <div v-if="!main.section" :title="$t('__toDragMain')" class="header section-drag" @click.stop.prevent="setActiveSection(main.id)"></div>
                                                    <div v-else :title="$t('__toDragMain')" class="active-header section-drag">
                                                        <div class="infos-area"> 
                                                        </div>
                                                        <div class="trash-area" :title="$t('__toDeleteMain')" @click.stop.prevent="deleteMainItemConfirm(main.id)">
                                                            <i class="far fa-trash-alt"></i>
                                                        </div>
                                                    </div>
                                                    <div class="content" :class="{'content-expand': !main.collapse}">
                                                        <div v-if="main.collapse" class="section-collapse">
                                                            <div class="text-card-container">
                                                                <div class="text-card" v-for="(sub, subIndex) in main.sub" :key="subIndex">
                                                                    {{ sub.content }}
                                                                </div>
                                                            </div>
                                                        </div>                                            
                                                        <div v-if="!main.collapse" class="section-expand">
                                                            <div class="main-item" :class="{'active-main': main.active}">
                                                                <div class="item-card" @click.stop.prevent="setActiveMain(main.id)">
                                                                    <div class="left-side">
                                                                        <div class="marker">
                                                                            <div class="fas fa-globe-asia"></div> 
                                                                        </div>
                                                                    </div>
                                                                    <div class="right-side">                                                                        
                                                                        <div class="content">
                                                                            <div class="input-area">
                                                                                <textarea v-model="main.content" :id="'main_' + duty.flag + '_' + main.id" :placeholder="$t('__toFill')" :change="removeLineBreak(main)"></textarea>
                                                                            </div>
                                                                        </div>
                                                                        <div v-if="main.active" class="func">
                                                                            <div class="trash-area" :title="$t('__toDeleteMain')" @click.stop.prevent="deleteMainItemConfirm(main.id)">
                                                                                <i class="far fa-trash-alt"></i>
                                                                            </div>
                                                                        </div> 
                                                                    </div>
                                                                </div>
                                                                <div v-if="!main.active" class="wrapper-line" :class="{'wrapper-line-usable': !isAdding}" @click.stop.prevent="startAdding(1, main.id, null)">
                                                                    <div class="line"></div> 
                                                                </div>
                                                                <div v-if="main.active" class="wrapper-add" @click.stop.prevent="closeAdding">
                                                                    <div class="wrapper-icon-container">      
                                                                        <div class="wrapper-icon" :title="$t('__toAdd')">
                                                                            <i class="fas fa-plus-circle icon" @click.stop.prevent="startAdding(0, null, null)"></i>
                                                                        </div>
                                                                    </div>
                                                                    <div v-if="isAddBoxShow" class="wrapper-triangle">
                                                                        <div class="triangle-brand"></div>
                                                                        <div class="triangle-background"></div>
                                                                    </div>
                                                                    <div v-if="isAddBoxShow" class="wrapper-menu" @click.stop.prevent="closeAdding">
                                                                        <div class="menu-option" @click.stop.prevent="addMainItem(main.id)">
                                                                            <div class="option-icon">
                                                                                <i class="fas fa-globe-asia"></i>
                                                                            </div>
                                                                            <div class="option-text">{{ $t('__toAddMain') }}</div> 
                                                                        </div>
                                                                        <div class="menu-option" @click.stop.prevent="addSubItem(main.id)">
                                                                            <div class="option-icon">
                                                                                <i class="fas fa-list-ol"></i>
                                                                            </div>
                                                                            <div class="option-text">{{ $t('__toAddSub') }}</div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div class="sub-item-container">
                                                                <!-- 子項目 -->
                                                                <Container @drop="onSubDrop(main.id, $event)" lock-axis="y" drag-handle-selector=".left-side" drag-class="">
                                                                    <Draggable v-for="(sub, index) in main.sub" :key="sub.id" style="overflow: visible;">
                                                                        <div class="sub-item" :class="{'active-sub': sub.active}">
                                                                            <div class="item-card" @click.stop.prevent="setActiveSub(main.id, sub.id)">
                                                                                <div :title="$t('__toDragSub')" class="left-side">
                                                                                    <div class="marker">
                                                                                        <div class="">{{ index + 1 }}</div> 
                                                                                    </div>
                                                                                </div>
                                                                                <div class="right-side">                                                                                    
                                                                                    <div class="content">
                                                                                        <div class="input-area">
                                                                                            <textarea v-model="sub.content" :id="'sub_' + duty.flag + '_' + main.id + '_' + sub.id" :main-id="main.id" :placeholder="$t('__toFill')" :change="removeLineBreak(sub)"></textarea>
                                                                                        </div>
                                                                                    </div>
                                                                                    <div v-if="sub.active" class="func">
                                                                                        <div class="trash-area" :title="$t('__toDeleteSub')" @click.stop.prevent="deleteSubItem(main.id, sub.id)">
                                                                                            <i class="far fa-trash-alt"></i>
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            </div> 
                                                                            <div v-if="!sub.active" class="wrapper-line" :class="{'wrapper-line-usable': !isAdding}" @click.stop.prevent="startAdding(2, main.id, sub.id)">
                                                                                <div class="line"></div> 
                                                                            </div>
                                                                            <div v-if="sub.active" class="wrapper-add" @click.stop.prevent="closeAdding">
                                                                                <div class="wrapper-icon-container">      
                                                                                    <div class="wrapper-icon" :title="$t('__toAdd')">
                                                                                        <i class="fas fa-plus-circle icon" @click.stop.prevent="startAdding(0, null, null)"></i>
                                                                                    </div>
                                                                                </div>
                                                                                <div v-if="isAddBoxShow" class="wrapper-triangle">
                                                                                    <div class="triangle-brand"></div>
                                                                                    <div class="triangle-background"></div>
                                                                                </div>
                                                                                <div v-if="isAddBoxShow" class="wrapper-menu" @click.stop.prevent="closeAdding">                                                               
                                                                                    <div class="menu-option" @click.stop.prevent="addMainItem(main.id, sub.id)">
                                                                                        <div class="option-icon">
                                                                                            <i class="fas fa-globe-asia"></i>
                                                                                        </div>
                                                                                        <div class="option-text">{{ $t('__toAddMain') }}</div> 
                                                                                    </div>
                                                                                    <div class="menu-option" @click.stop.prevent="addSubItem(main.id, sub.id)">
                                                                                        <div class="option-icon">
                                                                                            <i class="fas fa-list-ol"></i>
                                                                                        </div>
                                                                                        <div class="option-text">{{ $t('__toAddSub') }}</div>
                                                                                    </div>                                                               
                                                                                </div>
                                                                            </div> 
                                                                        </div>
                                                                    </Draggable>
                                                                </Container> 
                                                            </div>
                                                        </div>                                            
                                                    </div>
                                                </div>
                                                <div v-if="!main.section" class="wrapper-line" :class="{'wrapper-line-usable': !isAdding}" @click.stop.prevent="startAdding(3, main.id, null)">
                                                    <div class="line"></div> 
                                                </div>
                                                <div v-if="main.section" class="wrapper-add" @click.stop.prevent="closeAdding">
                                                    <div class="wrapper-icon-container">      
                                                        <div class="wrapper-icon" :title="$t('__toAdd')">
                                                            <i class="fas fa-plus-circle icon" @click.stop.prevent="startAdding(0, null, null)"></i>
                                                        </div>
                                                    </div>
                                                    <div v-if="isAddBoxShow" class="wrapper-triangle">
                                                        <div class="triangle-brand"></div>
                                                        <div class="triangle-background"></div>
                                                    </div>
                                                    <div v-if="isAddBoxShow" class="wrapper-menu" @click.stop.prevent="closeAdding">
                                                        <div class="menu-option" @click.stop.prevent="addMainItem(main.id)">
                                                            <div class="option-icon">
                                                                <i class="fas fa-globe-asia"></i>
                                                            </div>
                                                            <div class="option-text">{{ $t('__toAddMain') }}</div> 
                                                        </div>
                                                        <!-- <div class="menu-option" @click.stop.prevent="addSubItem(main.id)">
                                                            <div class="option-icon">
                                                                <i class="fas fa-list-ol"></i>
                                                            </div>
                                                            <div class="option-text">新增子項目</div>
                                                        </div> -->
                                                    </div>
                                                </div>
                                            </div>  
                                        </Draggable>
                                    </Container>                                  
                                </div>
                            </div>
                            <div class="button-container">
                                <button type="button" class="btn btn-primary edit" @click.stop.prevent="updateEditDutyConfirm">{{ $t('__toSaveContent') }}</button>
                                <button type="button" class="btn btn-secondary edit" @click.stop.prevent="cancelEditDutyConfirm">{{ $t('__toCancelEdit') }}</button>                                
                                <!-- <i class="fas fa-check-circle confirm" :title="$t('__toSaveContent')" @click.stop.prevent="updateEditDutyConfirm"></i>
                                <i class="fas fa-times-circle confirm" :title="$t('__toCancelEdit')" @click.stop.prevent="cancelEditDutyConfirm"></i> -->
                            </div>
                        </div>                        
                    </div>             
                </div>
            </div>
        </div>
    </div>    
    <!-- 確認對話框 -->
    <div class="modal fade" id="confirmModal" tabindex="-1" role="dialog" aria-labelledby="confirmModalTitle" aria-hidden="true" data-backdrop="static" data-keyboard="false">
        <div class="modal-dialog modal-dialog-centered" role="document">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="confirmModalTitle">{{ $t('__message') }}</h5>
                    <button type="button" class="close" aria-label="Close" data-dismiss="modal">
                        <span data-dismiss="modal">&times;</span>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="response_msg">{{ confirmMsg }}</div>
                </div>
                <div class="modal-footer"> 
                    <button type="button" class="btn btn-primary" @click.stop.prevent="confirmAction">{{ $t('__btnConfirm') }}</button>
                    <button type="button" class="btn btn-secondary" data-dismiss="modal">{{ $t('__btnCancel') }}</button>                     
                </div>
            </div>
        </div>
    </div>
    <!-- 訊息對話框 -->
    <div class="modal fade" id="responseModal" tabindex="-1" role="dialog" aria-labelledby="responseModalTitle" aria-hidden="true" data-backdrop="static" data-keyboard="false">
        <div class="modal-dialog modal-dialog-centered" role="document">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="responseModalTitle">{{ $t('__message') }}</h5>
                    <button type="button" class="close" aria-label="Close" data-dismiss="modal">
                        <span data-dismiss="modal">&times;</span>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="response_msg">{{ responseMsg }}</div>
                </div>
                <div class="modal-footer">                     
                    <button type="button" class="btn btn-primary" data-dismiss="modal">{{ $t('__btnConfirm') }}</button>
                </div>
            </div>
        </div>
    </div>
    <!-- 齒輪圖案 -->
    <div v-if="loading" class="load-mark">
        <div class="background">
        </div>
        <svg class="lds-gears" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid"><g transform="translate(50 50)"> <g transform="translate(-19 -19) scale(0.6)"> <g transform="rotate(294)">
            <animateTransform attributeName="transform" type="rotate" values="0;360" keyTimes="0;1" dur="4s" begin="0s" repeatCount="indefinite"></animateTransform><path d="M39.29058411375428 -7.5 L49.29058411375428 -7.5 L49.29058411375428 7.5 L39.29058411375428 7.5 A40 40 0 0 1 37.776643972040496 13.150101528493847 L37.776643972040496 13.150101528493847 L46.436898009884885 18.15010152849385 L38.936898009884885 31.14048258526043 L30.276643972040496 26.14048258526043 A40 40 0 0 1 26.140482585260433 30.276643972040496 L26.140482585260433 30.276643972040496 L31.140482585260436 38.936898009884885 L18.150101528493856 46.436898009884885 L13.150101528493856 37.776643972040496 A40 40 0 0 1 7.500000000000007 39.29058411375428 L7.500000000000007 39.29058411375428 L7.500000000000008 49.29058411375428 L-7.500000000000001 49.29058411375428 L-7.500000000000002 39.29058411375428 A40 40 0 0 1 -13.150101528493837 37.7766439720405 L-13.150101528493837 37.7766439720405 L-18.150101528493835 46.43689800988489 L-31.14048258526043 38.93689800988489 L-26.14048258526043 30.276643972040503 A40 40 0 0 1 -30.276643972040485 26.140482585260443 L-30.276643972040485 26.140482585260443 L-38.93689800988487 31.140482585260443 L-46.43689800988488 18.15010152849386 L-37.776643972040496 13.150101528493858 A40 40 0 0 1 -39.29058411375428 7.50000000000001 L-39.29058411375428 7.50000000000001 L-49.29058411375428 7.500000000000011 L-49.29058411375428 -7.499999999999999 L-39.29058411375428 -7.5 A40 40 0 0 1 -37.7766439720405 -13.150101528493835 L-37.7766439720405 -13.150101528493835 L-46.43689800988489 -18.15010152849383 L-38.93689800988489 -31.14048258526042 L-30.276643972040503 -26.140482585260422 A40 40 0 0 1 -26.140482585260443 -30.276643972040485 L-26.140482585260443 -30.276643972040485 L-31.140482585260447 -38.93689800988487 L-18.150101528493867 -46.43689800988488 L-13.150101528493863 -37.776643972040496 A40 40 0 0 1 -7.500000000000012 -39.29058411375428 L-7.500000000000012 -39.29058411375428 L-7.500000000000014 -49.29058411375428 L7.4999999999999964 -49.29058411375428 L7.499999999999998 -39.29058411375428 A40 40 0 0 1 13.150101528493813 -37.77664397204051 L13.150101528493813 -37.77664397204051 L18.150101528493806 -46.4368980098849 L31.1404825852604 -38.93689800988491 L26.140482585260408 -30.276643972040517 A40 40 0 0 1 30.276643972040482 -26.14048258526045 L30.276643972040482 -26.14048258526045 L38.936898009884864 -31.140482585260454 L46.43689800988488 -18.15010152849387 L37.776643972040496 -13.150101528493865 A40 40 0 0 1 39.29058411375428 -7.500000000000014 M0 -23A23 23 0 1 0 0 23 A23 23 0 1 0 0 -23" fill="#494b57"></path></g></g> <g transform="translate(19 19) scale(0.6)"> <g transform="rotate(51)">
            <animateTransform attributeName="transform" type="rotate" values="360;0" keyTimes="0;1" dur="4s" begin="-0.16666666666666666s" repeatCount="indefinite"></animateTransform><path d="M39.29058411375428 -7.5 L49.29058411375428 -7.5 L49.29058411375428 7.5 L39.29058411375428 7.5 A40 40 0 0 1 37.776643972040496 13.150101528493847 L37.776643972040496 13.150101528493847 L46.436898009884885 18.15010152849385 L38.936898009884885 31.14048258526043 L30.276643972040496 26.14048258526043 A40 40 0 0 1 26.140482585260433 30.276643972040496 L26.140482585260433 30.276643972040496 L31.140482585260436 38.936898009884885 L18.150101528493856 46.436898009884885 L13.150101528493856 37.776643972040496 A40 40 0 0 1 7.500000000000007 39.29058411375428 L7.500000000000007 39.29058411375428 L7.500000000000008 49.29058411375428 L-7.500000000000001 49.29058411375428 L-7.500000000000002 39.29058411375428 A40 40 0 0 1 -13.150101528493837 37.7766439720405 L-13.150101528493837 37.7766439720405 L-18.150101528493835 46.43689800988489 L-31.14048258526043 38.93689800988489 L-26.14048258526043 30.276643972040503 A40 40 0 0 1 -30.276643972040485 26.140482585260443 L-30.276643972040485 26.140482585260443 L-38.93689800988487 31.140482585260443 L-46.43689800988488 18.15010152849386 L-37.776643972040496 13.150101528493858 A40 40 0 0 1 -39.29058411375428 7.50000000000001 L-39.29058411375428 7.50000000000001 L-49.29058411375428 7.500000000000011 L-49.29058411375428 -7.499999999999999 L-39.29058411375428 -7.5 A40 40 0 0 1 -37.7766439720405 -13.150101528493835 L-37.7766439720405 -13.150101528493835 L-46.43689800988489 -18.15010152849383 L-38.93689800988489 -31.14048258526042 L-30.276643972040503 -26.140482585260422 A40 40 0 0 1 -26.140482585260443 -30.276643972040485 L-26.140482585260443 -30.276643972040485 L-31.140482585260447 -38.93689800988487 L-18.150101528493867 -46.43689800988488 L-13.150101528493863 -37.776643972040496 A40 40 0 0 1 -7.500000000000012 -39.29058411375428 L-7.500000000000012 -39.29058411375428 L-7.500000000000014 -49.29058411375428 L7.4999999999999964 -49.29058411375428 L7.499999999999998 -39.29058411375428 A40 40 0 0 1 13.150101528493813 -37.77664397204051 L13.150101528493813 -37.77664397204051 L18.150101528493806 -46.4368980098849 L31.1404825852604 -38.93689800988491 L26.140482585260408 -30.276643972040517 A40 40 0 0 1 30.276643972040482 -26.14048258526045 L30.276643972040482 -26.14048258526045 L38.936898009884864 -31.140482585260454 L46.43689800988488 -18.15010152849387 L37.776643972040496 -13.150101528493865 A40 40 0 0 1 39.29058411375428 -7.500000000000014 M0 -23A23 23 0 1 0 0 23 A23 23 0 1 0 0 -23" fill="#494b57"></path></g></g></g>
        </svg>
    </div>
    <!-- 新增項目時的白霧效果 -->
    <div v-if="isAdding" class="duty-fader" style="transition: opacity 0.5s ease 0s;" :style="{opacity: opacity}" @click.stop.prevent="closeAdding"></div>    
    <!-- 用於檢查 google 翻譯是否完成 -->
    <div id="waitTranslate" class="waitTranslate" :title="testString"></div>
</div> 
</template>

<script>
import { mapState } from 'vuex';
import { Container, Draggable } from "vue-smooth-dnd";
import testJSON from '@/assets/json/test.json';
import unitJSON from '@/assets/json/unitData.json'; // 單位資料
import titleJSON from '@/assets/json/titleData.json'; // 職稱資料
export default {
    name: 'app',
    components: { 
        Container,
        Draggable
    },
    data () {
        return {
            unitData: [], // 單位資料
            titleData: [], // 職稱資料
            dutyData: [], // 業務執掌資料
            tempDutyData: [],
            
            isTranslated: 0, // 是否經過翻譯
            testString: '測試', 
            
            editing: false, // 編輯中
            editDuty: // 編輯中業務
            {
                id: null,
                html: null, 
                data: []
            },
            
            isAddBoxShow: false, // 是否新增盒子顯示
            isAdding: false, // 是否新增中
            addTarget: // 
            {
                id: null
            },
            opacity: 0,

            // confirm msg
            msgType: 1,
            confirmMsg: '',
            deleteMain: null,
            // response msg
            responseMsg: '',            
            // general
            actionEvent: null,
            loading: false
        }
    },
    created () {
        const self = this;       
        
        // console.log(testJSON)
    },
    mounted () {
        const self = this;
        self.initialData();
        // self.updateHeight();
    },
    updated () {
        const self = this;
        // self.updateHeight();
    },
    methods: {
        // 初始化資料
        initialData () {
            const self = this; 
            
            // // 撈單位資料
            // let loadUnit = self.axios.post(
            //     `${self.apiPath}/personal_management/processUnitData.php`,
            //     { gLanguage: self.langCode }
            // ).then(response => {
            //     // console.log(data);
            //     self.setUnitData(response.data);
            // }).catch(error => {
            //     // console.log(error);
            // });
            
            // // 撈職稱資料
            // let loadTitle = self.axios.post(
            //     `${self.apiPath}/personal_management/processTitleData.php`,
            //     { gLanguage: self.langCode }
            // ).then(response => {
            //     // console.log(data);
            //     self.setTitleData(response.data);
            // }).catch(error => {
            //     // console.log(error);
            // });

            // self.loading = true;            
            // Promise.all([loadUnit, loadTitle])
            // .then(response => {
            //     self.getDutyData();
            // }).catch(error => {
            //     // console.log(error);
            // });

            self.setUnitData(unitJSON);
            self.setTitleData(titleJSON);
            // self.getDutyData();
            self.setDutyData(testJSON);
        },
        // 設定單位資料
        setUnitData (data) {
            // console.log(data)
            const self = this;

            if (data && data.length != 0) {
                data.forEach(item => {
                    self.unitData.push(item);
                });
            }
        },
        // 設定職稱資料
        setTitleData (data) {
            const self = this;

            if (data && data.length != 0) {
                data.forEach(item => {
                    self.titleData.push(item);
                });
            }
        },
        // 讀取業務職掌資料
        getDutyData () {
            const self = this; 
            
            self.loading = true;
            let data = new FormData;
            data.append('data', JSON.stringify({gLanguage: self.langCode}));

            let loadUnit = self.axios.post(
                `${self.apiPath}/personal_management/duty_query.php?${self.queryString}`,
                data
            ).then(response => {
                // console.log(data);
                self.loading = false;
                self.setDutyData(response.data);
            }).catch(error => {
                // console.log(error);
                self.loading = false;
                // self.setDutyData(testJSON);
            });
        },
        setDutyData (data) {
            const self = this;
            
            self.dutyData = [];
            if (data && data.result == 1)
            {   
                let count = 0;
                let dataArray = data.data;
                dataArray.forEach(item => {
                    item.flag = ++count; // 流水號
                    item.active = false; // 編輯內容中
                    item.unit_string = self.findUnitString(item.o_unit_id);
                    item.title_string = self.findTitleString(item.c_title_id);
                    self.dutyData.push(item);
                });
                
                if (self.langCode != 0) {
                    // 檢查 google 翻譯是否完成
                    // 方式為確認 $('#waitTranslate') 的內容是否為預期
                    let waitTranslate = setInterval(function(){ 
                        let testString = $('#waitTranslate').attr('title');
                        if (testString == 'test' || testString == '测试') {
                            // 設定為 1 會在 vDuty 上加入 notranslate (讓 google 翻譯不會對此進行處理)
                            self.isTranslated = 1; 
                            clearInterval(waitTranslate);
                        }
                    }, 30);
                    
                    // 進行 google 翻譯(只進行一次)
                    // 因為發現到如果讓 google 翻譯持續運作 可能會造成 vue 出錯
                    googleTranslate(self.langCode);
                }
            }
        },
        // 搜尋並回傳單位字串
        findUnitString (id) {
            const self = this;

            var unit = self.unitData.find(function(u){ return u.unit_id == id; });
            if( unit != undefined )
            {
                return unit.title;
            }
            else {
                return '';
            }
        },
        // 搜尋並回傳職稱字串
        findTitleString (id) {
            const self = this;

            var title = self.titleData.find(function(u){ return u.title_id == id; });
            if( title != undefined )
            {
                return title.title_name;
            }
            else {
                return '';
            }
        },
                
        // 設定業務 active 
        setActiveDutyItem (flag) {
            const self = this; 

            if (!self.editing) {
                if (flag != null) {
                    var duty = self.dutyData.find(function(d){ return d.flag == flag; });
                    if (duty != undefined) {   
                        duty.active = true;
                    }
                }
                else {
                    self.dutyData.forEach(function(d){
                        d.active = false;
                    });
                }
            }
            //self.$forceUpdate();
        },
        // 設定區塊 active
        setActiveSection (main_id) {
            const self = this;

            self.editDuty.data.forEach(function(m){
                if( m.id == main_id )
                    m.section = true;
                else
                    m.section = false;
                // clear main active
                m.active = false;
                // clear sub active
                m.sub.forEach(function(s){
                    s.active = false;
                })
            });
            //self.$forceUpdate();
        },
        // 設定區塊折疊
        controlSection (main_id) {
            const self = this;

            self.editDuty.data.forEach(function(m){
                if (m.id == main_id)
                    m.collapse = !m.collapse;
            });
            self.setActiveSection(main_id);
            //self.$forceUpdate();
        },
        // 設定主項目 active
        setActiveMain (main_id) {
            const self = this;

            self.editDuty.data.forEach(function(m){
                // clear section active
                m.section = false;
                if (m.id == main_id)
                    m.active = true;
                else
                    m.active = false;
                // clear sub active
                m.sub.forEach(function(s){
                    s.active = false;
                });
            }); 
            //self.$forceUpdate();           
        },
        // 設定子項目 active
        setActiveSub (main_id, sub_id) {
            const self = this; 

            self.editDuty.data.forEach(function(m){
                // clear section active
                m.section = false;
                // clear main active 
                m.active = false;
                // clear sub active
                m.sub.forEach(function(s){
                    s.active = false;
                })
            });
            var main = self.editDuty.data.find(function(m){ return m.id == main_id; });
            if (main != undefined) {
                main.sub.forEach(function(s){
                    if (s.id == sub_id)
                        s.active = true;
                    else
                        s.active = false;
                });                    
            }
            //self.$forceUpdate();
        },           
         
        // 開始新增
        startAdding (type, main_id, sub_id) {
            const self = this;

            self.isAddBoxShow = !self.isAddBoxShow;
            if (self.isAdding) { 
                self.opacity = 0; 
                setTimeout(function(){
                    self.isAdding = false;
                    self.isAddBoxShow = false;
                }, 200);
            } else {
                self.isAdding = true;
                setTimeout(function(){
                    self.opacity = 0.75;
                }, 20);
            }

            if (type != 0){
                if (type == 1) {
                    if (main_id != null){
                        self.setActiveMain(main_id);
                    }
                }
                if (type == 2) {
                    if (main_id != null && sub_id != null) {
                        self.setActiveSub(main_id, sub_id);
                    }
                }
                if (type == 3) {
                    if (main_id != null) {
                        self.setActiveSection(main_id);
                    }
                }
            }
        },
        closeAdding () {
            const self = this;

            if (self.isAddBoxShow)
                self.isAddBoxShow = !self.isAddBoxShow;
            self.opacity = 0; 
            setTimeout(function(){
                self.isAdding = false;
                self.isAddBoxShow = false;
            }, 200);
        },
        // 新增主項目
        addMainItem (main_id, sub_id) {
            const self = this;

            // 找到目前最大的ID
            var maxID = Math.max.apply(Math, self.editDuty.data.map(function(m) { return m.id; }));
            var mainItem = {
                id: (maxID + 1),
                section: false,
                active: false,
                collapse: false,
                content: '',
                sub: []
            };
            var index = self.editDuty.data.findIndex(function(m){ return m.id == main_id; });
            if (index != -1) {
                self.editDuty.data.splice(index + 1, 0, mainItem);
            }
            self.closeAdding();
            self.setMainTextareaFocus(maxID + 1);
        },
        // 設定主項目 textarea focus
        setMainTextareaFocus (main_id) {
            const self = this;
            
            setTimeout(function(){
                $('#main_' + self.editDuty.id + '_' + main_id)[0].focus();                    
            }, 100);
            self.setActiveMain(main_id);
        },
        // 新增子項目
        addSubItem (main_id, sub_id) {
            var self = this;
            var main = self.editDuty.data.find(function(m){ return m.id == main_id; });
            if( main != undefined )
            {
                var sub_length = main.sub.length;
                if( sub_length == 0 ){
                    var subItem = {
                        id: 1,
                        active: false,
                        content: ''
                    };
                    main.sub.push(subItem);
                }
                else 
                {
                    // find max id
                    var maxID = Math.max.apply(Math, main.sub.map(function(s) { return s.id; }));
                    var subItem = {
                        id: (maxID + 1),
                        active: false,
                        content: ''
                    };
                    if( sub_id && sub_id != null )
                    {
                        var index = main.sub.findIndex(function(s){ return s.id == sub_id; });
                        if( index != -1 ){
                            main.sub.splice(index + 1, 0, subItem);
                        }
                    }
                    else {
                        main.sub.push(subItem);
                    }
                }
            }
            self.closeAdding();
            if( sub_length == 0 )
                self.setSubTextareaFocus(main_id, 1);
            else
                self.setSubTextareaFocus(main_id, maxID + 1);
        },
        // 設定子項目 textarea focus
        setSubTextareaFocus (main_id, sub_id) {
            const self = this;

            setTimeout(function(){
                $('#sub_' + self.editDuty.id + '_' + main_id + '_' + sub_id)[0].focus(); 
                self.setActiveSub($('#sub_' + self.editDuty.id + '_' + main_id + '_' + sub_id).attr('main-id'), sub_id);
            }, 100);
        },
        // 確認是否刪除主項目
        deleteMainItemConfirm (main_id) {
            const self = this;

            self.deleteMain = main_id;
            var main = self.editDuty.data.find(function(m){ return m.id == self.deleteMain; });
            if (main != undefined) {
                // 如果有子項目則顯示對話框進行確認
                if (main.sub.length != 0) {
                    // 依目前語言別 產生不同的對話框訊息
                    if (self.langCode == 1)
                        self.confirmMsg = self.$t('__deleteMainItem') + ', ' + self.$t('__ifConfirm');
                    else
                        self.confirmMsg = self.$t('__deleteMainItem') + '，' + self.$t('__ifConfirm');
                        
                    self.actionEvent = self.deleteMainItem;
                    self.showModalConfirm(self.confirmMsg);
                } else {
                    self.deleteMainItem();
                }
            }
        },
        deleteMainItem () {
            const self = this;
            $('#confirmModal').modal('hide');

            var index = self.editDuty.data.findIndex(function(m){ return m.id == self.deleteMain; });
            if( index != -1 ){
                self.editDuty.data.splice(index, 1);
                if( self.editDuty.data.length == 0 )
                {
                    var main = {
                        id: 1,
                        section: false,
                        active: false,
                        collapse: false,
                        content: '',
                        sub: []
                    };
                    self.editDuty.data.push(main);
                }
            }            
        },
        // 刪除子項目
        deleteSubItem (main_id, sub_id) {
            const self = this;

            var main = self.editDuty.data.find(function(m){ return m.id == main_id; });
            if (main != undefined) {
                var index = main.sub.findIndex(function(s){ return s.id == sub_id; });
                if (index != -1) {
                    main.sub.splice(index, 1);
                }
            }
        },
        
        // 設定區塊摺疊(目前沒用到)
        setSectionCollapse (main_id) {
            const self = this;
            //console.log(main_id);

            if (main_id != null){
                self.editDuty.data.forEach(function(m){
                    if (m.id == main_id)
                        m.collapse = true;
                });
            } else {
                self.editDuty.data.forEach(function(m){
                    m.collapse = true;
                });
            }
        },
        
        // 配合 vue-smooth-dnd 套件
        // 當主項目拖曳後進行陣列位置交換
        onMainDrop (dropResult) {
            const self = this;

            var itemToAdd = self.editDuty.data.splice(dropResult.removedIndex, 1)[0];
            self.editDuty.data.splice(dropResult.addedIndex, 0, itemToAdd); 
        },        
        // 當子項目拖曳後進行陣列位置交換
        onSubDrop (main_id, dropResult) {
            const self = this;

            var main = self.editDuty.data.find(function(m){ return m.id == main_id; });
            if (main != undefined) {
                var itemToAdd = main.sub.splice(dropResult.removedIndex, 1)[0];
                main.sub.splice(dropResult.addedIndex, 0, itemToAdd);  
            }
        }, 
        // 取得移動時的資料(目前沒用到)
        getMainPayload (index) {
            var self = this;
            //console.log(index);
        },
        
        // 設定編輯內容
        setEditDutyFromJSON (flag) {
            const self = this;            
            //console.log(flag);

            var duty = self.dutyData.find(function(d){ return d.flag == flag; });
            if (duty != undefined) {   
                self.editDuty.id = duty.flag; 
                //self.editDuty.data = JSON.parse(JSON.stringify(duty.t_duty_title));

                var title = duty.t_duty_title;
                if (title) {
                    var title_length = title.length;
                    if (title_length != 0) {
                        for (var iTitle = 0; iTitle < title_length; iTitle++)
                        {
                            (function(iTitle)
                            {
                                if (title[iTitle].mainItem) {
                                    var main = {
                                        id: (iTitle + 1),
                                        section: false,
                                        active: false,
                                        collapse: false,
                                        content: title[iTitle].mainItem,
                                        sub: []
                                    };
                                    if (title[iTitle].subItem) {
                                        var iSub = 0;
                                        title[iTitle].subItem.forEach(function(s){
                                            var sub = {
                                                id: ++iSub,
                                                active: false,
                                                content: s
                                            };
                                            main.sub.push(sub);
                                        });
                                    }
                                    self.editDuty.data.push(main);
                                } else {
                                    var main = {
                                        id: (iTitle + 1),
                                        section: false,
                                        active: false,
                                        collapse: false,
                                        content: '',
                                        sub: []
                                    };
                                    self.editDuty.data.push(main);
                                }
                            })(iTitle); 
                        }
                    } else {
                        var main = {
                            id: 1,
                            section: false,
                            active: false,
                            collapse: false,
                            content: '',
                            sub: []
                        };
                        self.editDuty.data.push(main);
                    }
                    self.editing = true;
                } else { // 內容為空就新增一個主項目
                    var main = {
                        id: 1,
                        section: false,
                        active: false,
                        collapse: false,
                        content: '',
                        sub: []
                    };
                    self.editDuty.data.push(main);
                    self.editing = true;
                }
            }
        },
        // 確認是否取消編輯
        cancelEditDutyConfirm () {
            const self = this;

            var duty = self.dutyData.find(function(d){ return d.flag == self.editDuty.id; });
            if (duty != undefined) { 
                var unit_string = duty.unit_string;
                var title_string = duty.title_string;

                var translateString = '';
                // 如果是英文或簡中 則往下找一層 <font> 之後再取內容
                // 備註: 因為經過 google翻譯後 會在原 tag 之下加入 <font>
                if (self.langCode == 1 || self.langCode == 2)
                    translateString = $('#title_' + self.editDuty.id).find('font')[1].innerHTML;
            }
            // 依目前語言別 產生不同的對話框訊息
            if (title_string && title_string != '') {
                if (self.langCode == 1 || self.langCode == 2)
                    self.confirmMsg = self.$t('__cancelingEdit') + translateString + ', ' + self.$t('__ifConfirm');
                else 
                    self.confirmMsg = self.$t('__cancelingEdit') + unit_string + ' - ' + title_string + self.$t('__duty') + '，' +  self.$t('__ifConfirm');
            } else {
                if (self.langCode == 1 || self.langCode == 2)
                    self.confirmMsg = self.$t('__cancelingEdit') + translateString + ', ' + self.$t('__ifConfirm');
                else 
                    self.confirmMsg = self.$t('__cancelingEdit') + unit_string + self.$t('__duty') + '，' +  self.$t('__ifConfirm');
            }
            
            self.actionEvent = self.cancelEditDuty;
            self.showModalConfirm(self.confirmMsg);
        },
        cancelEditDuty () {
            const self = this;
            $('#confirmModal').modal('hide');

            // clear edit duty
            self.editDuty.id = null;
            self.editDuty.data = []; 
            self.editing = false;            
            // self.updateHeight();
        },
        // 移除換行符號
        removeLineBreak (item) {
            item.content = item.content.replace(/(\r\n\t|\n|\r\t)/gm,"");;
        },
        // 確認是否儲存內容
        updateEditDutyConfirm () {
            const self = this;

            // 檢查內容是否有空白
            var data = self.editDuty.data,
                dataLength = data.length;            
            var isEmpty = false;
            data.forEach(function(m){
                var tMain = m.content.replace(/\s/g, '');
                if (tMain === '' || tMain === ' ') {
                    isEmpty = true;
                }
                m.sub.forEach(function(s){
                    var tSub = s.content.replace(/\s/g, '');
                    if (tSub === '' || tSub === ' ') {
                        isEmpty = true;
                    }
                });
            });
            // if (isEmpty) {
            //     self.responseWhenEmptyContent();
            //     return false;
            // }
            
            var duty = self.dutyData.find(function(d){ return d.flag == self.editDuty.id; });
            if (duty != undefined) { 
                var unit_string = duty.unit_string;
                var title_string = duty.title_string;

                var translateString = '';
                if (self.langCode == 1 || self.langCode == 2)
                    translateString = $('#title_' + self.editDuty.id).find('font')[1].innerHTML;
            }
            // 依目前語言別 產生不同的對話框訊息
            if (title_string && title_string != ''){
                if (self.langCode == 1 || self.langCode == 2)
                    self.confirmMsg = self.$t('__savingEdit') + translateString + ', ' + self.$t('__ifConfirm');
                else 
                    self.confirmMsg = self.$t('__savingEdit') + unit_string + ' - ' + title_string + self.$t('__duty') + '，' +  self.$t('__ifConfirm');
            }
            else {
                if (self.langCode == 1 || self.langCode == 2)
                    self.confirmMsg = self.$t('__savingEdit') + translateString + ', ' + self.$t('__ifConfirm');
                else 
                    self.confirmMsg = self.$t('__savingEdit') + unit_string + self.$t('__duty') + '，' +  self.$t('__ifConfirm');
            }

            self.actionEvent = self.updateEditDuty;
            self.showModalConfirm(self.confirmMsg);
        },
        // 當內容有空白則顯示訊息
        responseWhenEmptyContent () {
            const self = this;
            
            self.showModalMsg(self.$t('__hasEmptyContent'));
        },
        updateEditDuty () {
            const self = this;            
            // self.loading = true;
            $('#confirmModal').modal('hide'); 

            // prepare duty data json
            var duty = self.dutyData.find(function(d){ return d.flag == self.editDuty.id; });
            if (duty != undefined)
            {   
                var duty_title = [];
                self.editDuty.data.forEach(function(m){
                    var main = {
                        mainItem: m.content,
                        subItem: []
                    };                    
                    m.sub.forEach(function(s){
                        main.subItem.push(s.content); 
                    });
                    duty_title.push(main);
                });

                var testJSON = {
                    result: 1,
                    msg: '',
                    data: [
                        {
                            i_position_id: 0,
                            i_duty_id: 588,
                            o_unit_id: 19,
                            c_title_id: 0,
                            s_duty: 10635,
                            t_duty_title: duty_title
                        }
                    ]
                };
                self.setDutyData(testJSON);
                self.cancelEditDuty();

                // var lang = (self.langCode == 0 || self.langCode == 2)? 0 : 1;
                // var parameter = {
                //     gLanguage: lang,
                //     ary_duty: [
                //         {
                //             i_position_id: duty.i_position_id,
                //             i_duty_id: duty.i_duty_id,
                //             s_duty: duty.s_duty,
                //             t_duty_title: duty_title
                //         }
                //     ]
                // };

                // let data = new FormData;
                // data.append('data', JSON.stringify(parameter)); 

                // self.axios.post(
                //     `${self.apiPath}/personal_management/duty_update.php?${self.queryString}`,
                //     data
                // ).then(response => {
                //     // console.log(data);
                //     self.loading = false;
                //     self.updateEditDutyResponse(response.data);
                // }).catch(error => {
                //     // console.log(error);
                // });
            }
        },        
        updateEditDutyResponse (data) {
            const self = this;
            //console.log(data.result);

            self.cancelEditDuty();
            if (data.msg == 103) {                
                //self.responseMsg = self.$t('__success');
                setTimeout(function(){
                    sysDisplayMessage(0, 1, 0, '', null, self.$t('__success'), false, 0, null, null);
                }, 300); 
            } else { // if (data.msg == -103)
                //self.responseMsg = self.$t('__failed');
                setTimeout(function(){
                    sysDisplayMessage(0, -1, data.msg, '', null, self.$t('__failed'), false, 0, null, null);
                }, 300);                 
            }
            //$('#responseModal').modal('show'); 
            self.getDutyData();
        },

        // 對話框確認動作
        confirmAction () {
            console.log('confirmAction')
            const self = this;

            self.actionEvent();
        },
        // 顯示對話框(一般訊息)
        showModalMsg (data) {
            const self = this;

            self.responseMsg = data;
            $('#responseModal').modal('show'); 
        },
        // 顯示對話框(確認)
        showModalConfirm (data) {
            const self = this;

            self.confirmMsg = data;
            $('#confirmModal').modal('show'); 
        },        
        
        // 傳訊息至上一層更新高度
        updateHeight () {
            // call parent to rebuild iframe's height
            // default: document.body.scrollHeight 
            var currentHeight = $('.duty-container').innerHeight();
            window.parent.postMessage('{"event": "changeHeight", "value": ' + currentHeight + '}', '*'); 
        }
    },
    computed: {
        ...mapState([
            'queryString',
            'isLocal',
            'apiPath',
            'langCode'
        ]), 
    }
}
</script>

<style>
@import './assets/css/duty-edit.css';
</style>
