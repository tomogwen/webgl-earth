// Created by Bjorn Sandvik - thematicmapping.org
(function () {
    function cityObject() {
        this.coord = [0,0,0];
        this.latlong = [0,0];
    }

	var webglEl = document.getElementById('webgl');
    var axis = new THREE.AxisHelper();
    var clicked = 0;

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
    cityLoc[2] = [0,0,1];

    for(var i = 0; i < 3; i++) {
        city[i] = new createCity(0.01, 0xff0000);
        city[i].position.x = cityLoc[i][0];
        city[i].position.y = cityLoc[i][1];
        city[i].position.z = cityLoc[i][2];
        city[i].name = "draw";
        scene.add(city[i]);
    }

    var points = []
    for(var i = 0; i < 2; i++) {
        points[i] = new cityObject();
    }

	render();

	function render() {
	    controls.update();
		//sphere.rotation.y += 0.0005;
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
                console.log(intersects[0]);
            }
        }
        requestAnimationFrame(render);
        renderer.render(scene, camera);
        clicked = 0;

	}

    function coordToLongLat(x, y, z) {
        // xyz to spherical
        // ONLY TRUE IF r = 1
        var theta = Math.acos(z);
        var psi = Math.atan(y/x);
        //spherical to lat/long
        var lat = theta * 180/Math.PI - 90;
        var lon = theta * 180/Math.PI;
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
