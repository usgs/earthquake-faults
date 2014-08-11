/* global define */
define([
	'FaultMap'
], function (
	FaultMap
) {
	'use strict';

	var QFaultMap = function (options) {
		FaultMap.call(this, options);
	};
	QFaultMap.prototype = Object.create(FaultMap.prototype);

	QFaultMap.prototype._getFaultResultMarkup = function (info) {
		if (info.CFM_URL === null || info.CFM_URL === '' ||
				info.cooperator === 'Alaska Geological Survey') {
			// No link

			if (!info.name) {
				info.name = '<span class="unknown">unspecified</span>';
			}

		} else {
			// Include link

			if (!info.name) {
				info.name = '<a class="unknown" href="' + info.CFM_URL + '">' +
						'unspecified</a>';
			} else {
				info.name = '<a href="' + info.CFM_URL + '">' + info.name + '</a>';
			}

		}

		info.cooperator = info.cooperator ||
				'<span class="unknown">unspecified</span>';
		info.age = info.age ||
				'<span class="unknown">unspecified</span>';
		info.sliprate = info.sliprate ||
				'<span class="unknown">unspecified</span>';
		info.slipsense = info.slipsense ||
				'<span class="unknown">unspecified</span>';
		info.azimuth = info.azimuth ||
				'<span class="unknown">unspecified</span>';
		info.dipdirecti = info.dipdirecti ||
				'<span class="unknown">unspecified</span>';
		info.length = info.length ||
				'<span class="unknown">unspecified</span>';

		return [
			'<li class="fault-wrapper">',
				'<dl class="fault-info">',

					'<dt class="clear fault-name-label">Name</dt>',
					'<dd class="fault-name-data">', info.name, '</dd>',

					'<dt class="clear fault-cooperator-label">Collaborator</dt>',
					'<dd class="fault-cooperator-data">', info.cooperator, '</dd>',

					'<dt class="clear fault-age-label">Age</dt>',
					'<dd class="fault-age-data">', info.age, '</dd>',
					'<dt class="fault-rate-label">Slip Rate</dt>',
					'<dd class="fault-rate-data">', info.sliprate, '</dd>',
					'<dt class="fault-sense-label" title="Sense of movement">',
						'Sense',
					'</dt>',
					'<dd class="fault-sense-data">', info.slipsense, '</dd>',

					'<dt class="clear fault-strike-label">Strike</dt>',
					'<dd class="fault-strike-data">', info.azimuth, '</dd>',
					'<dt class="fault-direction-label">Direction</dt>',
					'<dd class="fault-direction-data">', info.dipdirecti, '</dd>',
					'<dt class="fault-length-label">Length (km)</dt>',
					'<dd class="fault-length-data">',
						(Math.round(info.length*10)/10),
					'</dd>',

				'</dl>',
			'</li>'
		].join('');
	};

	return QFaultMap;

});