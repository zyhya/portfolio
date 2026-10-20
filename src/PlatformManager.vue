<script setup>
import {ref} from 'vue'
import {COMMON_PLATFORM,platformLabel} from './platforms.js'
defineProps({platforms:Array,busy:Boolean,message:String})
const emit=defineEmits(['save'])
const editing=ref(null)
const create=()=>editing.value={name:'',notes:'',active:true}
function submit(){emit('save',{...editing.value},()=>editing.value=null)}
</script>
<template>
<section><div class="heading"><div><h1>平台字典</h1><p>统一维护平台名称。停用后不再供客服新选，历史知识和反馈保留。</p></div><button class="primary" :disabled="busy" @click="create">新增平台</button></div>
<div class="table-wrap"><table><thead><tr><th>平台名称</th><th>说明</th><th>状态</th><th>操作</th></tr></thead><tbody><tr v-for="p in platforms" :key="p.id"><td>{{platformLabel(p.name)}}</td><td>{{p.notes||'—'}}</td><td>{{p.active?'启用':'停用'}}</td><td><button v-if="p.name!==COMMON_PLATFORM" class="quiet" :disabled="busy" @click="editing={...p}">编辑平台</button><span v-else>系统通用分类</span></td></tr></tbody></table></div>
<div v-if="editing" class="modal"><form class="card modal-content" @submit.prevent="submit"><h2>{{editing.id?'编辑平台':'新增平台'}}</h2><label>平台名称<input v-model="editing.name" required maxlength="200"></label><label>说明<textarea v-model="editing.notes" maxlength="1000" rows="3"></textarea></label><label class="check"><input type="checkbox" v-model="editing.active">启用，允许客服选择</label><p class="hint">修改名称会同步现有知识和问题记录的平台名称。</p><p v-if="message" role="alert">{{message}}</p><div class="row"><button class="primary" :disabled="busy">保存平台</button><button type="button" class="quiet" :disabled="busy" @click="editing=null">取消</button></div></form></div>
</section>
</template>
