/**
 * Class for connecting to an ArcGIS REST identify service using JSON format.
 *
 */
L.ArcIdentify = L.Class.extend({

	includes: L.Mixin.Events,
	
	initialize: function (url, options) {
		this.url = url + [
			'?geometry={geometry}',
			'&geometryType={geometryType}',
			'&sr={sr}',
			'&layers={layers}',
			'&tolerance={tolerance}',
			'&mapExtent={mapExtent}',
			'&imageDisplay={imageDisplay}',
			'&returnGeometry=true',
			'&f=json',
			'&callback={callback}'
		].join('');

		this.options = L.Util.extend({}, {
			identifyParameters: {
				geometryType: 'esriGeometryPoint',
				sr: '4326',
				layers: 'all',
				tolerance: '3',
			}
		}, options || {});

		// Stamp-a-roo
		L.Util.stamp(this);
	},

	/**
	 * API Method: L.ILayer#onAdd
	 */
	onAdd: function (map) {
		// Bind event handlers for fetching data
		map.on('click', this._execute, this);

		this._map = map;
	},

	addTo: function (map) {
		map.addLayer(this);
		return this;
	},

	/**
	 * API Method: L.ILayer#onRemove
	 */
	onRemove: function (map) {
		// Remove event handlers for fetching data
		map.off('click', this._execute, this);

		this._map = null;
	},

	// ------------------------------------------------------------
	// Private/helper methods
	// ------------------------------------------------------------

	/**
	 * Executes the identify task against the server. Triggers onData method upon
	 * successful return.
	 *
	 * @param mouseEvent {MouseEvent}
	 */
	_execute: function (mouseEvent) {
		var request = this._createRequest(mouseEvent.latlng),
		    insertAt = document.querySelector('script');

		insertAt.parentNode.insertBefore(request, insertAt);
	},

	_createRequest: function (latlng) {
		var request = document.createElement('script'),
		    parameters = L.Util.extend({}, this.options.identifyParameters),
		    fn = this._getCallbackName(latlng);

		// Fill in required event-specific parameters based on info and current
		// map state
		parameters.geometry = this._getGeometryString(latlng);
		parameters.mapExtent = this._getMapExtentParameterString();
		parameters.imageDisplay = this._getImageDisplayString();
		parameters.callback = 'L.ArcIdentify.' + fn;

		request.src = L.Util.template(this.url, parameters);

		// Create actual callback method
		L.ArcIdentify[fn] = (function (layer, point) {
			return function (data) {
				// Trigger
				layer.fire('identify', {'results': data.results, 'latlng': point});

				// Clean up
				delete L.ArcIdentify[fn];
				request.parentNode.removeChild(request);
			};
		})(this, latlng);

		return request;
	},

	/**
	 * Converts the given latlng object into a string format as expected by
	 * ArcIdentifyTask.
	 *
	 * @param latlng {L.LatLng}
	 *
	 * TODO :: Make spatial reference configurable and/or detectable?
	 */
	_getGeometryString: function (latlng) {
		return '{x:' + (latlng.lng) +
				',y:' + (latlng.lat) +
				',spatialReference:{wkid:4326}}';
	},

	/**
	 * Checks the current map bounds and returns it as a formatted string as
	 * expected by the ArcIdentifyTask.
	 *
	 * TODO :: Make spatial reference configurable and/or detectable?
	 */
	_getMapExtentParameterString: function () {
		var b = this._map.getBounds(),
		    sw = b.getSouthWest(),
			 ne = b.getNorthEast();

		return '{xmin:' + (sw.lng) + ',ymin:' + (sw.lat) +
				',xmax:' + (ne.lng) + ',ymax:' + (ne.lat) +
				',spatialReference:{wkid:4326}}';
	},

	/**
	 * Checks the current map container size and returns it as a formatted string
	 * as expected by the ArcIdentifyTask.
	 *
	 * TODO :: Make DPI value configurable and/or detectable?
	 */
	_getImageDisplayString: function () {
		var s = this._map.getSize();
		return '' + (s.x) + ',' + (s.y) + ',96';
	},

	_getCallbackName: function (latlng) {
		return 'cb_' + L.Util.stamp(this) + '_' + (new Date()).getTime();
	}
});
