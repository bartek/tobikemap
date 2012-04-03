$(function() {
  var lanesLayer;
  var center = new L.LatLng(43.6481, -79.4042);
  var map = new L.Map('map', {
    center: center,
    zoom: 13,
    layers: [new L.StamenTileLayer("terrain")]
  });

  var typesMapping = {
    'Bike Lanes': {color: '#dd2c24', weight: 7},
    'Sharrows': {color: '#FDAD3F', weight: 5, stroke: true},
    'Contra-Flow Bike Lanes': {color: '#f6c8c6', weight: 5},
    'Major Multi-use Pathway': {color: '#663E93', weight: 5},
    'Minor Multi-use Pathway': {color: '#663E93', weight: 2},
    'Signed Routes': {color: '#266df1', weight: 5},
    'Park Roads': {color: '#1de525', weight: 6},
    'Suggested On-Street Connections': {color: '#fdd29f', weight: 6},
    'Suggested On-Street Routes': {color: '#FEE168', weight: 6}
  };

  // Plot these in the html. Nasty!
  _.each(typesMapping, function(el, key, obj) {
    $("#legend").append("<li><span class='legend-circle' style='color:" 
      + el.color 
      + "'></span>" + key + "</li>");
  });

  var fillMap = function(result) {
    var resultCounter = 0;
    if (lanesLayer != undefined) {
      map.removeLayer(lanesLayer);
    }

    lanesLayer = new L.GeoJSON();
    // Map the types of lanes to different colours
    lanesLayer.on('featureparse', function(e) {
      var _type = result.cp_type[resultCounter];
      var _style = (typesMapping[_type] != undefined ?  typesMapping[_type] 
                      : typesMapping['Bike Lanes']); 
      e.layer.setStyle(_style);
      resultCounter ++;
    });
    lanesLayer.addGeoJSON(result);
    map.addLayer(lanesLayer);
  };

  var requestMap = function(bounds) {
    $.ajax({
      type: 'POST',
      url: '/fetch',
      dataType: 'json',
      data: {bounds: bounds.toBBoxString()},
      contentType: 'application/json charset=utf-8',
      success: fillMap,
      error: function(req, status, error) {
        console.error("Unable to fetch map data", error);
      }
    });
  };

  map.on('moveend', function(e) {
    // We should only do this if the change is somewhat substantial?
    requestMap(e.target.getBounds());
  });
  map.setView(center, 13, true);
});
