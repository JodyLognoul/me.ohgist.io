/*
nav.js
*/
'use strict';
var PageTransitions = (function($) {
	var startElement = 0,
	animEndEventNames = {
		'WebkitAnimation': 'webkitAnimationEnd',
		'OAnimation': 'oAnimationEnd',
		'msAnimation': 'MSAnimationEnd',
		'animation': 'animationend'
	},
	animEndEventName,
	activePage = 1,
	titles = [],
	dots = $('.dotstyle > ul').find('li');

	function init() {
		// animation end event name
		animEndEventName = animEndEventNames[getTransitionPrefix()];
		$('.et-page').each(function() {
			$(this).data('originalClassList', $(this).attr('class'));
		});
		$('.et-wrapper').each(function() {
			$(this).data('current', 0);
			$(this).data('isAnimating', false);
			$(this).children('.et-page').eq(startElement).addClass('et-page-current');
		});
		$('.et-rotate').click(function() {
			animate($(this));
		});
		initDotsMenu();
		initTitlesIndex();
		updateArrows(1);
	}
	function updateArrows(gotoIndex){

		$('.title-prev').html(titles[gotoIndex === 1 ? titles.length - 1 : gotoIndex - 1 ]);
		$('.title-next').html(titles[gotoIndex === titles.length ? 0 : gotoIndex ]);
	}
	function initTitlesIndex(){
		dots.each(function(i, dot){
			titles.push($(dot).data('title'));
		});
	}

	function getTransitionPrefix() {
		var b = document.body || document.documentElement;
		var s = b.style;
		var p = 'animation';
		if (typeof s[p] === 'string') {
			return 'animation';
		}

		// Tests for vendor specific prop
		var v = ['Moz', 'Webkit', 'Khtml', 'O', 'ms'];
		p = p.charAt(0).toUpperCase() + p.substr(1);
		for (var i = 0; i < v.length; i++) {
			if (typeof s[v[i] + p] === 'string') {
				return v[i] + p;
			}
		}
		return false;
	}

	function initDotsMenu(){
		var current = 0;
		dots.each(function(idx, dot ) {
			dot.addEventListener('click', function(ev) {
				ev.preventDefault();
				if (idx !== current) {
					dots[current].className = '';
					setTimeout(function() {
						dot.className += ' current';
						current = idx;
					}, 25);
				}
			});
		});
	}
	function updateDotsMenu(idx){
		var dot = dots.get(idx - 1);
		dots.each(function(i, elem){
			elem.className = '';
		});
		setTimeout(function() {
			dot.className += ' current';
		}, 25);
	}

	function animate(block, callback) {
		nextPage(block.data('index'), block.parents('body').children('.et-wrapper'), $(block).attr('et-out'), $(block).attr('et-in'), callback);
	}
	
	function nextPage(gotoIndex, block, outClass, inClass, callback) {
		inClass = formatClass(inClass);
		outClass = formatClass(outClass);
		var current = block.data('current'),
		$pages = block.children('.et-page'),
		pagesCount = $pages.length,
		endCurrPage = false,
		endNextPage = false;
		if (gotoIndex === 'next') {
			gotoIndex = (activePage === pagesCount) ? 1 : activePage + 1;
		} else if (gotoIndex === 'prev'){
			gotoIndex = (activePage === 1) ? pagesCount : activePage - 1;
		}
		if (gotoIndex < activePage) {
			inClass = inClass.replace('Right','Left');
			outClass = outClass.replace('Left','Right');
		} else if (gotoIndex === activePage){
			return;
		}
		

		if (block.data('isAnimating')) {
			return false;
		}

		block.data('isAnimating', true);

		var $currPage = $pages.eq(current);

		current = gotoIndex - 1;
		block.data('current', current);

		var $nextPage = $pages.eq(current).addClass('et-page-current');

		$currPage.addClass(outClass).on(animEndEventName, function() {
			$currPage.off(animEndEventName);
			endCurrPage = true;
			if (endNextPage) {
				if (jQuery.isFunction(callback)) {
					callback(block, $nextPage, $currPage);
				}
				onEndAnimation($currPage, $nextPage, block);
			}
		});

		$nextPage.addClass(inClass).on(animEndEventName, function() {
			$nextPage.off(animEndEventName);
			endNextPage = true;
			if (endCurrPage) {
				onEndAnimation($currPage, $nextPage, block);
			}
		});
		activePage = gotoIndex;
		updateDotsMenu(gotoIndex);
		updateArrows(gotoIndex);
	}

	function onEndAnimation($outpage, $inpage, block) {
		resetPage($outpage, $inpage);
		block.data('isAnimating', false);
	}

	function resetPage($outpage, $inpage) {
		$outpage.attr('class', $outpage.data('originalClassList'));
		$inpage.attr('class', $inpage.data('originalClassList') + ' et-page-current');
	}

	function formatClass(str) {
		var classes = str.split(' '),
		output = '';
		for (var n = 0; n < classes.length; n++) {
			output += ' pt-page-' + classes[n];
		}
		return output;
	}
	return {
		init: init,
		nextPage: nextPage,
		animate: animate
	};
})(jQuery);

$(function() {
	PageTransitions.init();
});