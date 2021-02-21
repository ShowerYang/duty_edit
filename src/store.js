import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)


// initial query string
var queryString = null;
try {
  queryString = query_string;
} catch (e) { 
  // console.log(e);
}

var isLocal = (location.host.indexOf('localhost') != -1)? true : false;
var apiPath = (isLocal)? `` : `//${location.host}`;

// lang
var langCode = 0;
if (localStorage.lang == "en") {
  langCode = 1;
} else if (localStorage.lang == "zh-CN") {
  langCode = 2;
} 

export default new Vuex.Store({
  state: {
    // query string
    queryString: queryString,
    // api  
    isLocal: isLocal,
    apiPath: apiPath,
    // lang
    langCode: langCode
  },
  mutations: {
    // query string
    setQueryString (state, value) {
      state.queryString = value;
    },
    // api 
    setIsLocal (state, value) {
      state.isLocal = value;
    },    
    setApiPath (state, value) {
      state.apiPath = value;
    },
    // lang
    setLangCode (state, value) {
      state.langCode = value;
    },
  },
  actions: {

  }
})
