(window.webpackJsonp=window.webpackJsonp||[]).push([[5],{297:function(t,e,n){var content=n(302);content.__esModule&&(content=content.default),"string"==typeof content&&(content=[[t.i,content,""]]),content.locals&&(t.exports=content.locals);(0,n(79).default)("d48b1a92",content,!0,{sourceMap:!1})},301:function(t,e,n){"use strict";n(297)},302:function(t,e,n){var o=n(78)((function(i){return i[1]}));o.push([t.i,"/*purgecss start ignore*/\n.description-text p{\n  margin:15px 0\n}\n\n/*purgecss end ignore*/",""]),o.locals={},t.exports=o},308:function(t,e,n){"use strict";n.r(e);n(22),n(30);var o={name:"FolderDetails",props:["details","name","fake","server"],data:function(){return{}},computed:{image:function(){return this.details&&this.details.cover?this.fake?"https://cdn.britannica.com/12/172012-050-A9AFF8AF/Jane-Austen-Cassandra-engraving-portrait-1810.jpg":this.server+"cover/"+this.details.cover.path:null},description:function(){return this.$store.state.app.folderDescription}},watch:{details:function(t,e){console.log(t),console.log(e),t!==e&&t.description&&(console.log("update description"),this.$store.dispatch("app/getFolderDescription",this.details.description.path)),t.image||t.description?this.$store.commit("app/rightbar",!0):this.$store.commit("app/rightbar",!1)}},mounted:function(){(this.image||this.description)&&this.$store.commit("app/rightbar",!0)}},r=(n(301),n(52)),component=Object(r.a)(o,(function(){var t=this,e=t.$createElement,n=t._self._c||e;return n("div",{staticClass:"flex flex-col overflow-auto"},[n("div",{staticClass:"text p-8 pb-5 flex justify-center"},[n("img",{staticClass:"block shadow rounded-md",attrs:{src:t.image}})]),t._v(" "),n("div",{staticClass:"text-xl flex justify-center px-8 font-bold"},[t._v(t._s(t.name))]),t._v(" "),n("div",{staticClass:"text px-8 description-text text-sm prose",domProps:{innerHTML:t._s(t.description)}})])}),[],!1,null,null,null);e.default=component.exports}}]);