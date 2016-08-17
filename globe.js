var VAG = VAG || {};

VAG.Globe = function (container, opts) {
    var Shaders = {
        'earth': {
            uniforms: {
                'texture': {type: 't', value: null}
            },
            vertexShader: [
                'varying vec3 vNormal;',
                'varying vec2 vUv;',
                'void main() {',
                'gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );',
                'vNormal = normalize( normalMatrix * normal );',
                'vUv = uv;',
                '}'
            ].join('\n'),
            fragmentShader: [
                'uniform sampler2D texture;',
                'varying vec3 vNormal;',
                'varying vec2 vUv;',
                'void main() {',
                'vec3 diffuse = texture2D( texture, vUv ).xyz;',
                'float intensity = 1.05 - dot( vNormal, vec3( 0.0, 0.0, 1.0 ) );',
                'vec3 atmosphere = vec3( 1.0, 1.0, 1.0 ) * pow( intensity, 3.0 );',
                'gl_FragColor = vec4( diffuse + atmosphere, 1.0 );',
                '}'
            ].join('\n')
        },
        'atmosphere': {
            uniforms: {},
            vertexShader: [
                'varying vec3 vNormal;',
                'void main() {',
                'vNormal = normalize( normalMatrix * normal );',
                'gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );',
                '}'
            ].join('\n'),
            fragmentShader: [
                'varying vec3 vNormal;',
                'void main() {',
                'float intensity = pow( 0.8 - dot( vNormal, vec3( 0, 0, 1.0 ) ), 12.0 );',
                'gl_FragColor = vec4( 1.0, 1.0, 1.0, 1.0 ) * intensity;',
                '}'
            ].join('\n')
        }
    };

    var camera, scene, renderer, w, h;
    var mesh, atmosphere, point, earthGlobe;

    var overRenderer;

    var curZoomSpeed = 0;

    var mouse = {x: 0, y: 0}, mouseOnDown = {x: 0, y: 0};
    var rotation = {x: 0, y: 0},
        target = {x: Math.PI * 1.2 / 2, y: Math.PI / 6.0},
        targetOnDown = {x: 0, y: 0};

    var distance = 8000, distanceTarget = 800;
    var PI_HALF = Math.PI / 2;
    var radius = 200;

    var cityData;

    function init() {

        container.style.color = '#fff';
        container.style.font = '13px/20px Arial, sans-serif';

        var shader, uniforms, material;

        w = $(window).width();
        h= $(window).height();

        camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 100000);
        scene = new THREE.Scene();

        //创建星空
        //var skySphere = new THREE.SphereGeometry(distance, 40, 30);
        //var sky = createMesh(skySphere, "starrySky.jpg");
        //scene.add(sky);

        //var axis = new THREE.AxisHelper(500);
        //scene.add(axis);

        var geometry = new THREE.SphereGeometry(radius, 40, 30);

        shader = Shaders['earth'];
        uniforms = THREE.UniformsUtils.clone(shader.uniforms);

        material = new THREE.MeshBasicMaterial({
            color: 0x000000
        });
        geometry = new THREE.SphereGeometry(radius, 40, 30);
        //earthGlobe = new THREE.Mesh(geometry, material);
        earthGlobe = createMesh(geometry, "./worldMap.png");
        earthGlobe.rotation.y = -Math.PI / 2;
        scene.add(earthGlobe);

        shader = Shaders['atmosphere'];
        uniforms = THREE.UniformsUtils.clone(shader.uniforms);

        material = new THREE.ShaderMaterial({
            uniforms: uniforms,
            vertexShader: shader.vertexShader,
            fragmentShader: shader.fragmentShader,
            side: THREE.BackSide,
            blending: THREE.AdditiveBlending,
            transparent: true
        });

        mesh = new THREE.Mesh(geometry, material);
        mesh.scale.set(1.1, 1.1, 1.1);
        scene.add(mesh);

        renderer = new THREE.WebGLRenderer({antialias: true});
        renderer.setSize(w, h);
        renderer.setClearColor(0x000000);

        drawWorldMap();
        //drawCities();
        drawDataSource();


        //var dst = {lng: 116, lat: 40};
        //var src = {lng: -43, lat: -22};
        //flightLine(src, dst);
        //
        //src = {lng: -179, lat: 30};
        //dst = {lng: 116, lat: 40};
        ///*ToDo*/
        //flightLine(src, dst);
        //
        //src = {lng: 140, lat: 35};
        //dst = {lng: 116, lat: 40};
        ///*ToDo*/
        //flightLine(src, dst);


        var flight = [{
            dst: {
                lng: 116,
                lat: 40
            },
            src: {
                lng: -43,
                lat: -22
            }
        }, {
            dst: {
                lng: 116,
                lat: 40
            },
            src: {
                lng: -179,
                lat: 30
            }
        }, {
            dst: {
                lng: 116,
                lat: 40
            },
            src: {
                lng: 140,
                lat: 35
            }
        }, {
            dst: {
                lng: 116,
                lat: 40
            },
            src: {
                lng: 114,
                lat: 22.5
            }
        }, {
            dst: {
                lng: 116,
                lat: 40
            },
            src: {
                lng: 121.5,
                lat: 25
            }
        }, {
            dst: {
                lng: 116,
                lat: 40
            },
            src: {
                lng: 106.5,
                lat: 6.2
            }
        }, {
            dst: {
                lng: 116,
                lat: 40
            },
            src: {
                lng: -77,
                lat: 39
            }
        }, {
            dst: {
                lng: 116,
                lat: 40
            },
            src: {
                lng: 149,
                lat: -35
            }
        }];

        for (var index = 0; index < flight.length; index++) {
            var line = flight[index];
            flightLine(line["src"], line["dst"]);
        }

        // var link = new Link(116.4, 39.9, 121, 25, 0xff0000, radius);
        // var line = link.create();
        // scene.add(line);

        // link = new Link(116.4, 39.9, 139, 35, 0x00ff00, radius);
        // line = link.create();
        // scene.add(line);

        // link = new Link(77, 28, 139, 35, 0x00ff00, radius);
        // line = link.create();
        // scene.add(line);

        // link = new Link(0, 52, -73, 40, 0x00ff00, radius);
        // line = link.create();
        // scene.add(line);

        // link = new Link(-58, -34, -73, 40, 0x00ffff, radius);
        // line = link.create();
        // scene.add(line);

        renderer.domElement.style.position = 'absolute';
        container.appendChild(renderer.domElement);
        container.addEventListener('mousedown', onMouseDown, false);
        container.addEventListener('mousewheel', onMouseWheel, false);

        container.addEventListener('mouseover', function () {
            overRenderer = true;
        }, false);
        container.addEventListener('mouseout', function () {
            overRenderer = false;
        }, false);
    }

    function drawWorldMap() { /*../../data/globe/world-countries.json*/
        d3.json("./world-countries.json", function (error, data) {
            var mapDrawer = new THREEGeoJSONGlobeMap();
            var boundaries = mapDrawer.drawThreeGeo(data, radius, "sphere", {
                color: 0xCCE563,
                transparent: true,
                opacity: 0.5
            });
            scene.add(boundaries);
        });
    }

    /*画城市*/
    function drawCities() {
        $.getJSON("./cities.json", function (data) {
            // console.log(data);
            var material = new THREE.PointsMaterial({
                vertexColors: true
            });
            var geometry = new THREE.Geometry();
            var cities = data["provinces"];
            for (var i = 0; i < cities.length; i++) {
                var city = cities[i];
                var lat = city["lat"];
                var lng = city["log"];
                var coor = LngLat2Coordinate(lng, lat, radius);
                var c = new THREE.Vector3(coor.x, coor.y, coor.z);
                c.infrmation = {
                    cityName: city["name"]
                };
                geometry.vertices.push(c);
                var color = new THREE.Color(0xaa0000);
                geometry.colors.push(new THREE.Color(0xaa0000));
            }
            var cityPoints = new THREE.Points(geometry, material);
            scene.add(cityPoints)
        });
    }

    function createMesh(geometry, imageFile) {
        var texturecreateMesh = THREE.ImageUtils.loadTexture(imageFile);
        var materialCreateMesh = new THREE.MeshBasicMaterial({
            // color: 0x000000
        });
        materialCreateMesh.map = texturecreateMesh;
        materialCreateMesh.side = THREE.DoubleSide;
        var meshCreateMesh = new THREE.Mesh(geometry, materialCreateMesh);
        return meshCreateMesh;
    }

    function onMouseDown(event) {
        event.preventDefault();

        container.addEventListener('mousemove', onMouseMove, false);
        container.addEventListener('mouseup', onMouseUp, false);
        container.addEventListener('mouseout', onMouseOut, false);

        mouseOnDown.x = -event.clientX + 200;
        mouseOnDown.y = event.clientY - 10;

        targetOnDown.x = target.x;
        targetOnDown.y = target.y;

        container.style.cursor = 'move';
    }

    function onMouseMove(event) {
        event.preventDefault();
        mouse.x = -event.clientX + 200;
        mouse.y = event.clientY - 10;

        var zoomDamp = distance / 1000;

        target.x = targetOnDown.x + (mouse.x - mouseOnDown.x) * 0.005 * zoomDamp;
        target.y = targetOnDown.y + (mouse.y - mouseOnDown.y) * 0.005 * zoomDamp;

        target.y = target.y > PI_HALF ? PI_HALF : target.y;
        target.y = target.y < -PI_HALF ? -PI_HALF : target.y;
    }

    function onMouseUp(event) {
        event.preventDefault();
        container.removeEventListener('mousemove', onMouseMove, false);
        container.removeEventListener('mouseup', onMouseUp, false);
        container.removeEventListener('mouseout', onMouseOut, false);
        container.style.cursor = 'auto';
    }

    function onMouseOut(event) {
        event.preventDefault();
        container.removeEventListener('mousemove', onMouseMove, false);
        container.removeEventListener('mouseup', onMouseUp, false);
        container.removeEventListener('mouseout', onMouseOut, false);
    }

    function onMouseWheel(event) {
        event.preventDefault();
        if (overRenderer) {
            zoom(event.wheelDeltaY * 0.3);
        }
        return false;
    }

    $(document).on("keydown", function (event) {
        // event.preventDefault();
        switch (event.keyCode) {
            case 38:
                zoom(100);
                event.preventDefault();
                break;
            case 40:
                zoom(-100);
                event.preventDefault();
                break;
        }
    });

    $(window).on("resize", function () {
        camera.aspect = (window.innerWidth) / (window.innerHeight);
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    })

    //$("#container").on("dblclick", function (event) {
    //    // var vector = new THREE.Vector3(((event.clientX) / parseInt($("#container").css("width"))) * 2 - 1,
    //    //     -((event.clientY) / parseInt($("#container").css("height"))) * 2 + 1, 0.1);
    //
    //    // vector.unproject(camera);
    //
    //    // var raycaster = new THREE.Raycaster(camera.position, vector.sub(camera.position).normalize());
    //    // var intersects = raycaster.intersectObject(earthGlobe);
    //    // console.log(intersects.length)
    //    // if(intersects.length > 0){
    //    //     console.log("hahha");
    //    // }
    //    distanceTarget = 300;
    //    $("#container").animate({
    //        "opacity": 0
    //    }, 1200, function () {
    //        window.location.href = "../index.html"
    //    });
    //});

    function zoom(delta) {
        distanceTarget -= delta;
        distanceTarget = distanceTarget > 800 ? 800 : distanceTarget;
        distanceTarget = distanceTarget < radius + 10 ? radius + 10 : distanceTarget;
    }

    function animate() {
        requestAnimationFrame(animate);
        TWEEN.update();
        render();
    }

    var dataSource = null;
    /*数据中心的粒子系统*/
    var dstRadius = 1000;

    var cities = [
        {
            lng: "-73.714454",
            lat: "40.7809425",
            information: "美国纽约"
        },
        {
            lng: "4.96688",
            lat: "52.2609",
            information: "荷兰阿姆斯特丹"
        },
        {
            lng: "2.5965",
            lat: "48.8596",
            information: "法国巴黎"
        },
        {
            lng: "13.5581",
            lat: "52.509",
            information: "德国柏林"
        },
        {
            lng: "-76.6066",
            lat: "38.9640919",
            information: "美国华盛顿"
        },
        {
            lng: "38.32686",
            lat: "55.5623",
            information: "俄罗斯莫斯科"
        },
        {
            lng: "127.2941",
            lat: "37.6788",
            information: "韩国首尔"
        },
        {
            lng: "-1.52329",
            lat: "47.12844",
            information: "法国南特"
        },
        {
            lng: "-89.7847",
            lat: "38.23536",
            information: "美国圣路易斯"
        },
        {
            lng: "11.87178",
            lat: "49.3102",
            information: "德国纽伦堡"
        },
        {
            lng: "101.745445",
            lat: "2.94631",
            information: "马来西亚吉隆坡"
        },
        {
            lng: "-122.386634",
            lat: "37.54826",
            information: "美国旧金山"
        },
        {
            lng: "-117.5416",
            lat: "33.54526",
            information: "美国洛杉矶"
        },
        {
            lng: "-45.8778",
            lat: "-17.00506",
            information: "巴西巴西利亚"
        },
        {
            lng: "1.011803",
            lat: "51.422",
            information: "英国"
        },
        {
            lng: "138.264",
            lat: "36.0128",
            information: "日本"
        },
        {
            lng: "8.33831",
            lat: "46.8675",
            information: "瑞士"
        },
        {
            lng: "12.624352",
            lat: "41.7901",
            information: "意大利"
        },
        {
            lng: "-100.7435",
            lat: "23.5934",
            information: "墨西哥"
        },
        {
            lng: "-64.994056",
            lat: "6.3663",
            information: "委内瑞拉"
        },
        {
            lng: "10.822594",
            lat: "60.0616",
            information: "挪威"
        },
        {
            lng: "-3.65738",
            lat: "40.1",
            information: "西班牙"
        },
        {
            lng: "101.772",
            lat: "15.05",
            information: "泰国"
        },
        {
            lng: "78.5972",
            lat: "22.3924",
            information: "印度"
        },
        {
            lng: "121.6306",
            lat: "-2.225",
            information: "印度尼西亚"
        }
    ];

    function drawDataSource() {
        scene.remove(dataSource);

        var circleGeometry = new THREE.Geometry();

        for (var i = 0; i < cities.length; i++) {
            var c = cities[i];
            var coordinate = LngLat2Coordinate(parseFloat(c.lng), parseFloat(c.lat), dstRadius);

            var point = new THREE.Vector3(
                coordinate["x"],
                coordinate["y"],
                coordinate["z"]
            );

            point.information = cities[i]["information"];

            circleGeometry.vertices.push(point);
            circleGeometry.colors.push(new THREE.Color(Math.floor(Math.random() * 0xffffff)));
        }

        var material = new THREE.PointsMaterial({
            color: 0xffffff,
            size: 15,
            transparent: true,
            blending: THREE.AdditiveBlending,
            map: createPoint(),
            // depthTest: false
            depthWrite: false   /*depthWrite设置为false。该属性决定这个对象是否影响WebGL的深度缓存。将
             它设置成false，可保证各个粒子系统之间不会相互影响。如果不是如此设置，
             那么当一个粒子处在另一个粒子的前面，而后者来自于别的粒子系统，有时候你
             会看到纹理的黑色背景。*/
        });

        dataSource = new THREE.Points(circleGeometry, material);
        scene.add(dataSource);

        /*粒子系统的鼠标交互*/
        $("#globe").on({
            "mousemove": function (event) {
                if (dataSource != null) {
                    var vector = new THREE.Vector3(((event.clientX) / parseInt($("#globe").css("width"))) * 2 - 1,
                        -((event.clientY ) / parseInt($("#globe").css("height"))) * 2 + 1, 0.1);

                    vector.unproject(camera);

                    var raycaster = new THREE.Raycaster(camera.position, vector.sub(camera.position).normalize());
                    var intersects = raycaster.intersectObject(dataSource);

                    if (intersects.length > 0) {
                        $("#globe").css("cursor", "pointer");
                        /*获取数据源的下标*/
                        var index = intersects[0]["index"];
                        /*获取数据源的信息*/
                        var information = dataSource.geometry.vertices[index]["information"];

                        /*显示信息框*/
                        $("#dataSourceInfo").show();
                        $("#dataSourceInfo").css({
                            "top": function () {
                                return event.clientY - $("#dataSourceInfo").height();
                            },
                            "left": function () {
                                return event.clientX;
                            }
                        });
                        $("#dataSourceInfo").text(information);
                    } else {
                        $("#globe").css("cursor", "auto");
                        $("#dataSourceInfo").hide();
                    }
                }
            },
            "mouseout": function () {

            }
        });

        /*创建纹理*/
        function createPoint() {
            var canvas = document.createElement("canvas");
            canvas.width = 16;
            canvas.height = 16;

            var context = canvas.getContext("2d");
            var gradient = context.createRadialGradient(canvas.width / 2, canvas.height / 2, 0, canvas.width / 2, canvas.height / 2, canvas.width / 2);

            gradient.addColorStop(0, 'rgba(255,255,255,1)');
            gradient.addColorStop(0.2, 'rgba(0,255,255,1)');
            gradient.addColorStop(0.4, 'rgba(0,0,64,1)');
            gradient.addColorStop(1, 'rgba(0,0,0,1)');

            context.fillStyle = gradient;
            context.fillRect(0, 0, canvas.width, canvas.height);

            var texture = new THREE.Texture(canvas);
            texture.needsUpdate = true;
            return texture;
        }
    }

    function animateDataSource() {
        var tween = new TWEEN.Tween({radius: dstRadius})
            .to({radius: radius}, 3500)
            .easing(TWEEN.Easing.Quadratic.InOut)
            .onUpdate(function () {
                var r = this.radius;
                dataSource.geometry.vertices.forEach(function (p, i) {
                    var x = p.x;
                    var y = p.y;
                    var z = p.z;

                    var lngLat = Coordinate2LngLat(x, y, z, r);
                    var coor = LngLat2Coordinate(lngLat["lng"], lngLat["lat"], r);

                    p.set(coor["x"], coor["y"], coor["z"]);
                });

                dataSource.geometry.verticesNeedUpdate = true;
            });
        tween.start();
    }

    animateDataSource();

    function render() {
        zoom(curZoomSpeed);

        rotation.x += (target.x - rotation.x) * 0.1;
        rotation.y += (target.y - rotation.y) * 0.1;
        distance += (distanceTarget - distance) * 0.3;

        camera.position.x = distance * Math.sin(rotation.x) * Math.cos(rotation.y);
        camera.position.y = distance * Math.sin(rotation.y);
        camera.position.z = distance * Math.cos(rotation.x) * Math.cos(rotation.y);

        camera.lookAt(new THREE.Vector3(0, 0, 0));

        scene.rotation.y -= 0.002;
        renderer.render(scene, camera);
    }


    // var src = { lng: 116, lat: 39 };
    // var dst = { lng: -43, lat: -23 };

    function flightLine(src, dst) { /*飞线的位置 pos = {x:x,y:y,z:z}*/

        var segments = [];
        var number;

        /*if (Math.abs(src["lng"] - dst["lng"]) > Math.abs(src["lat"]) - dst["lat"]) {
         number = Math.ceil(Math.abs(src["lng"] - dst["lng"]) / 0.9);
         } else {
         number = Math.ceil(Math.abs(src["lat"] - dst["lat"]) / 0.9);
         }

         var lngP = Math.abs(src["lng"] - dst["lng"]) / number;
         var latP = Math.abs(src["lat"] - dst["lat"]) / number;

         segments.push(
         {
         lng: src["lng"],
         lat: src["lat"]
         }
         );

         for (var index = 1; index < number; index++) {
         var lngTmp, latTmp;

         if (src["lng"] > dst["lng"]) {
         lngTmp = src["lng"] - index * lngP;
         } else if (src["lng"] < dst["lng"]) {
         lngTmp = src["lng"] + index * lngP;
         }

         if (src["lat"] > dst["lat"]) {
         latTmp = src["lat"] - index * latP;
         } else if (src["lat"] < dst["lat"]) {
         latTmp = src["lat"] + index * latP;
         }

         segments.push({
         lng: lngTmp,
         lat: latTmp
         });
         }

         segments.push({
         lng: dst["lng"],
         lat: dst["lat"]
         });*/

        /**/

        /*
         选定最佳视觉效果的单位变化角，根据两地坐标经纬度差中最大的确定number，即打点个数。因地球经度分为[-180, 0]与[0, 180]，
         所以要考虑在劣弧方向上打点，即反向计算求得点的位置
         所求曲线需要高出球面，设定中间点最高，超出球面直线高度为h，两边依次递减至球面，为得到尽量光滑的曲线，考虑高度变化为等差数列
         * */
        if (Math.abs(src["lng"] - dst["lng"]) > 180) {
            number = Math.ceil(Math.abs(-180 - src["lng"] - (180 - dst["lng"])) / 0.7);

            var num1, num2;
            var a1, a2;

            a1 = -180 - src["lng"];
            a2 = 180 - dst["lng"];

            num1 = Math.ceil(number * Math.abs(a1) / (a2 - a1));

            var lngP = Math.abs(src["lng"] - dst["lng"]) / number;
            var latP = Math.abs(src["lat"] - dst["lat"]) / number;

            segments.push(
                {
                    lng: src["lng"],
                    lat: src["lat"]
                }
            );

            for (var index = 1; index < number; index++) {
                var lngTmp, latTmp;

                if (index <= num1)
                    lngTmp = src["lng"] + index * a1 / num1;
                else
                    lngTmp = 180 - (index - num1) * a2 / (number - num1);

                if (src["lat"] > dst["lat"]) {
                    latTmp = src["lat"] - index * latP;
                } else if (src["lat"] < dst["lat"]) {
                    latTmp = src["lat"] + index * latP;
                }

                segments.push({
                    lng: lngTmp,
                    lat: latTmp
                });
            }

            segments.push({
                lng: dst["lng"],
                lat: dst["lat"]
            });

        } else {
            if (Math.abs(src["lng"] - dst["lng"]) > Math.abs(src["lat"] - dst["lat"])) {
                number = Math.ceil(Math.abs(src["lng"] - dst["lng"]) / 0.7);
            } else {
                number = Math.ceil(Math.abs(src["lat"] - dst["lat"]) / 0.7);
            }

            var lngP = Math.abs(src["lng"] - dst["lng"]) / number;
            var latP = Math.abs(src["lat"] - dst["lat"]) / number;

            segments.push(
                {
                    lng: src["lng"],
                    lat: src["lat"]
                }
            );

            for (var index = 1; index < number; index++) {
                var lngTmp, latTmp;

                if (src["lng"] > dst["lng"]) {
                    lngTmp = src["lng"] - index * lngP;
                } else if (src["lng"] < dst["lng"]) {
                    lngTmp = src["lng"] + index * lngP;
                }

                if (src["lat"] > dst["lat"]) {
                    latTmp = src["lat"] - index * latP;
                } else if (src["lat"] < dst["lat"]) {
                    latTmp = src["lat"] + index * latP;
                }

                segments.push({
                    lng: lngTmp,
                    lat: latTmp
                });
            }

            segments.push({
                lng: dst["lng"],
                lat: dst["lat"]
            });
        }

        /**/

        //var lineMaterial = new THREE.LineBasicMaterial({
        //    color: 0x389599
        //});
        //var lineGeometry = new THREE.Geometry();

        //var srcCoor = LngLat2Coordinate(src["lng"], src["lat"], radius);
        //lineGeometry.vertices.push(new THREE.Vector3(srcCoor["x"], srcCoor["y"], srcCoor["z"]));

        var flightPointsMaterial = new THREE.PointsMaterial({
            vertexColors: true,
            color: 0xffffff,
            size: 3,
            depthWrite: false
        });

        var flightPointsGeometry = new THREE.Geometry();

        for (var index = 1; index < segments.length - 1; index++) {
            var r, h = radius / 10;

            /*
             从起点到终点，把经度和纬度的变化均匀分成number份，距离球面最高点为radius/10，高度变化线性增长，最高点为中点，
             平均变化量为radius/(10*number / 2),如此计算number个点（除掉起点）的位置，再顺序链接得到近似曲线
             */
            if (index <= number / 2) {
                //r = radius + index * radius / (number / 2 * 10);
                r = radius + 4 * h / (number + 2) * index - (index * (index - 1 ) / 2) * 8 * h / (Math.pow(number, 2) + 2 * number );
            } else {
                //r = radius + radius / 10 - (index - number / 2) * radius / (number / 2 * 10);
                var i = number - index;
                r = radius + 4 * h / (number + 2) * i - (i * (i - 1 ) / 2) * 8 * h / (Math.pow(number, 2) + 2 * number );
            }

            var coor = LngLat2Coordinate(segments[index]["lng"], segments[index]["lat"], r);
            //lineGeometry.vertices.push(
            //    new THREE.Vector3(coor["x"], coor["y"], coor["z"])
            //);

            flightPointsGeometry.vertices.push(
                new THREE.Vector3(coor["x"], coor["y"], coor["z"])
            );

            flightPointsGeometry.colors.push(
                new THREE.Color(0xffffff)
            );
        }

        var flightPoints = new THREE.Points(flightPointsGeometry, flightPointsMaterial);

        var tween = new TWEEN.Tween({num: 0})
            .to({num: flightPoints.geometry.colors.length}, 3500)
            .easing(TWEEN.Easing.Linear.None)
            .onUpdate(function () {
                var n = Math.floor(this.num);

                /*flightPoints.geometry.colors.forEach(function (p, i) {
                 if (i == n) {
                 p.set(new THREE.Color(0x00a0e9));
                 } else {
                 p.set(new THREE.Color(0xffffff));
                 }
                 });*/

                for (var index = 0; index < flightPoints.geometry.colors.length; index++) {
                    if (index == n) {
                        //flightPoints.geometry.colors[index].set(new THREE.Color(0x00a0e9));
                        try {
                            flightPoints.geometry.colors[index].set(new THREE.Color(0xff0000));
                            flightPoints.geometry.colors[index + 1].set(new THREE.Color(0xaa0000));
                            flightPoints.geometry.colors[index + 2].set(new THREE.Color(0x550000));
                            flightPoints.geometry.colors[index + 3].set(new THREE.Color(0xaa0000));
                            flightPoints.geometry.colors[index + 4].set(new THREE.Color(0xff0000));
                            index += 4;
                        } catch (e) {

                        }
                    } else {
                        flightPoints.geometry.colors[index].set(new THREE.Color(0xffffff));
                    }
                }

                flightPoints.geometry.colorsNeedUpdate = true;
            });

        tween.repeat(Infinity);
        tween.start();

        scene.add(flightPoints);
    }

    init();

    this.animate = animate;
    return this;
};

$(function () {
    var container = $("#globe")[0];
    var globe = new VAG.Globe(container);
    if (!Detector.webgl) {
        Detector.addGetWebGLMessage();
    } else {
        globe.animate();
    }
});