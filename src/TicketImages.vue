<script setup>
import {ref} from 'vue'
defineProps({images:{type:Array,default:()=>[]}})
const preview=ref(null)
const url=id=>'/api/support?action=image&id='+encodeURIComponent(id)
</script>
<template>
  <div v-if="images.length" class="ticket-images">
    <button v-for="image in images" :key="image.id" type="button" class="image-thumbnail" @click="preview=image" :aria-label="'查看图片：'+image.name">
      <img :src="url(image.id)" :alt="image.name" loading="lazy"><span>{{image.name}}</span>
    </button>
  </div>
  <Teleport to="body"><div v-if="preview" class="modal image-preview" role="dialog" aria-modal="true" aria-label="问题截图" @click.self="preview=null" @keydown.esc="preview=null">
    <div class="card"><button type="button" class="quiet" autofocus @click="preview=null">关闭图片</button><p>{{preview.name}}</p><img :src="url(preview.id)" :alt="preview.name"></div>
  </div></Teleport>
</template>
