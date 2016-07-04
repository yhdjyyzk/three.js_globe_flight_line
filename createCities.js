/**
 * Created by ZhaokangYuan on 2016/1/14.
 */

var CreateCities = function (url) {
    this.url = url;

    this.create = function (scene, radius) {
        /*$.getJSON(url, function (cities) {
            var material = new THREE.ParticleBasicMaterial({size: 2, vertexColors: true, color: 0xffffff});
            var geom = new THREE.Geometry();

            for (var i = 0; i < cities.length; i++) {
                var lngLat = {lng: cities[i].long, lat: cities[i].lat};

                var l = radius * Math.cos(lngLat.lat / 180 * Math.PI);
                var x = l * Math.sin(lngLat.lng / 180 * Math.PI);
                var y = radius * Math.sin(lngLat.lat / 180 * Math.PI);
                var z = l * Math.cos(lngLat.lng / 180 * Math.PI);

                var particle = new THREE.Vector3(x, y, z);
                geom.vertices.push(particle);

                geom.colors.push(new THREE.Color(0x2EFFFF));
            }

            var system = new THREE.ParticleSystem(geom, material);
            scene.add(system);
        });*/

        d3.csv(url, function (error,data) {
            if(error)
                console.log(error);
            else{
                var material = new THREE.ParticleBasicMaterial({size: 0.5, vertexColors: true, color: 0xffffff});
                var geom = new THREE.Geometry();

                for (var i = 0; i < data.length; i++) {
                    var id=data[i]['id'];
                    var short_name=data[i]['short_name'];
                    var long_name=data[i]['long_name'];
                    var state=data[i]['state'];
                    var city=data[i]['city'];
                    var ip_count=data[i]['ip_count'];
                    var lat=data[i]['lat'];
                    var lng=data[i]['lng'];

                    var lngLat = {lng: lng, lat: lat};

                    var l = radius * Math.cos(lngLat.lat / 180 * Math.PI);
                    var x = l * Math.sin(lngLat.lng / 180 * Math.PI);
                    var y = radius * Math.sin(lngLat.lat / 180 * Math.PI);
                    var z = l * Math.cos(lngLat.lng / 180 * Math.PI);

                    var particle = new THREE.Vector3(x, y, z);
                    geom.vertices.push(particle);

                    geom.colors.push(new THREE.Color(0x2EFFFF));
                }

                var system = new THREE.ParticleSystem(geom, material);
                scene.add(system);
            }
        })
    }
}
