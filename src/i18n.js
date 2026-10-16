import { reactive, computed } from 'vue'

const translations = reactive({
  zh: {
    // Nav
    nav: {
      home: '首页',
      about: '关于',
      skills: '技能',
      projects: '作品',
      contact: '联系',
    },
    // Hero
    hero: {
      greeting: '你好，我是',
      name: '以瀚丫',
      roles: ['插画师', '角色设计师', '场景插画师', '概念艺术家'],
      subtitle: '用画笔描绘世界，用色彩讲述故事',
      cta1: '查看作品',
      cta2: '联系我',
      scroll: '向下滚动',
    },
    // About
    about: {
      title: '关于我',
      subtitle: '了解我的故事',
      bio1: '你好！我是一名拥有 5 年经验的插画师，专注于角色设计与场景插画。从概念草图到成品交付，我热衷于将每一个故事化为视觉艺术。',
      bio2: '我相信优秀的插画不仅仅是技法的展示，更是情感与想象的完美交融。每一笔色彩、每一个光影都值得用心雕琢。',
      stats: [
        { number: '5+', label: '年经验' },
        { number: '200+', label: '幅作品' },
        { number: '50+', label: '合作客户' },
        { number: '10+', label: '展览/出版' },
      ],
    },
    // Skills
    skills: {
      title: '创作技能',
      subtitle: '我的工具与专长',
      categories: {
        illustration: '插画绘制',
        digital: '数字绘画',
        traditional: '传统媒介',
        animation: '动画与3D',
      },
      items: {
        illustration: [
          { name: '角色设计', level: 95 },
          { name: '场景插画', level: 92 },
          { name: '概念艺术', level: 88 },
          { name: '儿童插画', level: 85 },
        ],
        digital: [
          { name: 'Procreate', level: 95 },
          { name: 'Photoshop', level: 90 },
          { name: 'Clip Studio Paint', level: 88 },
          { name: 'SAI', level: 80 },
        ],
        traditional: [
          { name: '水彩', level: 85 },
          { name: '彩铅', level: 82 },
          { name: '丙烯', level: 75 },
          { name: '马克笔', level: 78 },
        ],
        animation: [
          { name: 'After Effects', level: 75 },
          { name: 'Blender 3D', level: 70 },
          { name: 'Spine 2D', level: 78 },
          { name: 'Live2D', level: 72 },
        ],
      },
    },
    // Projects
    projects: {
      title: '精选作品',
      subtitle: '我引以为豪的创作',
      filters: {
        all: '全部',
        illustration: '插画',
        character: '角色',
        scene: '场景',
        commercial: '商业',
      },
      items: [
        {
          title: '春日少女',
          category: 'character',
          categoryLabel: '角色',
          desc: '原创角色设计，春日主题，柔和色调搭配细腻光影',
          tech: ['Procreate', '角色设计', '数字绘画'],
        },
        {
          title: '星空之城',
          category: 'scene',
          categoryLabel: '场景',
          desc: '奇幻场景插画，星空下的城市，梦幻氛围',
          tech: ['Photoshop', '场景插画', '概念艺术'],
        },
        {
          title: '童话说书人',
          category: 'illustration',
          categoryLabel: '插画',
          desc: '儿童绘本插画系列，温暖的水彩风格',
          tech: ['水彩', '手绘', '儿童插画'],
        },
        {
          title: '品牌IP形象',
          category: 'commercial',
          categoryLabel: '商业',
          desc: '商业IP角色设计，从概念到完整视觉系统',
          tech: ['Illustrator', '角色设计', '品牌设计'],
        },
        {
          title: '森林精灵',
          category: 'character',
          categoryLabel: '角色',
          desc: '奇幻风格角色设计，精灵族设定，细节丰富',
          tech: ['Clip Studio Paint', '概念艺术', '角色设计'],
        },
        {
          title: '未来都市',
          category: 'scene',
          categoryLabel: '场景',
          desc: '赛博朋克风格场景插画，霓虹灯下的未来城市',
          tech: ['Photoshop', '场景插画', '概念艺术'],
        },
      ],
      viewMore: '查看详情',
    },
    // Contact
    contact: {
      title: '联系我',
      subtitle: '让我们一起创造精彩',
      name: '姓名',
      email: '邮箱',
      message: '留言',
      send: '发送消息',
      sent: '消息已发送！',
      placeholderName: '你的名字',
      placeholderEmail: 'your@email.com',
      placeholderMessage: '想说的话...',
      info: '联系方式',
      location: '中国 · 北京',
      emailLabel: '邮箱',
      phoneLabel: '电话',
      social: '社交媒体',
      email: 'contact@example.com',
      phone: '+86 138 0000 0000',
      socials: [
        { name: 'Behance', icon: '🎨', url: '#' },
        { name: 'ArtStation', icon: '🖼️', url: '#' },
        { name: 'Instagram', icon: '📸', url: '#' },
        { name: 'Weibo', icon: '📱', url: '#' },
      ],
    },
    // Footer
    footer: {
      rights: '保留所有权利',
      madeWith: '用 ❤️ 与画笔打造',
    },
  },

  en: {
    nav: {
      home: 'Home',
      about: 'About',
      skills: 'Skills',
      projects: 'Work',
      contact: 'Contact',
    },
    hero: {
      greeting: "Hi, I'm",
      name: 'Hanya Yi',
      roles: ['Illustrator', 'Character Designer', 'Scene Illustrator', 'Concept Artist'],
      subtitle: 'Painting worlds with brushstrokes, telling stories with colors',
      cta1: 'View My Work',
      cta2: 'Get In Touch',
      scroll: 'Scroll Down',
    },
    about: {
      title: 'About Me',
      subtitle: 'My Story',
      bio1: "Hello! I'm an illustrator with 5 years of experience, specializing in character design and scene illustration. From concept sketches to final delivery, I'm passionate about turning every story into visual art.",
      bio2: 'I believe great illustration is not just about technique — it\'s the perfect fusion of emotion and imagination. Every brushstroke, every light and shadow deserves careful crafting.',
      stats: [
        { number: '5+', label: 'Years Exp' },
        { number: '200+', label: 'Artworks' },
        { number: '50+', label: 'Clients' },
        { number: '10+', label: 'Exhibitions' },
      ],
    },
    skills: {
      title: 'Creative Skills',
      subtitle: 'Tools & Expertise',
      categories: {
        illustration: 'Illustration',
        digital: 'Digital Painting',
        traditional: 'Traditional Media',
        animation: 'Animation & 3D',
      },
      items: {
        illustration: [
          { name: 'Character Design', level: 95 },
          { name: 'Scene Illustration', level: 92 },
          { name: 'Concept Art', level: 88 },
          { name: 'Children Illustration', level: 85 },
        ],
        digital: [
          { name: 'Procreate', level: 95 },
          { name: 'Photoshop', level: 90 },
          { name: 'Clip Studio Paint', level: 88 },
          { name: 'SAI', level: 80 },
        ],
        traditional: [
          { name: 'Watercolor', level: 85 },
          { name: 'Colored Pencil', level: 82 },
          { name: 'Acrylic', level: 75 },
          { name: 'Marker', level: 78 },
        ],
        animation: [
          { name: 'After Effects', level: 75 },
          { name: 'Blender 3D', level: 70 },
          { name: 'Spine 2D', level: 78 },
          { name: 'Live2D', level: 72 },
        ],
      },
    },
    projects: {
      title: 'Featured Work',
      subtitle: 'Creations I\'m Proud Of',
      filters: {
        all: 'All',
        illustration: 'Illustration',
        character: 'Character',
        scene: 'Scene',
        commercial: 'Commercial',
      },
      items: [
        {
          title: 'Spring Girl',
          category: 'character',
          categoryLabel: 'Character',
          desc: 'Original character design with spring theme, soft colors and delicate lighting',
          tech: ['Procreate', 'Character Design', 'Digital Painting'],
        },
        {
          title: 'City of Stars',
          category: 'scene',
          categoryLabel: 'Scene',
          desc: 'Fantasy scene illustration, city under starry sky with dreamy atmosphere',
          tech: ['Photoshop', 'Scene Illustration', 'Concept Art'],
        },
        {
          title: 'Storyteller',
          category: 'illustration',
          categoryLabel: 'Illustration',
          desc: 'Children\'s picture book illustration series, warm watercolor style',
          tech: ['Watercolor', 'Hand-drawn', 'Children Illustration'],
        },
        {
          title: 'Brand Mascot',
          category: 'commercial',
          categoryLabel: 'Commercial',
          desc: 'Commercial IP character design, from concept to complete visual system',
          tech: ['Illustrator', 'Character Design', 'Brand Design'],
        },
        {
          title: 'Forest Spirit',
          category: 'character',
          categoryLabel: 'Character',
          desc: 'Fantasy character design, elf setting, rich in details',
          tech: ['Clip Studio Paint', 'Concept Art', 'Character Design'],
        },
        {
          title: 'Future City',
          category: 'scene',
          categoryLabel: 'Scene',
          desc: 'Cyberpunk scene illustration, neon-lit futuristic city',
          tech: ['Photoshop', 'Scene Illustration', 'Concept Art'],
        },
      ],
      viewMore: 'View Details',
    },
    contact: {
      title: 'Get In Touch',
      subtitle: 'Let\'s Create Something Amazing',
      name: 'Name',
      email: 'Email',
      message: 'Message',
      send: 'Send Message',
      sent: 'Message Sent!',
      placeholderName: 'Your name',
      placeholderEmail: 'your@email.com',
      placeholderMessage: 'Your message...',
      info: 'Contact Info',
      location: 'Beijing, China',
      emailLabel: 'Email',
      phoneLabel: 'Phone',
      social: 'Social',
      email: 'contact@example.com',
      phone: '+86 138 0000 0000',
      socials: [
        { name: 'Behance', icon: '🎨', url: '#' },
        { name: 'ArtStation', icon: '🖼️', url: '#' },
        { name: 'Instagram', icon: '📸', url: '#' },
        { name: 'Weibo', icon: '📱', url: '#' },
      ],
    },
    footer: {
      rights: 'All rights reserved',
      madeWith: 'Made with ❤️ & Brushes',
    },
  },
})

const state = reactive({
  locale: 'zh',
})

export const i18n = {
  get locale() {
    return state.locale
  },
  set locale(val) {
    state.locale = val
  },
  toggle() {
    state.locale = state.locale === 'zh' ? 'en' : 'zh'
  },
  t: computed(() => translations[state.locale]),
  translations,
}
