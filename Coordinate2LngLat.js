/**
 * Created by yuanzhaokang on 2016/1/19.
 */

var Coordinate2LngLat = function (x, y, z, radius) {
    var lng = Math.atan(parseFloat(x) / parseFloat(z));

    if (z <= 0 && x >= 0) {
        lng = lng / Math.PI * 180 + 180;
    }
    else if (z < 0 && x < 0) {
        lng = lng / Math.PI * 180 - 180;
    } else {
        lng = lng / Math.PI * 180;
    }

    var lat = Math.atan(parseFloat(y) / Math.sqrt(Math.pow(parseFloat(x), 2) + Math.pow(parseFloat(z), 2))) / Math.PI * 180;
    return { lng: lng, lat: lat };
}