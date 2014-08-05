var ARC = 'http://server.arcgisonline.com/ArcGIS/rest/services',
    GEO = 'http://geohazards.usgs.gov/ArcGIS/rest/services',
    TERRAIN_LAYER = ARC + '/NatGeo_World_Map/MapServer/tile/{z}/{y}/{x}.jpg',
    FAULT_LAYER = GEO + '/hazfaults2002/MapServer/tile/{z}/{y}/{x}',
    FAULT_INFO_LAYER = GEO + '/hazfaults2002/MapServer/identify';

var FAULT_MARKUP_HEADER = [
	'<ul class="faults-info">'
].join('');
var FAULT_MARKUP_FOOTER = [
	'</ul>'
].join('');


(function () {
	var map = new L.Map('mapdiv', {
		maxZoom: 11,
		center: [37.0, -96.0],
		zoom: 5
	});

	map.fitBounds([[24.6,-125.0],[50.0,-65.0]]);

	var FAULT_MARKUP = [];

	// Add a baselayer
	(new L.TileLayer(TERRAIN_LAYER,
			{attribution:'<a href="/hazards/products/conterminous/2002/documentation/">USGS</a>'})).addTo(map);

	// Add scale control
	(new L.Control.Scale()).addTo(map);

	// Add faults layer
	(new L.TileLayer(FAULT_LAYER)).addTo(map);
	
	// Create/add fault identify layer
	var fault_info = new L.ArcIdentify(FAULT_INFO_LAYER);
	fault_info.on('identify', function (data) {
		var i,
		    results = data.results,
		    len = results.length;

		// Short-circuit
		if (len === 0) { return; }

		for (i = 0; i < len; i++) {
			result = results[i];
			if (result.attributes.Shape === 'Polyline') {
				FAULT_MARKUP.push(_getFaultResultMarkup(result.attributes));
			}
		}

		_showPopup(data.latlng);

	});
	map.addLayer(fault_info);

	map.on('click', function (e) {
		// Clear markup
		FAULT_MARKUP = [];
	});

	function _getFaultResultMarkup (info) {
		var slip_sense_map = {
			'1': 'Strike Slip',
			'2': 'Thrust (Reverse)',
			'3': 'Normal',
			'-1': '<span class="unknown">unspecified</span>'
		};

		info.CFM_URL = info.CFM_URL || '#';
		info.NAME = info.NAME ||
				'<span class="unknown">unspecified</span>';
		info.PREF_DIP = info.PREF_DIP || 
				'<span class="unknown">unspecified</span>';
		info.DIP_DIR = info.DIP_DIR || '';
		info.PREF_SLIP_ = info.PREF_SLIP_ ||
				'<span class="unknown">unspecified</span>';
		info.SLIP_SENSE = info.SLIP_SENSE || '-1';

		return [
			'<li class="fault-wrapper">',
				'<dl class="fault-info">',

					'<dt class="clear fault-name-label">Name</td>',
					'<dd class="fault-name-data">', info.NAME, '</dd>',

					'<dt class="clear">Dip (degrees)</dt>',
					'<dd>', info.PREF_DIP + info.DIP_DIR, '</dd>',
					'<dt>Pref Slip Rate (mm/yr)</dt>',
					'<dd>', info.PREF_SLIP_, '</dd>',
					'<dt>Slip Sense</dt>',
					'<dd>', slip_sense_map[info.SLIP_SENSE], '</dd>',

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
