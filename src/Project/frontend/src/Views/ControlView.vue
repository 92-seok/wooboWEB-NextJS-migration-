<template>
    <v-container>
        <v-select v-model="areaList" :items="control" :menu-props="{ scrim: true, scrollStrategy: 'close' }" label="지역"
            @update:model-value="OnChange_AreaList" />
        <!--
      <v-autocomplete :items="areaList" label="지역" chips multiple>
        <template v-slot:subheader="{ props }">
          <v-list-subheader class="font-weight-bold bg-primary">{{ props.title }}</v-list-subheader>
        </template>
</v-autocomplete>
-->
    </v-container>

    <v-card flat>

        <!-- 검색창 -->
        <v-card-title class="d-flex align-center pe-2">
            <v-icon icon="mdi-list-box-outline"></v-icon> &nbsp;
            장비 목록
            <v-spacer></v-spacer>

            <v-text-field v-model="search" density="compact" label="장비 검색" prepend-inner-icon="mdi-magnify"
                variant="outlined" flat hide-details />
        </v-card-title>

        <!-- 프로그레스 타이머 -->
        <v-progress-linear color="primary" v-model="process_time" :height="5" max="30" />

        <v-divider />

        <v-card height="30">

        </v-card>

        <v-divider />

        <!-- 데이터 테이블 -->
        <v-data-table :search="search" :filter-keys="['NM_DIST_OBSV']" :items="control" :headers="headers"
            :header-props="{ align: 'center', style: 'font-weight: bold;' }" :cell-props="{ align: 'center' }"
            :mobile-breakpoint="0" density="compact" class="table-fit pa-0" items-per-page="50"
            items-per-page-text="페이지당 표시 수" v-model:page="page" v-model:items-per-page="itemsPerPage">

            <template v-slot:[`item.index`]="{ index }">
                {{ index + 1 + (page - 1) * itemsPerPage }}
            </template>

            <template v-slot:[`item.GB_OBSV`]="{ item }">
                <th style="width:10px" />
                <v-card class="my-2" elevation="0">
                    <div v-if="item.GB_OBSV === '17'">
                        <v-img :src="require('@/assets/broad.png')" height="30" />
                    </div>
                    <div v-if="item.GB_OBSV === '18'">
                        <v-img :src="require('@/assets/display.png')" height="30" />
                    </div>
                    <div v-if="item.GB_OBSV === '20'">
                        <v-img :src="require('@/assets/gate.png')" height="30" />
                    </div>
                </v-card>
            </template>

            <template v-slot:[`item.NM_DIST_OBSV`]="{ item }">
                <!-- activator 슬롯 -->
                <v-btn @click="openGuideDialog(item)">
                    <strong>{{ item.NM_DIST_OBSV }}</strong>
                </v-btn>


            </template>
      
            <template v-slot:[`item.LastStatus`]="{ item }">
                <div class="text-center">
                    <v-chip class="text-uppercase" :color="item.LastStatus == 'OK' ? 'green' : 'red'"
                        :text="item.LastStatus == 'OK' ? '정상' : '점검필요'" size="x-small" label></v-chip>
                </div>
            </template>

            <template v-slot:[`item.sensorTest`]="{ item }">
                <div class="text-center">
                    <v-btn variant="outlined" :color="item.LastStatus == 'OK' ? 'green' : 'red'"
                        :text="item.sensorTest == 'OK' ? '' : ''" size="x-small" label>
                        테스트하기
                    </v-btn>
                </div>
            </template>


        </v-data-table>
    </v-card>
    <!-- Snackbar -->
    <v-snackbar v-model="snackbar.show" :timeout="2000" location="bottom">
        {{ snackbar.message }}
    </v-snackbar>

    <!-- 다이얼로그는 v-data-table 바깥에 위치 -->
    <v-dialog v-model="dialog">
        <v-card prepend-icon="mdi-map-marker" title="길안내를 시작할까요?">
            <v-card-text class="text-center" v-if="selectedItem">
                <strong>{{ selectedItem.NM_DIST_OBSV }}({{ selectedItem.DTL_ADRES }})</strong>로 길안내를 시작하시겠습니까?
            </v-card-text>
            <template v-slot:actions>
                <v-spacer></v-spacer>
                <v-btn @click="dialog = false">아니오</v-btn>
                <v-btn color="primary" @click="showSnackbar(selectedItem)">네</v-btn>
            </template>
        </v-card>
    </v-dialog>

</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, reactive } from 'vue'
import axios from 'axios'


let refresh_timer; // setInterval 핸들러
const process_time = ref(30);

const areaList = ref([])
const search = ref('')
// const devices = ref([])
const control = ref([])
const areaList_selected = ref('%')
const selectedItem = ref(null)

const page = ref(1)
const itemsPerPage = ref(50)
const os = ref(navigator.userAgent);
onMounted(async () => {

    console.log(os.value);
    refresh_timer = setInterval(OnTimer_Refresh, 1000);
    OnTimer_Refresh();
    await Process();

    const response = await axios.get('/api/control')
    control.value = response.data.data
})


onBeforeUnmount(() => {
    if (refresh_timer) {
        clearInterval(refresh_timer);
    }
})

const snackbar = reactive({
    show: false,
    message: ''
})

function openGuideDialog(item) {
    console.log(item);
    selectedItem.value = item
    dialog.value = true
}

function showSnackbar(item) {
    snackbar.message = `${item.NM_DIST_OBSV}`
    snackbar.show = true;
    dialog.value = false;
    let url = "";



    if (os.value.indexOf("Android") > 0) {
        url = `intent://place?lat=${item.LAT}&lng=${item.LON}&zoom=12&name=${encodeURIComponent(item.NM_DIST_OBSV)}&appname=com.example.myapp#Intent;scheme=nmap;action=android.intent.action.VIEW;category=android.intent.category.BROWSABLE;package=com.nhn.android.nmap;end`;
    }
    else if (os.value.indexOf("iPhone") > 0) {
        url = `market://details?id=com.nhn.android.nmap`;
    }
    else {
        url = `https://map.naver.com/directions?lat=${item.LAT}&lng=${item.LNG}`;
        url = `https://map.naver.com/p/search/${item.DTL_ADRES}?c=11.00,0,0,0,dh`;
    }

    console.log(url);
    window.location.href = url;
    /*
      //if (isAndroid) {
        
    
        setTimeout(() => {
          window.location.href = playStoreUrl;
        }, 1000);
      } else {
        window.location.href = webNaverMapUrl;
      }
    */
}

const dialog = ref(false)

// function showTooltip(item) {
//     item.tooltip = true
//     setTimeout(() => {
//         item.tooltip = false
//     }, 2000) // 2초 후 자동 닫힘
// }

const OnTimer_Refresh = async () => {
    process_time.value--;
    if (process_time.value == 0) {
        await Process();
        process_time.value = 30;
    }
}

const Process = async () => {
    console.log("Process()");

    const response_areaList = await axios.get('/api/areaList');

    areaList.value = response_areaList.data.data.map(item => ({
        title: item.RM, value: item.ADMCODE
    }))

    console.log(areaList.value);

    await OnChange_AreaList();

};

const OnChange_AreaList = async () => {
    try {
        const response = await axios.get(`/api/control?BDONG_CD=${areaList_selected.value}`)
        control.value = response.data.data
        //console.log(devices.value);
        
    } catch (err) {
        console.log('데이터를 가져오는 중 오류 발생: ', err)
    }
}


const headers = [
    { key: 'index', title: '', width: '50px', sortable: true },
    { key: 'GB_OBSV', title: '종류', width: '50px', },
    { key: 'NM_DIST_OBSV', title: '장비명', },
    // { key: 'LastDate', title: '통신시간', },
    { key: 'LastStatus', title: '통신상태', },
    { key: 'sensorTest', title: '장비테스트', },
]
</script>

<style lang="scss" scoped>
// scss를 이용하여 커스터마이징
// scss 문법으로 :deep을 주어 해당 태그에 직접 접근하여 css 덮어쓰기
.table-fit {
    font-size: 0.8rem;

    :deep(table) {
        width: 100%;
        table-layout: fixed;
    }

    :deep(.v-table__wrapper) {
        padding-left: 0 !important;
        padding-right: 0 !important;
    }

    :deep(.v-data-table__th),
    :deep(.v-data-table__td) {
        text-align: center;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        padding: 0 !important;
    }


    :deep(.v-data-table-footer__items-per-page > .v-select) {
        color: red;
    }
}

:deep(.v-card-text) {
    padding-left: 0 !important;
    padding-right: 0 !important;
}

.search-box {
    max-width: 250px;
    /* 폭 줄이기 */
    font-size: 0.8rem;
    /* 글자 크기 줄이기 */
}

:deep(.search-box .v-field) {
    min-height: 32px;
    /* 입력창 높이 줄이기 */
}

/* 열 개수에 따라 자동 균등 분배 */


/* 반응형 크기 조절 */
@media (max-width: 768px) {
    .table-fit {
        font-size: 1rem;
    }

    .table-fit th,
    .table-fit td {
        padding: 4px 6px;
    }
}

@media (max-width: 480px) {
    .table-fit {
        font-size: 0.6rem;
    }

    .table-fit th,
    .table-fit td {
        padding: 2px 4px;
    }
}
</style>
