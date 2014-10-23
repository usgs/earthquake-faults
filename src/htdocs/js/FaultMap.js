/* global define */
define([
	'ArcIdentify',
	'leaflet'
], function (
	ArcIdentify,
	L
) {
	'use strict';

	var ARC = 'http://server.arcgisonline.com/ArcGIS/rest/services',
	    TERRAIN_LAYER = ARC + '/NatGeo_World_Map/MapServer/tile/{z}/{y}/{x}.jpg';

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

	var DEFAULTS = {
		baseLayerUrl: TERRAIN_LAYER,
		baseLayerOpts: null,
		initialExtent: [[24.6,-125.0],[50.0,-65.0]]

		/** Other configuration options, but no defaults specified */
		/*

		faultLayerUrl: {String} URL to fault overlay tiles
		faultLayerOpts: {Object} Options for fault overlay layer
		faultInfoUrl: {String} URL to fault identify task

		paleoLayerUrl: {String} URL to paleo sites overlay tiles
		paleoLayerOpts: {Object} Options for paleo sites overlay layer
		paleoInfoUrl: {String} URL to paleo sites identify task
		*/
	};


	var FaultMap = function (options) {
		options = options || {};

		// Which basemap to use
		this._baseLayerUrl = options.baseLayerUrl || DEFAULTS.baseLayerUrl;
		this._baseLayerOpts = options.baseLayerOpts || DEFAULTS.baseLayerOpts;

		// Fault overlay configurations
		this._faultLayerUrl = options.faultLayerUrl || null;
		this._faultLayerOpts = options.faultLayerOpts || null;
		this._faultInfoUrl = options.faultInfoUrl || null;

		// Paleo sites overlay configurations
		this._paleoLayerUrl = options.paleoLayerUrl || null;
		this._paleoLayerOpts = options.paleoLayerOpts || null;
		this._paleoInfoUrl = options.paleoInfoUrl || null;

		this._faultMarkup = [];
		this._areaMarkup = [];
		this._paleoMarkup = [];

		this._faultLayer = null;
		this._paleoLayer = null;

		options.initialExtent = options.initialExtent || DEFAULTS.initialExtent;
		this.initialize(options.initialExtent);
	};

	FaultMap.prototype.initialize = function (initialExtent) {

		this._map = new L.Map('mapdiv', {
			maxZoom: 11,
			center: [37.0, -96.0],
			zoom: 5
		});

		this._map.fitBounds(initialExtent);

		// Add a baselayer
		this._baseLayer = new L.TileLayer(
				this._baseLayerUrl, this._baseLayerOpts);
		this._baseLayer.addTo(this._map);

		// Add scale control
		this._scaleControl = new L.Control.Scale();
		this._scaleControl.addTo(this._map);

		// Add faults layer
		if (this._faultLayerUrl) {
			this._faultLayer = new L.TileLayer(
					this._faultLayerUrl, this._faultLayerOpts);
			this._faultLayer.addTo(this._map);

			if (this._faultInfoUrl) {
				// Create/add fault identify layer
				this._faultInfoLayer = new ArcIdentify(this._faultInfoUrl);
				this._faultInfoLayer.on('identify', this._onIdentify, this);
				this._faultInfoLayer.addTo(this._map);
			}
		}

		// Add paleo sites layer
		if (this._paleoLayerUrl) {
			this._paleoLayer = new L.TileLayer(
					this._paleoLayerUrl, this._paleoLayerOpts);

			if (this._map.getZoom() >= 8) {
				this._paleoLayer.addTo(this._map);
			}

			if (this._paleoInfoUrl) {
				// Create/add paleo sites identify layer
				this._paleoInfoLayer = new ArcIdentify(this._paleoInfoUrl);
				this._paleoInfoLayer.on('identify', this._onIdentify, this);

				if (this._map.getZoom() >= 8) {
					this._paleoInfoLayer.addTo(this._map);
				}
			}
		}

		this._map.on('click', function (/*evt*/) {
			// Clear markup
			this._faultMarkup = [];
			this._areaMarkup = [];
			this._paleoMarkup = [];
		}, this);

		this._map.on('zoomend', function (/*evt*/) {
			if (this._map.getZoom() >= 8) {
				if (this._paleoLayer && !this._paleoLayer.map) {
					this._paleoLayer.addTo(this._map);
					this._paleoInfoLayer.addTo(this._map);
				}
			} else {
				if (this._paleoLayer && this._paleoLayer.map) {
					this._paleoLayer.removeFrom(this._map);
					this._paleoInfoLayer.removeFrom(this._map);
				}
			}
		}, this);
	};

	FaultMap.prototype._onIdentify = function (data) {
		var i,
		    result,
		    results = data.results,
		    len = results.length;

		// Short-circuit
		if (len === 0) { return; }

		for (i = 0; i < len; i++) {
			result = results[i];
			if (result.attributes.Shape === 'Polyline') {
				this._faultMarkup.push(this._getFaultResultMarkup(result.attributes));
			} else if (result.attributes.Shape === 'Polygon') {
				this._areaMarkup.push(this._getAreaResultMarkup(result.attributes));
			} else if (result.attributes.Shape === 'Point') {
				this._paleoMarkup.push(this._getPaleoResultMarkup(result.attributes));
			}
		}

		this._showPopup(data.latlng);
	};

	FaultMap.prototype._getFaultResultMarkup = function (info) {
		if (info.CFM_URL === null || info.CFM_URL === '' ||
				info.cooperator === 'Alaska Geological Survey') {
			// No link

			if (!info.NAME) {
				info.NAME = '<span class="unknown">unspecified</span>';
			}

		} else {
			// Include link

			if (!info.NAME) {
				info.NAME = '<a target="_blank" class="unknown" href="' +
						info.CFM_URL + '">' + 'unspecified</a>';
			} else {
				info.NAME = '<a target="_blank" href="' + info.CFM_URL + '">' +
						info.NAME + '</a>';
			}

		}

		var slip_sense_map = {
			'0': 'Unassigned',
			'1': 'Strike Slip',
			'2': 'Thrust (Reverse)',
			'3': 'Normal',
			'-1': '<span class="unknown">unspecified</span>'
		};

		info.DISP_DIPS = info.DISP_DIPS || 
				'<span class="unknown">unspecified</span>';
		info.DIP_DIR = info.DIP_DIR || '';
		info.DISP_SING = info.DISP_SING ||
				'<span class="unknown">unspecified</span>';
		info.SLIP_SENSE = info.SLIP_SENSE || '-1';

		return [
			'<li class="fault-wrapper">',
				'<dl class="fault-info">',

					'<dt class="clear fault-name-label">Name</td>',
					'<dd class="fault-name-data">', info.NAME, '</dd>',

					'<dt class="clear">Dip (degrees)</dt>',
					'<dd>', info.DISP_DIPS + info.DIP_DIR, '</dd>',
					'<dt>Pref Slip Rate (mm/yr)</dt>',
					'<dd>', info.DISP_SING, '</dd>',
					'<dt>Slip Sense</dt>',
					'<dd>', slip_sense_map[info.SLIP_SENSE], '</dd>',

				'</dl>',
			'</li>'
		].join('');
	};

	FaultMap.prototype._getAreaResultMarkup = function (info) {
		if (info.CFM_URL === null || info.CFM_URL === '' ||
				info.cooperator === 'Alaska Geological Survey') {
			// No link

			if (!info.NAME) {
				info.NAME = '<span class="unknown">unspecified</span>';
			}

		} else {
			// Include link

			if (!info.NAME) {
				info.NAME = '<a target="_blank" class="unknown" href="' +
						info.CFM_URL + '">' + 'unspecified</a>';
			} else {
				info.NAME = '<a target="_blank" href="' + info.CFM_URL + '">' +
						info.NAME + '</a>';
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

	FaultMap.prototype._getPaleoResultMarkup = function (info) {
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

	FaultMap.prototype._showPopup = function (latlng) {
		var tabs = document.createElement('div'),
		    controls = tabs.appendChild(document.createElement('ul')),
		    contents = tabs.appendChild(document.createElement('div')),
		    hasContent = false;

		tabs.className = 'tabs';
		controls.className = 'tabs-controls';
		contents.className = 'tabs-contents';

		if (this._faultMarkup.length !== 0) {
			// We have fault markup
			this._addTab(controls, contents, 'Faults', FAULT_MARKUP_HEADER +
					this._faultMarkup.join('') + FAULT_MARKUP_FOOTER, !hasContent);
			hasContent = true;
		}

		if (this._areaMarkup.length !== 0) {
			// We have area markup
			this._addTab(controls, contents, 'Fault Areas', AREA_MARKUP_HEADER +
					this._areaMarkup.join('') + AREA_MARKUP_FOOTER, !hasContent);
			hasContent = true;
		}

		if (this._paleoMarkup.length !== 0) {
			// We have paleo markup
			this._addTab(controls, contents, 'Paleosites', PALEO_MARKUP_HEADER +
					this._paleoMarkup.join('') + PALEO_MARKUP_FOOTER, !hasContent);
			hasContent = true;
		}

		if (hasContent) {
			// Open the popup
			(new L.Popup({maxWidth:500,minWidth:500,maxHeight:350}))
				.setLatLng(latlng)
				.setContent(tabs)
				.openOn(this._map);
		} else {
			// Close any popup
			this._map.closePopup();
		}
	};

	FaultMap.prototype._addTab = function (controls, contents, title, markup,
			defaultVisible) {
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

		control.addEventListener('click', function (/*evt*/) {
			var visibleTabs = null,
			    selectedControls = null,
			    element = null,
			    i, len;

			visibleTabs = this.parentNode.parentNode.querySelectorAll(
					'.tabs-content-visible');
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

	return FaultMap;
});
