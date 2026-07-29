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
      name: '张明',
      roles: ['前端开发工程师', 'UI/UX 设计师', '创意开发者', '开源爱好者'],
      subtitle: '用代码编织视觉，用设计驱动体验',
      cta1: '查看作品',
      cta2: '联系我',
      scroll: '向下滚动',
    },
    // About
    about: {
      title: '关于我',
      subtitle: '了解我的故事',
      bio1: '你好！我是一名拥有 5 年经验的前端开发工程师，专注于打造令人惊艳的数字体验。从交互设计到性能优化，我热衷于将创意转化为现实。',
      bio2: '我相信优秀的作品不仅仅是功能的堆砌，更是艺术与技术的完美融合。每一个像素、每一帧动画都值得精心打磨。',
      stats: [
        { number: '5+', label: '年经验' },
        { number: '50+', label: '个项目' },
        { number: '30+', label: '客户' },
        { number: '15k', label: '代码行/月' },
      ],
    },
    // Skills
    skills: {
      title: '专业技能',
      subtitle: '我的技术栈',
      categories: {
        frontend: '前端开发',
        backend: '后端技术',
        design: '设计工具',
        devops: 'DevOps',
      },
      items: {
        frontend: [
          { name: 'Vue.js', level: 95 },
          { name: 'React', level: 90 },
          { name: 'TypeScript', level: 88 },
          { name: 'Tailwind CSS', level: 92 },
        ],
        backend: [
          { name: 'Node.js', level: 85 },
          { name: 'Python', level: 80 },
          { name: 'PostgreSQL', level: 75 },
          { name: 'GraphQL', level: 78 },
        ],
        design: [
          { name: 'Figma', level: 90 },
          { name: 'Photoshop', level: 85 },
          { name: 'Illustrator', level: 80 },
          { name: 'After Effects', level: 70 },
        ],
        devops: [
          { name: 'Docker', level: 82 },
          { name: 'AWS', level: 78 },
          { name: 'CI/CD', level: 85 },
          { name: 'Nginx', level: 80 },
        ],
      },
    },
    // Projects
    projects: {
      title: '精选作品',
      subtitle: '我引以为豪的项目',
      filters: {
        all: '全部',
        web: '网站',
        app: '应用',
        design: '设计',
      },
      items: [
        {
          title: '智能数据看板',
          category: 'web',
          categoryLabel: '网站',
          desc: '实时数据可视化平台，支持自定义图表与拖拽布局',
          tech: ['Vue 3', 'D3.js', 'WebSocket'],
        },
        {
          title: '电商小程序',
          category: 'app',
          categoryLabel: '应用',
          desc: '高性能购物应用，日均访问量 10w+',
          tech: ['Vue 3', 'Vite', 'Pinia'],
        },
        {
          title: '品牌视觉系统',
          category: 'design',
          categoryLabel: '设计',
          desc: '完整的品牌设计规范，涵盖 Logo、色彩、字体',
          tech: ['Figma', 'Illustrator'],
        },
        {
          title: 'AI 写作助手',
          category: 'web',
          categoryLabel: '网站',
          desc: '基于大语言模型的智能写作工具，支持多场景模板',
          tech: ['React', 'Node.js', 'OpenAI'],
        },
        {
          title: '音乐播放器',
          category: 'app',
          categoryLabel: '应用',
          desc: '沉浸式音乐体验，支持可视化频谱与歌词同步',
          tech: ['Vue 3', 'Web Audio', 'Canvas'],
        },
        {
          title: '3D 产品展示',
          category: 'design',
          categoryLabel: '设计',
          desc: '交互式 3D 产品展示页面，360 度全方位查看',
          tech: ['Three.js', 'Blender', 'GSAP'],
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
      location: '中国 · 上海',
      emailLabel: '邮箱',
      phoneLabel: '电话',
      social: '社交媒体',
      email: 'ming.zhang@example.com',
      phone: '+86 138 0000 0000',
      socials: [
        { name: 'GitHub', icon: '🐙', url: '#' },
        { name: 'LinkedIn', icon: '💼', url: '#' },
        { name: 'Twitter', icon: '🐦', url: '#' },
        { name: 'Dribbble', icon: '🏀', url: '#' },
      ],
    },
    // Footer
    footer: {
      rights: '保留所有权利',
      madeWith: '用 ❤️ 与 Vue 3 打造',
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
      name: 'Ming Zhang',
      roles: ['Frontend Developer', 'UI/UX Designer', 'Creative Coder', 'Open Source Enthusiast'],
      subtitle: 'Weaving visuals with code, driving experiences with design',
      cta1: 'View My Work',
      cta2: 'Get In Touch',
      scroll: 'Scroll Down',
    },
    about: {
      title: 'About Me',
      subtitle: 'My Story',
      bio1: "Hello! I'm a frontend developer with 5 years of experience, focused on crafting stunning digital experiences. From interaction design to performance optimization, I'm passionate about turning ideas into reality.",
      bio2: 'I believe great work is not just about stacking features — it\'s the perfect fusion of art and technology. Every pixel, every frame of animation deserves careful refinement.',
      stats: [
        { number: '5+', label: 'Years Exp' },
        { number: '50+', label: 'Projects' },
        { number: '30+', label: 'Clients' },
        { number: '15k', label: 'Lines/Month' },
      ],
    },
    skills: {
      title: 'My Skills',
      subtitle: 'Tech Stack',
      categories: {
        frontend: 'Frontend',
        backend: 'Backend',
        design: 'Design',
        devops: 'DevOps',
      },
      items: {
        frontend: [
          { name: 'Vue.js', level: 95 },
          { name: 'React', level: 90 },
          { name: 'TypeScript', level: 88 },
          { name: 'Tailwind CSS', level: 92 },
        ],
        backend: [
          { name: 'Node.js', level: 85 },
          { name: 'Python', level: 80 },
          { name: 'PostgreSQL', level: 75 },
          { name: 'GraphQL', level: 78 },
        ],
        design: [
          { name: 'Figma', level: 90 },
          { name: 'Photoshop', level: 85 },
          { name: 'Illustrator', level: 80 },
          { name: 'After Effects', level: 70 },
        ],
        devops: [
          { name: 'Docker', level: 82 },
          { name: 'AWS', level: 78 },
          { name: 'CI/CD', level: 85 },
          { name: 'Nginx', level: 80 },
        ],
      },
    },
    projects: {
      title: 'Featured Work',
      subtitle: 'Projects I\'m Proud Of',
      filters: {
        all: 'All',
        web: 'Web',
        app: 'App',
        design: 'Design',
      },
      items: [
        {
          title: 'Smart Dashboard',
          category: 'web',
          categoryLabel: 'Web',
          desc: 'Real-time data visualization platform with custom charts and drag-and-drop layout',
          tech: ['Vue 3', 'D3.js', 'WebSocket'],
        },
        {
          title: 'E-Commerce Mini App',
          category: 'app',
          categoryLabel: 'App',
          desc: 'High-performance shopping app with 100k+ daily visits',
          tech: ['Vue 3', 'Vite', 'Pinia'],
        },
        {
          title: 'Brand Visual System',
          category: 'design',
          categoryLabel: 'Design',
          desc: 'Complete brand design guidelines covering logo, colors, and typography',
          tech: ['Figma', 'Illustrator'],
        },
        {
          title: 'AI Writing Assistant',
          category: 'web',
          categoryLabel: 'Web',
          desc: 'Intelligent writing tool powered by LLMs with multi-scenario templates',
          tech: ['React', 'Node.js', 'OpenAI'],
        },
        {
          title: 'Music Player',
          category: 'app',
          categoryLabel: 'App',
          desc: 'Immersive music experience with visual spectrum and synced lyrics',
          tech: ['Vue 3', 'Web Audio', 'Canvas'],
        },
        {
          title: '3D Product Showcase',
          category: 'design',
          categoryLabel: 'Design',
          desc: 'Interactive 3D product display with 360-degree viewing',
          tech: ['Three.js', 'Blender', 'GSAP'],
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
      location: 'Shanghai, China',
      emailLabel: 'Email',
      phoneLabel: 'Phone',
      social: 'Social',
      email: 'ming.zhang@example.com',
      phone: '+86 138 0000 0000',
      socials: [
        { name: 'GitHub', icon: '🐙', url: '#' },
        { name: 'LinkedIn', icon: '💼', url: '#' },
        { name: 'Twitter', icon: '🐦', url: '#' },
        { name: 'Dribbble', icon: '🏀', url: '#' },
      ],
    },
    footer: {
      rights: 'All rights reserved',
      madeWith: 'Made with ❤️ & Vue 3',
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
