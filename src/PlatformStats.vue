<script setup>
import {computed,ref,watch} from 'vue'
import {ticketStats,csvCell} from './support-stats.js'
import {platformLabel} from './platforms.js'
const props=defineProps({tickets:Array,platforms:Array})
const emit=defineEmits(['resolve'])
const platform=ref('*'),start=ref(''),end=ref(''),status=ref('all'),query=ref(''),detailKey=ref(null)
const invalid=computed(()=>!!start.value&&!!end.value&&start.value>end.value)
const report=computed(()=>ticketStats(invalid.value?[]:props.tickets,{platform:platform.value==='*'?null:platform.value,start:start.value,end:end.value,status:status.value,query:query.value}))
const options=computed(()=>[...new Set([...props.platforms.map(p=>p.name),...props.tickets.map(t=>t.platform).filter(Boolean)])].sort((a,b)=>a.localeCompare(b,'zh-CN')))
const detail=computed(()=>report.value.issues.find(i=>i.key===detailKey.value))
watch([platform,start,end,status,query],()=>detailKey.value=null)
const date=value=>new Date(value).toLocaleString('zh-CN',{timeZone:'Asia/Shanghai',hour12:false})
function download(){const rows=[['平台','问题','反馈次数','待处理','处理成功','最后反馈时间'],...report.value.issues.map(i=>[platformLabel(i.platform),i.question,i.total,i.pending,i.resolved,date(i.latest)])];const blob=new Blob(['\uFEFF'+rows.map(row=>row.map(csvCell).join(',')).join('\r\n')],{type:'text/csv;charset=utf-8'});const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='平台问题统计.csv';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)}
</script>
<template>
<section><div class="heading"><div><h1>平台问题统计</h1><p>按反馈时间（北京时间）统计，每次提交计一次；相同平台、相同问题文本合并统计。</p></div><button class="quiet" :disabled="!report.total" @click="download">导出问题统计 CSV</button></div>
<div class="card"><div class="row"><label>统计平台<select v-model="platform"><option value="*">全部平台</option><option value="">未指定平台</option><option v-for="p in options" :key="p" :value="p">{{platformLabel(p)}}</option></select></label><label>开始日期<input type="date" v-model="start"></label><label>结束日期<input type="date" v-model="end"></label><label>处理状态<select v-model="status"><option value="all">全部状态</option><option value="pending">待处理</option><option value="resolved">处理成功</option></select></label></div><label>问题关键词<input v-model="query" placeholder="筛选问题、识图文字或最终回复"></label><p v-if="invalid" role="alert">开始日期不能晚于结束日期。</p></div>
<div class="stat-cards"><div class="card"><small>反馈总数</small><strong>{{report.total}}</strong></div><div class="card"><small>待处理</small><strong>{{report.pending}}</strong></div><div class="card"><small>处理成功</small><strong>{{report.resolved}}</strong></div><div class="card"><small>处理率</small><strong>{{report.total?(report.resolved/report.total*100).toFixed(1)+'%':'—'}}</strong></div></div>
<h2>平台反馈汇总</h2><div class="table-wrap"><table><thead><tr><th>平台</th><th>反馈次数</th><th>问题种类</th><th>待处理</th><th>处理成功</th><th>处理率</th><th>最后反馈</th><th>操作</th></tr></thead><tbody><tr v-for="p in report.platforms" :key="p.platform"><td>{{platformLabel(p.platform)}}</td><td>{{p.total}}</td><td>{{p.issueCount}}</td><td>{{p.pending}}</td><td>{{p.resolved}}</td><td>{{(p.resolved/p.total*100).toFixed(1)}}%</td><td>{{date(p.latest)}}</td><td><button class="quiet" @click="platform=p.platform">查看问题</button></td></tr><tr v-if="!report.platforms.length"><td colspan="8">当前条件下暂无反馈。</td></tr></tbody></table></div>
<h2>问题反馈明细（按次数排序）</h2><div class="table-wrap"><table><thead><tr><th>平台</th><th>问题</th><th>反馈次数</th><th>待处理</th><th>处理成功</th><th>最后反馈</th><th>操作</th></tr></thead><tbody><tr v-for="i in report.issues" :key="i.key"><td>{{platformLabel(i.platform)}}</td><td class="question-cell">{{i.question}}</td><td>{{i.total}}</td><td>{{i.pending}}</td><td>{{i.resolved}}</td><td>{{date(i.latest)}}</td><td><button class="quiet" @click="detailKey=i.key">反馈记录</button></td></tr><tr v-if="!report.issues.length"><td colspan="7">当前条件下暂无问题。</td></tr></tbody></table></div>
<div v-if="detail" class="modal"><div class="card modal-content"><div class="section-title"><h2>反馈记录</h2><button class="quiet" @click="detailKey=null">关闭记录</button></div><p>{{platformLabel(detail.platform)}} · {{detail.question}}</p><article class="card" v-for="t in detail.tickets" :key="t.id"><small>#{{t.id}} · {{t.author}} · {{date(t.created_at)}} · {{t.resolved?'处理成功':'待处理'}}</small><p>{{t.question}}</p><p v-if="t.answer">最终回复：{{t.answer}}</p><button class="quiet" @click="detailKey=null;emit('resolve',t)">{{t.resolved?'查看 / 修改回复':'处理问题'}}</button></article></div></div>
</section>
</template>
