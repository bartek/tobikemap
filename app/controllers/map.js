var pg = require('pg');

var Map = function () {
  this.respondsWith = ['json'];
  this.fetch = function(req, resp, params) {
    var self = this;

    pg.connect(geddy.config.database.connection, function(err, client) {
      if (!params.bounds) {
        this.respond({});
      }

      var bounds = params.bounds.split(",");
      var bounds = {
        southWest: {
          lng: bounds[0],
          lat: bounds[1],
        },
        northEast: {
          lng: bounds[2],
          lat: bounds[3]
        }
      };

      var bounding_box = [
        bounds.southWest.lng, bounds.southWest.lat,
        bounds.northEast.lng, bounds.northEast.lat
      ].join(",");

      var sql = [
        "SELECT ST_AsGeoJSON(geom) as shape, cp_type",
        "FROM v_centreline_od_bikeways_wgs84",
        "WHERE cp_type != 'null'",
        "AND ST_Intersects(geom, ST_MakeEnvelope(" + bounding_box + ", -1))"
      ].join(' ');
      geddy.log.debug(sql);

      client.query(sql, function(err, result) {
        if (err) {
          self.respond({});
        }

        var featureCollection = new FeatureCollection();
        for (i = 0; i < result.rows.length; i++) {
          var obj = {
              type: "Feature",
              properties: {
                  cp_type: result.rows[i].cp_type
              },
              geometry: JSON.parse(result.rows[i].shape)
          };
          featureCollection.features.push(obj);
        }
        self.respond(featureCollection);
      });
    });
  };

  function FeatureCollection() {
    this.type = 'FeatureCollection';
    this.features = new Array();
  };
};

exports.Map = Map;
