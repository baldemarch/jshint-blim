"use strict";

var chalk = require('chalk');
var table = require('text-table');
var extend = require('util-extend');
var fs = require('fs');
var path = require('path');

module.exports = {
	reporter: function (result, config, options) {
		var total = result.length;
		var ret = '';
		var headers = [];
		var prevfile;

		options = options || {};

		var colors = {};

		colors = extend({
			'meta'       : 'white',
			'warning'    : 'magenta',
			'verbose'    : 'gray',
			'error'      : 'yellow',
			'nocritical' : 'gray',
			'noproblem'  : 'green',
			'total'      : 'blue'
		}, colors);

		ret += table(result.map(function (el, i) {

			var customError = [
				{
					regex  : "^Expected \'",
					color  : "error",
					icon   : "✖"
				},
				{
					regex  : "(?:defined)+",
					color  : "warning",
		 			icon   : "!"
				}
			];

			function checkCustomErrors(error) {
				for(var j = 0; j < customError.length; j++) {
					var pattern = new RegExp(customError[j].regex, 'igm');

					var matchResult = error.match(pattern);

					if (matchResult) {
					  var matchedResult = customError[j];
						return matchedResult;
					} else {
						var matchedResult = {
							'color': 'nocritical',
							'icon' : '-'
						};
					}
				}
				return matchedResult;
			}

			var err = el.error;
			var line = [];

			var customColor = checkCustomErrors(err.reason);

			line = [
				'',
				chalk[colors.meta].dim('line ' + err.line),
				chalk[colors.meta].dim('col ' + err.character),
				chalk[colors[customColor.color]](customColor.icon + ' '+err.reason)
			];

			if (el.file !== prevfile) {
				headers[i] = el.file;
			}

			if (options.verbose) {
				line.push(chalk[colors.verbose]('(' + err.code + ')'));
			}

			prevfile = el.file;

			return line;
		})).split('\n').map(function (el, i) {
			return headers[i] ? '\n' + 'File: ' + chalk.underline(headers[i]) + '\n' + el : el;
		}).join('\n') + '\n\n';

		if (total > 0) {
			ret += chalk[colors.total].bold(' ✖ ' + total + (total === 1 ? ' problem' : ' problems'));
		} else {
			ret += chalk[colors.noproblem].bold('✔ No problems');
			ret = '\n' + ret.trim();
		}

		console.log(ret + '\n');
	}
};
