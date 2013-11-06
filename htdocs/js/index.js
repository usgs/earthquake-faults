var ARC = 'http://server.arcgisonline.com/ArcGIS/rest/services',
    GEO = 'http://geohazards.usgs.gov/ArcGIS/rest/services',
    TERRAIN_LAYER = ARC + '/NatGeo_World_Map/MapServer/tile/{z}/{y}/{x}.jpg',
    FAULT_LAYER = GEO + '/qfaults2013/MapServer/tile/{z}/{y}/{x}',
    PALEO_LAYER = GEO + '/paleosites2013/MapServer/tile/{z}/{y}/{x}',
    FAULT_INFO_LAYER = GEO + '/qfaults2013/MapServer/identify',
    PALEO_INFO_LAYER = GEO + '/paleosites2013/MapServer/identify';

var FAULT_MARKUP_HEADER = [
	'<ul class="faults-info">'
].join('');
var FAULT_MARKUP_FOOTER = [
	'</ul>'
].join('');

var AREA_MARKUP_HEADER = [
	'<table class="area-info">',
		'<thead>',
			'<tr>',
				'<th scope="col" class="fault-name">Name</th>',
				'<th scope="col" class="fault-age">Age</th>',
				'<th scope="col" class="fault-rate">Slip Rate</th>',
				'<th scope="col" class="fault-sense">Slip Sense</th>',
			'</tr>',
		'</thead>',
		'<tbody>'
].join('');
var AREA_MARKUP_FOOTER = [
		'</tbody>',
	'</table>'
].join('');

var PALEO_MARKUP_HEADER = [
	'<table class="paleo-info">',
		'<thead>',
			'<tr>',
				'<th class="site-number">Site Number</th>',
				'<th class="trench-id">Trench ID</th>',
			'</tr>',
		'</thead>',
		'<tbody>'
].join('');
var PALEO_MARKUP_FOOTER = [
		'</tbody>',
	'</table>'
].join('');



(function () {
	var map = new L.Map('mapdiv', {
		center: [37.0, -96.0],
		zoom: 5
	});

	// Want AK and Conterminous US visible.
	map.fitBounds([[24.6,-150.0],[70.0,-65.0]]);

	var FAULT_MARKUP = [], AREA_MARKUP = [], PALEO_MARKUP = [],
	    TAB_CONTROL = [], TAB_CONTENT = [];

	// Add a baselayer
	(new L.TileLayer(TERRAIN_LAYER,
			{attribution:'<a href="/hazards/qfaults/">USGS</a>'})).addTo(map);

	// Add scale control
	(new L.Control.Scale()).addTo(map);

	// Add faults layer
	(new L.TileLayer(FAULT_LAYER)).addTo(map);
	
	// Create Paleo layers
	var paleoLayer = new L.TileLayer(PALEO_LAYER);
	var paleoInfoLayer = new L.ArcIdentify(PALEO_INFO_LAYER);

	if (map.getZoom() >= 6) {
		paleoInfoLayer.addTo(map);
	}

	// Create/add fault/area identify layer
	var fault_info = new L.ArcIdentify(FAULT_INFO_LAYER);
	fault_info.on('identify', function (data) {
		var i,
		    results = data.results,
		    len = results.length;

		// Short-circuit
		if (len === 0) { return; }

		for (i = 0; i < len; i++) {
			result = results[i];
			if (result.attributes.Shape === 'Polygon') {
				AREA_MARKUP.push(_getAreaResultMarkup(result.attributes));
			} else if (result.attributes.Shape === 'Polyline') {
				FAULT_MARKUP.push(_getFaultResultMarkup(result.attributes));
			}
		}

		_showPopup(data.latlng);

	});
	map.addLayer(fault_info);

	paleoInfoLayer.on('identify', function (data) {
		var i,
		    results = data.results,
		    len = results.length;

		if (len === 0) { return; }

		for (i = 0; i < len; i++) {
			result = results[i];
			if (result.attributes.Shape === 'Point') {
				PALEO_MARKUP.push(_getPaleoResultMarkup(result.attributes));
			}
		}

		_showPopup(data.latlng);

	});

	map.on('zoomend', function (e) {
		if (map.getZoom() >= 6) {
			// Make sure paleo is enabled
			paleoLayer.addTo(map);
			paleoInfoLayer.addTo(map);
		} else {
			// Make sure paleo is disabled
			map.removeLayer(paleoLayer);
			map.removeLayer(paleoInfoLayer);
		}
	});

	map.on('click', function (e) {
		// Clear markup
		FAULT_MARKUP = [];
		AREA_MARKUP = [];
		PALEO_MARKUP = [];
	});

	function _getPaleoResultMarkup (info) {
		info.NUM = info.NUM ||
				'<span class="unknown">unspecified</span>';
		info.TRENCHID = info.TRENCHID ||
				'<span class="unknown">unspecified</span>';
		return [
			'<tr>',
				'<td class="site-number">', info.NUM, '</td>',
				'<td class="trench-id">', info.TRENCHID, '</td>',
			'</tr>'
		].join('');
	};

	function _getAreaResultMarkup (info) {
		if (info.CFM_URL === null || info.CFM_URL === '' ||
				info.cooperator === 'Alaska Geological Survey') {
			// No link

			if (!info.NAME) {
				info.NAME = '<span class="unknown">unspecified</span>';
			}

		} else {
			// Include link

			if (!info.NAME) {
				info.NAME = '<a class="unknown" href="' + info.CFM_URL + '">' +
						'unspecified</a>';
			} else {
				info.NAME = '<a href="' + info.CFM_URL + '">' + info.NAME + '</a>';
			}

		}

		info.CFM_URL = info.CFM_URL || null;
		info.NAME = info.NAME ||
				'<span class="unknown">unspecified</span>';
		info.AGE = info.AGE ||
				'<span class="unknown">unspecified</span>';
		info.SLIPRATE = info.SLIPRATE ||
				'<span class="unknown">unspecified</span>';
		info.SLIPSENSE = info.SLIPSENSE ||
				'<span class="unknown">unspecified</span>';

		return [
			'<tr>',
				'<td class="fault-name">', info.NAME, '</td>',
				'<td class="fault-age">', info.AGE, '</td>',
				'<td class="fault-rate">', info.SLIPRATE, '</td>',
				'<td class="fault-sense">', info.SLIPSENSE, '</td>',
			'</tr>'
		].join('');
	};

	function _getFaultResultMarkup (info) {
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
					'<dd class="fault-length-data">', info.length, '</dd>',

				'</dl>',
			'</li>'
		].join('');
	};

	function _showPopup (latlng) {
		var tabs = document.createElement('div'),
		    controls = tabs.appendChild(document.createElement('ul')),
		    contents = tabs.appendChild(document.createElement('div')),
		    hasContent = false;

		tabs.className = 'tabs';
		controls.className = 'tabs-controls';
		contents.className = 'tabs-contents';

		if (FAULT_MARKUP.length !== 0) {
			// We have fault markup
			_addTab(controls, contents, 'Faults', FAULT_MARKUP_HEADER +
					FAULT_MARKUP.join('') + FAULT_MARKUP_FOOTER, !hasContent);
			hasContent = true;
		}

		if (AREA_MARKUP.length !== 0) {
			// We have area markup
			_addTab(controls, contents, 'Fault Areas', AREA_MARKUP_HEADER +
					AREA_MARKUP.join('') + AREA_MARKUP_FOOTER, !hasContent);
			hasContent = true;
		}

		if (PALEO_MARKUP.length !== 0) {
			// We have paleo markup
			_addTab(controls, contents, 'Paleosites', PALEO_MARKUP_HEADER +
					PALEO_MARKUP.join('') + PALEO_MARKUP_FOOTER, !hasContent);
			hasContent = true;
		}

		if (hasContent) {
			// Open the popup
			(new L.Popup({maxWidth:500,minWidth:500,maxHeight:350}))
				.setLatLng(latlng)
				.setContent(tabs)
				.openOn(map);
		} else {
			// Close any popup
			map.closePopup();
		}
	};

	function _addTab (controls, contents, title, markup, defaultVisible) {
		var control = controls.appendChild(document.createElement('li')),
		    content = contents.appendChild(document.createElement('div'));

		if (defaultVisible === true) {
			control.className = 'tabs-control tabs-control-selected';
			content.className = 'tabs-content tabs-content-visible';
		} else {	
			control.className = 'tabs-control';
			content.className = 'tabs-content';
		}

		control.innerHTML = title;
		content.innerHTML = markup;

		control.addEventListener('click', function (evt) {
			var visibleTabs = null,
			    selectedControls = null,
			    element = null,
			    i, len;

			visibleTabs = this.parentNode.parentNode.querySelectorAll(
					'.tabs-content-visible'),
			selectedControls = this.parentNode.querySelectorAll(
					'.tabs-control-selected');

			for (i = 0, len = visibleTabs.length; i < len; i++) {
				element = visibleTabs.item(i);
				element.className = 'tabs-content';
			}
			for (i = 0, len = selectedControls.length; i < len; i++) {
				element = selectedControls.item(i);
				element.className = 'tabs-control';
			}

			content.className = 'tabs-content tabs-content-visible';
			control.className = 'tabs-control tabs-control-selected';
		});

	};

})();
