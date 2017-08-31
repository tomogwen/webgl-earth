// Created by Bjorn Sandvik - thematicmapping.org
(function () {
    function cityObject() {
        this.coord = [0,0,0];
        this.lon = 0;
        this.lat = 0;
    }

    var c = document.getElementById("mapCanvas");
    var ctx = c.getContext("2d");

	var webglEl = document.getElementById('webgl');
    var axis = new THREE.AxisHelper();
    var clicked = 0;
    var drawn = 0;

	if (!Detector.webgl) {
		Detector.addGetWebGLMessage(webglEl);
		return;
	}

    var raycaster = new THREE.Raycaster(),
        mouse     = new THREE.Vector2();

	var width     = 0.749*window.innerWidth,
		height    = 0.5*window.innerHeight;

	// Earth params
	var radius   = 1,
		segments = 32,
        rotation = 6;

	var scene = new THREE.Scene();
    scene.add(axis);

	var camera = new THREE.PerspectiveCamera(45, width / height, 0.01, 1000);
	camera.position.z = 1*0.8;
    camera.position.x = 3*0.8;
    camera.position.y = 1.5*0.8;

	var renderer = new THREE.WebGLRenderer();
	renderer.setSize(width, height);
    createEarth();
	var controls = new THREE.TrackballControls(camera);
	webglEl.appendChild(renderer.domElement);

    var city = [];
    var cityLoc = [];
    cityLoc[0] = [1,0,0];
    cityLoc[1] = [0,1,0];
    cityLoc[2] = [0,0,1];
    //cityLoc[3] = [2/Math.sqrt(3),0,1/Math.sqrt(3)];
    //cityLoc[2] = [1/Math.sqrt(3),1/Math.sqrt(3),1/Math.sqrt(3)];//*/

    var count = 0;

    for(var i = 0; i < 11; i++) {
        for(var j = 0; j < 11; j++) {
            var x = i/10;
            var y = j/10
            var z = Math.sqrt(1- x**2 - y**2);
            cityLoc[count] = [x,y,z];
            count += 1;
        }
    }//*/

    for(var i = 0; i < count; i++) {
        city[i] = new createCity(0.015, 0xff0000);
        city[i].position.x = cityLoc[i][0];
        city[i].position.y = cityLoc[i][1];
        city[i].position.z = cityLoc[i][2];
        city[i].name = "draw";
        scene.add(city[i]);
    }
    var points = []
    for(var i = 0; i < count; i++) {
        points[i] = new cityObject();
    }
    var pointCount = 0;

    // Work on adding points/lines to map
    /*var mapCanvas = document.createElement('canvas');
    mapCanvas.id = "mapCanvas"
    mapCanvas.style = "z-index:20; position:relative;"
    var mapDiv = document.getElementById('map333');
    mapDiv.appendChild(mapCanvas);//*/

    var canvas = document.getElementById('mapCanvas');

    // Make it visually fill the positioned parent
    canvas.style.width ='100%';
    canvas.style.height='100%';
    canvas.width  = 0.995*document.getElementById("map333").offsetWidth;
    canvas.height = 0.995*document.getElementById("map333").offsetHeight;

	render();

	function render() {
	    controls.update();
		//earth.rotation.y += 0.0005;
	    //clouds.rotation.y += 0.0005;

        if(clicked == 1) {
            raycaster.setFromCamera( mouse, camera );

            // calculate objects intersecting the picking ray
            var intersects = raycaster.intersectObjects( scene.children );
            /*for ( var i = 0; i < intersects.length; i++ ) {
                intersects[ i ].object.material.color.set( 0x00ff00 );
            }//*/
            if(intersects[0].object.name == "draw" ) {
                intersects[0].object.material.color.set( 0x00ff00 );

                var tempX = intersects[0].point.x;
                var tempY = intersects[0].point.y;
                var tempZ = intersects[0].point.z;

                points[pointCount].coord[0] = tempX;
                points[pointCount].coord[1] = tempY;
                points[pointCount].coord[2] = tempZ;

                var tempLonLat = coordToLonLat(tempX, tempY, tempZ);
                points[pointCount].lon = tempLonLat[0];
                points[pointCount].lat = tempLonLat[1];

                pointCount += 1;
                appendText("Position of city " + pointCount + ":");
                appendText("Lon: " + tempLonLat[0]);
                appendText("Lat: " + tempLonLat[1]);

                var coordTemp = convert(tempLonLat[0], tempLonLat[1]);
                drawPoint(coordTemp[0], coordTemp[1], 5);
                //appendText("3d Coord: " + [tempX, tempY, tempZ]);
            }
        }

        if(pointCount == 2 && clicked == 1 && drawn == 0) {
            appendText("Distance between cities:");
            console.log("Central Angle (deg): " + centralAngle(points[0], points[1]));
            var ang = centralAngle(points[0], points[1]);
            appendText("Central Angle: " + ang + "˚");
            //clicked = 2;
            var v1 = new THREE.Vector3(points[0].coord[0], points[0].coord[1], points[0].coord[2]);
            var v2 = new THREE.Vector3(points[1].coord[0], points[1].coord[1], points[1].coord[2]);
            var curveObject = setArc3D(v1,v2,30, 0x00ff00, false);
            scene.add(curveObject);

            for(var i = 0; i < curveObject.geometry.vertices.length; i++) {
                var x3d = curveObject.geometry.vertices[i].x;
                var y3d = curveObject.geometry.vertices[i].y;
                var z3d = curveObject.geometry.vertices[i].z;
                var tLonLat = coordToLonLat(x3d, y3d, z3d);
                var tCoord = convert(tLonLat[0], tLonLat[1]);
                drawPoint(tCoord[0], tCoord[1], 1);
            }
            appendText("Arc Length = " + 2*Math.PI*6371*ang/360 + " km");
            drawn = 1;
        }
        requestAnimationFrame(render);
        renderer.render(scene, camera);
        clicked = 0;
	}

    function convert(lon, lat){
        MAP_WIDTH = document.getElementById("map333").offsetWidth;
        MAP_HEIGHT = document.getElementById("map333").offsetHeight;
        var y = ((-1 * lat) + 90) * (MAP_HEIGHT / 180);
        var x = (lon + 180) * (MAP_WIDTH / 360);
        return [x,y];
    }

    function drawPoint(x,y,r) {
        ctx.fillStyle = 'red';
        ctx.beginPath();
        ctx.arc(x,y,r,0,2*Math.PI); // x,y,radius,startAngle,endAngle
        ctx.stroke();
        ctx.fill();
    }

    function appendText(text) {
        var para = document.createElement("p");
        var node = document.createTextNode(text);
        para.appendChild(node);

        var el = document.getElementById('questions');
        el.appendChild(para);
    }

    function setArc3D(pointStart, pointEnd, smoothness, color, clockWise) {
        // calculate a normal ( taken from Geometry().computeFaceNormals() )
        var cb = new THREE.Vector3(), ab = new THREE.Vector3(), normal = new THREE.Vector3();
        cb.subVectors(new THREE.Vector3(), pointEnd);
        ab.subVectors(pointStart, pointEnd);
        cb.cross(ab);
        normal.copy(cb).normalize();

        var angle = pointStart.angleTo(pointEnd); // get the angle between vectors
        if (clockWise)
            angle = angle - Math.PI * 2;  // if clockWise is true, then we'll go the longest path
        var angleDelta = angle / (smoothness - 1); // increment

        var geometry = new THREE.Geometry();
        for (var i = 0; i < smoothness; i++) {
            geometry.vertices.push(pointStart.clone().applyAxisAngle(normal, angleDelta * i));
        }

        var arc = new THREE.Line(geometry, new THREE.LineBasicMaterial({
            color: color
        }));
        return arc;
    }

    function coordToLonLat(x, y, z) {
        if(x > 1)
            x = 1;
        if(y > 1)
            y = 1;
        if(z > 1)
            z = 1;
        if(x < 0.015 && x > -0.015)
            x = 0;
        if(y < 0.015 && y > -0.015)
            y = 0;
        if(z < 0.015 && z > -0.015)
            z = 0;
        /*console.log("X: "+x);
        console.log("Y: "+y);
        console.log("Z: "+z);//*/

        // xyz to spherical
        // ONLY TRUE IF r = 1
        var theta = Math.acos(Math.sqrt(x**2 + z**2));
        var psi = Math.atan(z/x);
        //console.log("theta: " + theta);
        //console.log("psi: " + psi);
        //spherical to lat/long
        var lat = theta * 180/Math.PI;
        var lon = psi * 180/Math.PI;

        if(y<0)
            lat = -lat;
        if(z>0)
            lon = -lon;
        //console.log("Lon: "+lon);
        //console.log("Lat: "+lat);
        return [lon, lat];
    }

    function centralAngle(first, second) {
        psi1 = first.lat * Math.PI/180;
        psi2 = second.lat * Math.PI/180;
        lambda1 = first.lon * Math.PI/180;
        lambda2 = second.lon * Math.PI/180;
        /*console.log("---------------------------------")
        console.log("Psi1: " + psi1);
        console.log("Psi2: " + psi2);
        console.log("Lambda1: " + lambda1);
        console.log("Lambda2: " + lambda2);//*/
        // keep in radians throughout, convert at the end
        term1 = ( Math.sin( (psi1-psi2)/2 ) )**2;
        //console.log("Term 1: " + term1);
        term2 = (Math.sin((lambda1-lambda2)/2))**2;
        //console.log("Term 2: " + term2);
        term3 = Math.sqrt(term1 + Math.cos(psi1)*Math.cos(psi2)*term2);
        /*console.log("cos(psi1): " + Math.cos(psi1));
        console.log("cos(psi2): " + Math.cos(psi2));
        console.log("Term 3: " + term3);
        console.log("Radians Central Angle: " + 2*Math.asin(term3));//*/
        return 2*Math.asin(term3) * 180/Math.PI;
    }

    function degSin(x) {
        return Math.sin(x * 180/Math.PI);
    }

    function degCos(x) {
        return Math.cos(x * 180/Math.PI);
    }

    function onMouseMove(event) {
        console.log("click");
      	// calculate mouse position in normalized device coordinates
      	// (-1 to +1) for both components
      	mouse.x = ( event.clientX / width ) * 2 - 1;
      	mouse.y = - ( event.clientY / height ) * 2 + 1;
        clicked = 1;
    }

    function createCity(radius, color) {
        return new THREE.Mesh(
            new THREE.SphereGeometry(radius, 16, 16),
            new THREE.MeshBasicMaterial( {color: color} )
            )
    }//*/

    function createSphere(radius, segments) {
		return new THREE.Mesh(
			new THREE.SphereGeometry(radius, segments, segments),
			new THREE.MeshPhongMaterial({
				map:         THREE.ImageUtils.loadTexture('images/2_no_clouds_4k.jpg'),
				bumpMap:     THREE.ImageUtils.loadTexture('images/elev_bump_4k.jpg'),
				bumpScale:   0.005,
				specularMap: THREE.ImageUtils.loadTexture('images/water_4k.png'),
				specular:    new THREE.Color('grey')
			})
		);
	}

	function createClouds(radius, segments) {
		return new THREE.Mesh(
			new THREE.SphereGeometry(radius + 0.003, segments, segments),
			new THREE.MeshPhongMaterial({
				map:         THREE.ImageUtils.loadTexture('images/fair_clouds_4k.png'),
				transparent: true
			})
		);
	}

	function createStars(radius, segments) {
		return new THREE.Mesh(
			new THREE.SphereGeometry(radius, segments, segments),
			new THREE.MeshBasicMaterial({
				map:  THREE.ImageUtils.loadTexture('images/galaxy_starfield.png'),
				side: THREE.BackSide
			})
		);
	}

    function createEarth() {
        scene.add(new THREE.AmbientLight(0x333333));

      	var light = new THREE.DirectionalLight(0xffffff, 1);
      	light.position.set(150,50,150);
      	scene.add(light);

        var earth = createSphere(radius, segments);
      	earth.rotation.y = rotation;
        earth.rotation.y += 0.3;
        earth.name = "earth";
      	scene.add(earth);
        var clouds = createClouds(radius, segments);
      	clouds.rotation.y = rotation;
      	//scene.add(clouds);
      	var stars = createStars(90, 64);
        stars.name = "stars";
      	scene.add(stars);
    }

    document.getElementById('webgl').addEventListener('click', onMouseMove, false );
    window.requestAnimationFrame(render);

}());
