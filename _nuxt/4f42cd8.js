(window.webpackJsonp=window.webpackJsonp||[]).push([[2],{307:function(e,r,n){"use strict";n.r(r);n(38),n(107),n(148),n(45);var t={name:"BreadCrumbs",computed:{breadcrumbs:function(){var e=[{name:"Home",link:"/",active:!1}];if(this.$route.query.folder&&"/"!==this.$route.query.folder)for(var r=this.$route.query.folder.split("/"),i=0;i<r.length;i++)e.push({name:r[i],link:r.slice(0,i+1).join("/"),active:i===r.length-1});return e}}},l=n(9),component=Object(l.a)(t,(function(){var e=this,r=e.$createElement,n=e._self._c||r;return e.breadcrumbs.length>1?n("div",{staticClass:"breadcrumbs flex-col lg:flex-row"},e._l(e.breadcrumbs,(function(r,t){return n("span",{key:t,class:{active:r.active},on:{click:function(n){return e.$emit("selectFolder",{path:r.link})}}},[e._v("\n    "+e._s(r.name)+"\n  ")])})),0):e._e()}),[],!1,null,null,null);r.default=component.exports}}]);