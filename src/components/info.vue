<template>
  <div>
    <p>检索组件</p>
    <p>identityEntryId: "3"</p>
    <p>identityEntryName: "医保卡"</p>
    <p>identityTypeCode: ['152691']</p>
    <p>indexSearchMethodId: "3"</p>

    <p>identityEntryId: "2"</p>
    <p>identityEntryName: "身份证"</p>
    <p>identityTypeCode: ['152695']</p>
    <p>indexSearchMethodId: "2"</p>

    <p>identityEntryId: "1674658815060501860"</p>
    <p>identityEntryName: "异地读卡"</p>
    <p>identityTypeCode: ['']</p>
    <p>indexSearchMethodId: "1674658815060501860"</p>

    <p>identityEntryId: "1674373200796171589"</p>
    <p>identityEntryName: "医保读卡"</p>
    <p>identityTypeCode: ['152691']</p>
    <p>indexSearchMethodId: "1674373200796171589"</p>

    <p>identityEntryId: "1699585728534648358"</p>
    <p>identityEntryName: "外国人永久居留身份证"</p>
    <p>identityTypeCode: ['399668724']</p>
    <p>indexSearchMethodId: "1699585728534648358"</p>
  </div>
</template>
<script setup lang="ts">
let a = [
  {
    name: '检索组件',
    key: 'identityTypeCode',
    item: [
      {
        label: '医保卡',
        value: {
          identityEntryId: '3',
          identityEntryName: '医保卡',
          identityTypeCode: '152691',
          indexSearchMethodId: '3'
        }
      },
      {
        label: '身份证',
        value: {
          identityEntryId: '2',
          identityEntryName: '医保卡',
          identityTypeCode: '152695',
          indexSearchMethodId: '2'
        }
      },
      {
        label: '异地读卡',
        value: {
          identityEntryId: '1674658815060501860',
          identityEntryName: '异地读卡',
          identityTypeCode: '',
          indexSearchMethodId: '1674658815060501860'
        }
      },
      {
        label: '医保读卡',
        value: {
          identityEntryId: '1674373200796171589',
          identityEntryName: '医保读卡',
          identityTypeCode: '152691',
          indexSearchMethodId: '1674373200796171589'
        }
      },
      {
        label: '外国人永久居留身份证',
        value: {
          identityEntryId: '1699585728534648358',
          identityEntryName: '外国人永久居留身份证',
          identityTypeCode: '399668724',
          indexSearchMethodId: '1699585728534648358'
        }
      }
    ]
  },
  {
    name: '排班状态',
    key: 'scheduleStatus',
    item: [
      {
        label: '新排班',
        value: '376438'
      },
      {
        label: '已发布号源',
        value: '376439'
      },
      {
        label: '医生已替诊',
        value: '376440'
      },
      {
        label: '医生已停诊',
        value: '376441'
      }
    ]
  },
  {
    name: '就诊登记状态',
    key: 'encounterRegisterStatus',
    item: [
      {
        label: '预约登记',
        value: '255876'
      },
      {
        label: '挂号登记',
        value: '256712'
      },
      {
        label: '预约取号',
        value: '436416'
      },
      {
        label: '预约登记取消',
        value: '256711'
      },
      {
        label: '挂号登记取消',
        value: '256713'
      }
    ]
  },
  {
    name: '限号方式',
    key: 'registerNumberLimitCode',
    item: [
      {
        label: '限制挂号',
        value: '376431'
      },
      {
        label: '不限号',
        value: '376429'
      },
      {
        label: '仅提醒不限制挂号',
        value: '376429'
      }
    ]
  },
  {
    name: '挂号登记状态',
    key: '',
    item: [
      {
        label: '',
        value: ''
      }
    ]
  },
  {
    name: '',
    key: 'hospitalAreaId',
    item: [
      {
        label: '',
        value: ''
      }
    ]
  },
  {
    name: '',
    key: 'encounterType',
    item: [
      {
        label: '',
        value: ''
      }
    ]
  }
]
</script>
