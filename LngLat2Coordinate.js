/**
 * Created by ZhaokangYuan on 2016/1/15.
 */

var LngLat2Coordinate= function (lng,lat,radius) {
    var lngLat={lng:lng,lat:lat};
    var l = radius * Math.cos(lngLat.lat / 180 * Math.PI);

    var x = l * Math.sin(lngLat.lng / 180 * Math.PI);
    var y = radius * Math.sin(lngLat.lat / 180 * Math.PI);
    var z = l * Math.cos(lngLat.lng / 180 * Math.PI);
    return {x:x,y:y,z:z};
}