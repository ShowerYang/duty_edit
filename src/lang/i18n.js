import Vue from 'vue';
import VueI18n from 'vue-i18n';
import en from './en/lang';
import cn from './cn/lang';
import tw from './tw/lang';

Vue.use(VueI18n);

// set lang
const locale = (localStorage.lang == 'en')? 'en' : (localStorage.lang == 'zh-CN')? 'cn' : 'tw';

// create i18n
const i18n = new VueI18n({
  locale,
  messages: { en, cn, tw }
});

export default i18n;