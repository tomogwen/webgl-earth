// Created by Bjorn Sandvik - thematicmapping.org
(function () {
    function cityObject() {
        this.coord = [0,0,0];
        this.lon = 0;
        this.lat = 0;
    }

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

	var width     = window.innerWidth,
		height    = window.innerHeight;

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
    cityLoc[2] = [1/Math.sqrt(3),1/Math.sqrt(3),1/Math.sqrt(3)];

    for(var i = 0; i < 3; i++) {
        city[i] = new createCity(0.01, 0xff0000);
        city[i].position.x = cityLoc[i][0];
        city[i].position.y = cityLoc[i][1];
        city[i].position.z = cityLoc[i][2];
        city[i].name = "draw";
        scene.add(city[i]);
    }

    var points = []
    for(var i = 0; i < 3; i++) {
        points[i] = new cityObject();
    }
    var pointCount = 0;

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
            }
        }

        if(pointCount == 2 && clicked == 1 && drawn == 0) {
            console.log("Central Angle (deg): " + centralAngle(points[0], points[1]));
            //clicked = 2;
            var v1 = new THREE.Vector3(points[0].coord[0], points[0].coord[1], points[0].coord[2]);
            var v2 = new THREE.Vector3(points[1].coord[0], points[1].coord[1], points[1].coord[2]);
            var curveObject = setArc3D(v1,v2,30, 0x00ff00, false);
            scene.add(curveObject);

            drawn = 1;
        }
        requestAnimationFrame(render);
        renderer.render(scene, camera);
        clicked = 0;
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

        /*console.log("X: "+x);
        console.log("Y: "+y);
        console.log("Z: "+z);//*/

        // xyz to spherical
        // ONLY TRUE IF r = 1
        var theta = Math.acos(z);
        var psi = Math.atan(y/x);
        //console.log("theta: " + theta);
        //console.log("psi: " + psi);
        //spherical to lat/long
        var lon = theta * 180/Math.PI;
        var lat = psi * 180/Math.PI - 90;

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
      	mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
      	mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
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
        earth.name = "earth";
      	scene.add(earth);
        var clouds = createClouds(radius, segments);
      	clouds.rotation.y = rotation;
      	//scene.add(clouds);
      	var stars = createStars(90, 64);
        stars.name = "stars";
      	scene.add(stars);
    }

    window.addEventListener('click', onMouseMove, false );
    window.requestAnimationFrame(render);

}());
