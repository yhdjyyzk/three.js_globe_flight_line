/**
 * Created by ZhaokangYuan on 2016/1/16.
 */

var Link = function (lng1, lat1, lng2, lat2, color, radius) {
    this.lat1 = lat1;
    this.lng1 = lng1;
    this.lat2 = lat2;
    this.lng2 = lng2;
    this.color = color;
    this.radius = radius;
    // this.scene = scene;
}

Link.prototype.create = function () {
    var SUBDIVISIONS = 2000;
    var geometry = new THREE.Geometry();

    var src_lnglat = LngLat2Coordinate(this.lng1, this.lat1, this.radius);
    var dst_lnglat = LngLat2Coordinate(this.lng2, this.lat2, this.radius);
    var control_lnglat = LngLat2Coordinate((this.lng1 + this.lng2) / 2.0, (this.lat1 + this.lat2) / 2.0, this.radius * 3.0);

    var src = new THREE.Vector3(src_lnglat.x, src_lnglat.y, src_lnglat.z);
    var dst = new THREE.Vector3(dst_lnglat.x, dst_lnglat.y, dst_lnglat.z);
    var control = new THREE.Vector3(control_lnglat.x, control_lnglat.y, control_lnglat.z);

    var curve = new THREE.QuadraticBezierCurve3();
    curve.v0 = dst;
    curve.v1 = control;
    curve.v2 = src;

    for (var i = 0; i < SUBDIVISIONS; i++) {
        geometry.vertices.push(curve.getPoint(i / SUBDIVISIONS));
    }

    var c = this.color;
    var material = new THREE.LineBasicMaterial({color: c});
    var line = new THREE.Line(geometry, material);
    //this.scene.add(line);
    return line;
}
