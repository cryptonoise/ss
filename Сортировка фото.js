// ==UserScript==
// @name [Shutterstock] Сортировка фото
// @namespace john_smit:shutterstock:sort-photo
// @version 0.1
// @description Сортировка фото
// @match https://www.shutterstock.com/*
// @match https://shutterstock.com/*
// @grant unsafeWindow
// @grant GM_registerMenuCommand
// @noframes
// ==/UserScript==

(function() {
'use strict';
var $ = unsafeWindow.jQuery;
GM_registerMenuCommand("Сортировать", function (i, e) {
var photos = [];
$('li.js_item').each(function (i, li) {
var imgSrc = $(li).find('.img-wrap > img').attr('src');
var photoId = $(li).find('.actions-row > button[data-id]').data('id');

photos.push({
img: imgSrc,
id: photoId,
li: li.cloneNode(true)
});
});

console.log(photos);
var searchContent = $('.search-content');
searchContent.html("");
photos.sort(function (a, b) {
return a.id - b.id;
}).forEach(function (photo) {
searchContent.append('<a target="_blank" href="https://www.shutterstock.com/ru/image-photo/' + photo.id + '"><img src="' + photo.img + '"></a>');
});
});
})();