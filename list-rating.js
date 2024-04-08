/**
 * Ratings Element - List
 *
 * @copyright: Copyright (C) 2005-2013, fabrikar.com - All rights reserved.
 * @license:   GNU/GPL http://www.gnu.org/copyleft/gpl.html
 */

define(['jquery'], function (jQuery) {
	var FbRatingList = new Class({

		options: {
			'userid': 0,
			'mode'  : '',
			'formid': 0
		},

		Implements: [Events, Options],

		initialize: function (id, options) {
			self = this;
			options.element = id;
			this.setOptions(options);
			if (this.options.canRate === false) {
				return;
			}
			if (this.options.mode === 'creator-rating') {
				return;
			}

			// To add events when modules rendered again on submit
			Fabrik.addEvent('fabrik.list.submit.ajax.complete', function () {
				self.addEvents(self.options.id);
			});

			this.options.id = id;
			this.addEvents(id);
		},

		addEvents: function (id) {
			this.col = $$('.' + id);
			this.origRating = {};
			this.col.each(function (tr) {
				var stars = tr.getElements('.starRating');

				stars.each(function (star) {
					star.addEvent('mouseover', function (e) {
						this.origRating[tr.id] = star.getParent('.fabrikRating').getElement('.ratingScore').innerHTML.toInt();
						stars.each(function (ii) {
							if (this._getRating(star) >= this._getRating(ii)) {
								ii.removeClass(this.options.starIconEmpty).addClass(this.options.starIcon);
							} else {
								ii.addClass(this.options.starIconEmpty).removeClass(this.options.starIcon);
							}
						}.bind(this));
						//star.getParent('.fabrikRating').getElement('.ratingMessage').innerHTML = star.get('data-rating');
					}.bind(this));

					star.addEvent('mouseout', function (e) {
						stars.each(function (ii) {
							if (this.origRating[tr.id] >= this._getRating(ii)) {
								ii.removeClass(this.options.starIconEmpty).addClass(this.options.starIcon);
							} else {
								ii.addClass(this.options.starIconEmpty).removeClass(this.options.starIcon);
							}
						}.bind(this));
						//star.getParent('.fabrikRating').getElement('.ratingMessage').innerHTML = '';
					}.bind(this));
				}.bind(this));

				stars.each(function (star) {
					star.addEvent('click', function (e) {
						this.doAjax(e, star);
					}.bind(this));
				}.bind(this));

			}.bind(this));
		},

		_getRating: function (i) {
			var r = i.get('data-rating');
			return r.toInt();
		},

		doAjax: function (e, star) {
			e.stop();
			this.rating = this._getRating(star);
            var ratingDiv = star.getParent('.fabrikRating');
			Fabrik.loader.start(ratingDiv);

			var row = document.id(star).getParent('.fabrik_row');
	
			// If the element is inside a module
			//var rowid = row.id.replace('list_' + this.options.listRef + '_row_', '');
			var rowid = row.id.split('_')[row.id.split('_').length-1];

			var data = {
				'option'     : 'com_fabrik',
				'format'     : 'raw',
				'task'       : 'plugin.pluginAjax',
				'plugin'     : 'rating',
				'g'          : 'element',
				'method'     : 'ajax_rate',
				'formid'     : this.options.formid,
				'element_id' : this.options.elid,
				'row_id'     : rowid,
				'elementname': this.options.elid,
				'userid'     : this.options.userid,
				'rating'     : this.rating,
				'mode'       : this.options.mode
			};
			new Request({
				url       : '',
				'data'    : data,
				onComplete: function (r) {
					// leave r as-is, it might be fractional, use for score html, but round it for this.rating
					this.rating = Math.round(parseFloat(r));
                    Fabrik.loader.stop(ratingDiv);
                    star.getParent('.fabrikRating').getElement('.ratingScore').set('html', r);
                    var stars = star.getParent('.fabrikRating').getElements('.starRating');
                    stars.each(function (ii) {
                        if (this.rating >= this._getRating(ii)) {
                            ii.removeClass(this.options.starIconEmpty).addClass(this.options.starIcon);
                        } else {
                            ii.addClass(this.options.starIconEmpty).removeClass(this.options.starIcon);
                        }
                    }.bind(this));
				}.bind(this)
			}).send();
		}
	});

	return FbRatingList;
});