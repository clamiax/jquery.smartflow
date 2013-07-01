(function($) {

$.fn.smartflow = function(uopts) {
"use strict";

var
	$w = $(window),	// the window
	elems = [],	// elements stack
	style = {},	// current style
	hooks = null,	// current hooks
	info,		// current infos
	route,		// current route
	diff,		// scroll diff
	t1, t2,		// temp variables

	// routes
	UP = 1,
	DOWN = 2,
	LEFT = 3,
	RIGHT = 4,

	/* options */
	dopts = {
		placeto: UP, // where to place panels having height lower than window
		hooks: {
			top: null, // default element top
			bot: null // default parent element bottom
		}
	},
	opts = $.extend(dopts, uopts),

	getinfo = function(e) {
		t1 = $w.scrollTop();
		t2 = $w.data('scrollTop');
		diff = t1 > t2 ? t1 - t2 : t2 - t1;

		if(t1 != t2) {
			route = t1 > t2 ? DOWN : UP;
		}
		else {
			t1 = $w.scrollLeft();
			t2 = $w.data('scrollLeft');
			route = t1 > t2 ? RIGHT : LEFT;
		}

		return {
			wx: $w.scrollLeft(),
			wy: $w.scrollTop(),
			ww: $w.width(),
			wh: $w.height(),
			ex: $(e).offset().left,
			ey: $(e).offset().top,
			ew: $(e).outerWidth(true),
			eh: $(e).outerHeight(true),
			route: route,
			diff: diff
		};
	},

	update = function() {
		$w.data('scrollTop', $w.scrollTop());
		$w.data('scrollLeft', $w.scrollLeft());
	},

	flow = function(e) {
		switch(info.route) {
			case UP: style.top += diff; break;
			case DOWN: style.top -= diff; break;
		}

		$(e).css({top:style.top+'px'});
	},

	fixit = function(e, r) {
		if(!r)
			r = info.route;
		switch(r) {
			case UP: style.top = 0; break;
			case DOWN: style.top = info.wh - info.eh; break;
		}

		$(e).css({top:style.top+'px'});
	},

	hook = function(e) {
		hooks = $(e).data('hooks');

		switch(info.route) {
			case UP: style.top = hooks.top - info.wy; break;
			case DOWN: style.top = hooks.bot - info.wy - info.eh; break;
		}

		$(e).css({top:style.top+'px'});
	},

	pushelem = function(e) {
		style.top = $(e).offset().top;

		hooks = {
			top: opts.hooks && opts.hooks.top
				? opts.hooks.top
				: style.top,

			bot: opts.hooks && opts.hooks.bot
				? opts.hooks.bot
				: $(e).parent().offset().top + $(e).parent().outerHeight(true),
		};

		$(e).css({top:style.top+'px',position:'fixed'}).data('hooks', hooks);
		elems.push(e);
	},

	getinfo = function(e) {
		t1 = $w.scrollTop();
		t2 = $w.data('scrollTop');
		diff = t1 > t2 ? t1 - t2 : t2 - t1;

		if(t1 != t2) {
			route = t1 > t2 ? DOWN : UP;
		}
		else {
			t1 = $w.scrollLeft();
			t2 = $w.data('scrollLeft');
			route = t1 > t2 ? RIGHT : LEFT;
		}

		return {
			wx: $w.scrollLeft(),
			wy: $w.scrollTop(),
			ww: $w.width(),
			wh: $w.height(),
			ex: $(e).offset().left,
			ey: $(e).offset().top,
			ew: $(e).outerWidth(true),
			eh: $(e).outerHeight(true),
			route: route,
			diff: diff
		};
	},

	isvisible = function() {
		t1 = info.ey + info.eh; // ebot
		t2 = info.wy + info.wh; // wbot

		return (t1 >= info.wy && info.ey <= t2);
	},

	intoview = function(r) {
		switch(r) {
			case UP:
				t1 = info.wy + info.wh; // wbot
				return (info.ey >= info.wy && info.ey <= t1);

			case DOWN:
				t1 = info.ey + info.eh; // ebot
				t2 = info.wy + info.wh; // wbot
				return (t1 >= info.wy && t1 <= t2);
		}
	},

	intohooks = function(e, r) {
		hooks = $(e).data('hooks');

		switch(r) {
			case UP: return (info.ey >= hooks.top);
			case DOWN:
				t1 = info.ey + info.eh; // ebot
				return (t1 <= hooks.bot);
		}
	},

	invroute = function(r) {
		switch(r) {
			case UP: return DOWN;
			case DOWN: return UP;
			case LEFT: return RIGHT;
			case RIGHT: return LEFT;
		}
	},

	place = function(e) {
		info = getinfo(e);
		flow(e);

		info = getinfo(e);
		if(info.eh < info.wh) {
			info = getinfo(e);
			if(!intohooks(e, opts.placeto)) {
				hook(e, opts.placeto);
			}
			else {
				fixit(e, opts.placeto);
				info = getinfo(e);

				if(!intohooks(e, invroute(info.route))) {
					info.route = invroute(info.route);
					hook(e, info.route);
				}
				else if(!intohooks(e, info.route)) {
					hook(e, info.route);
				}
			}
		}
		else if(intoview(info.route) || !isvisible()) {
			fixit(e, info.route);
			info = getinfo(e);
			if(!intohooks(e, info.route)) {
				hook(e, info.route);
			}
		}

		update();
	};

	/* init */
	$w.data({scrollTop:0,scrollLeft:0}).on('scroll.smartflow', function() {
		$.each(elems, function(i) {
			place(elems[i]);
		});
	});

	return this.each(function(i) {
		info = getinfo(this);
		if(info.eh < info.wh)
			return;
		pushelem(this);
	});
};

})(jQuery);
