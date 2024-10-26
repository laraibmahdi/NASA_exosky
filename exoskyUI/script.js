let scene, camera, renderer, stars, starTrail;
const starCount = 5000; // Number of stars
let starTrails = []; // Store previous positions for the trail effect
const maxTrailLength = 10; // Number of positions in the trail
let displayExoplanet = false;



function init() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;
    renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('starMap'), alpha: false });
    renderer.setSize(window.innerWidth, window.innerHeight);
    addStars();
    animate();
    window.addEventListener('resize', onWindowResize, false);
}

function addStars() {
    const starGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(starCount * 3);
    const sizes = new Float32Array(starCount);
    const cameraZ = camera.position.z; // Initial z position of stars relative to the camera
    const fov = camera.fov * (Math.PI / 180); // Convert FOV to radians
    const aspectRatio = window.innerWidth / window.innerHeight;
    const visibleHeight = 2 * Math.tan(fov / 2) * cameraZ;
    const visibleWidth = visibleHeight * aspectRatio;

    for (let i = 0; i < starCount; i++) {
        positions[i * 3] = (Math.random() - 0.5) * visibleWidth * 10;
        positions[i * 3 + 1] = (Math.random() - 0.5) * visibleHeight * 10;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 200 - 100;
        sizes[i] = Math.random() * 0.5 + 0.1;
        starTrails.push([]); // Initialize an empty array for each star's trail positions
    }
    starGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    starGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));



    const starTexture = new THREE.TextureLoader().load('https://threejs.org/examples/textures/sprites/spark1.png');
    const starMaterial = new THREE.PointsMaterial({
        size: 0.2,
        sizeAttenuation: true,
        map: starTexture,
        transparent: true,
        opacity: 0.9,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
    });
    stars = new THREE.Points(starGeometry, starMaterial);
    scene.add(stars);
}



function animate() {
  if(displayExoplanet){
    return;
  }
  requestAnimationFrame(animate);
      // Move stars and update trail
      stars.geometry.attributes.position.array.forEach((value, index) => {
          if (index % 3 === 2) {
              const starIndex = Math.floor(index / 3);
              const zPos = stars.geometry.attributes.position.array[index];
              // Add the current position to the trail history
              const currentPosition = [
                  stars.geometry.attributes.position.array[index - 2], // x
                  stars.geometry.attributes.position.array[index - 1], // y
                  stars.geometry.attributes.position.array[index]      // z
              ];
              // Keep only the last 10 positions in the trail
              if (starTrails[starIndex].length >= maxTrailLength) {
                  starTrails[starIndex].shift();
              }
              starTrails[starIndex].push(currentPosition);
              // Move the stars forward
              stars.geometry.attributes.position.array[index] += 0.05;
              // Reset stars position once out of bounds
              if (stars.geometry.attributes.position.array[index] > 5) {
                  stars.geometry.attributes.position.array[index] = -100;
                  const cameraZ = camera.position.z;
                  const fov = camera.fov * (Math.PI / 180);
                  const aspectRatio = window.innerWidth / window.innerHeight;
                  const visibleHeight = 2 * Math.tan(fov / 2) * cameraZ;
                  const visibleWidth = visibleHeight * aspectRatio;
                  stars.geometry.attributes.position.array[index - 1] = (Math.random() - 0.5) * visibleHeight * 10;
                  stars.geometry.attributes.position.array[index - 2] = (Math.random() - 0.5) * visibleWidth * 10;
              }
          }
      });
      stars.geometry.attributes.position.needsUpdate = true;
      if(starTrail){
          renderStarTrails();
      }
      renderer.render(scene, camera);
}

function renderStarTrails() {
    const trailVertices = [];
    const velocityFactor = 1; // Adjust this value to control the speed of the trails

    starTrails.forEach((trail, starIndex) => {
        // Get the current star's position
        const starPos = stars.geometry.attributes.position.array;
        const zIndex = starIndex * 3 + 2; // z position index in the stars array
        
        // Update the star's z position based on velocity
        starPos[zIndex] += velocityFactor;

        // If the star goes beyond a certain limit, reset its position
        if (starPos[zIndex] > 5) {
            starPos[zIndex] = -100;
            const cameraZ = camera.position.z;
            const fov = camera.fov * (Math.PI / 180);
            const aspectRatio = window.innerWidth / window.innerHeight;
            const visibleHeight = 2 * Math.tan(fov / 2) * cameraZ;
            const visibleWidth = visibleHeight * aspectRatio;

            starPos[zIndex - 1] = (Math.random() - 0.5) * visibleHeight * 10; // y position
            starPos[zIndex - 2] = (Math.random() - 0.5) * visibleWidth * 10; // x position
        }

        // Add the current position to the trail history
        trail.forEach(pos => {
            trailVertices.push(...pos);
        });
    });

    const trailPositions = new Float32Array(trailVertices);
    const trailGeometry = new THREE.BufferGeometry();
    trailGeometry.setAttribute('position', new THREE.BufferAttribute(trailPositions, 3));
    
    const trailMaterial = new THREE.PointsMaterial({
        size: 0.1, // Size of each circular trail point
        sizeAttenuation: true,
        color: 0xffffff,
        transparent: true,
        opacity: 0.5, // Set the opacity of the trails
        depthWrite: false,
    });

    // Remove previous trail points if they exist
    if (starTrail) {
        scene.remove(starTrail);
    }

    // Create the points object for the trails
    starTrail = new THREE.Points(trailGeometry, trailMaterial);
    scene.add(starTrail);

}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

// Show or hide the dropdown menu
function toggleDropdown() {
  const dropdownMenu = document.getElementById("dropdownMenu");
  dropdownMenu.classList.toggle("hidden");
}

// Close the dropdown when clicking outside
window.onclick = function (event) {
  const dropdownMenu = document.getElementById("dropdownMenu");
  if (
    !event.target.matches("#dropdownButton") &&
    !dropdownMenu.contains(event.target)
  ) {
    dropdownMenu.classList.add("hidden");
  }
};

// Call the fetchAllPlanets on window load
window.onload = async function () {
  init(); // Initialize Three.js
  await fetchAllPlanets(); // Fetch all exoplanets
  document.getElementById("dropdownButton").onclick = toggleDropdown; // Toggle dropdown on button click

  // Add event listener for search input
  const searchInput = document.getElementById("dropdownButton");
  searchInput.addEventListener("input", filterPlanets);
};

async function searchPlanet(planetName) {
  console.log("Searching for planet:", planetName);
  const apiUrl = `https://exosky-eqaacuazcwazejev.canadacentral-01.azurewebsites.net/api/exoplanets?name=${planetName}`;

  try {
    const response = await fetch(apiUrl);

    if (!response.ok) {
      throw new Error(
        `HTTP error! Status: ${response.status} - ${response.statusText}`
      );
    }

    const data = await response.json();
    console.log(data);

    if (data.length === 0) {
      document.getElementById("result").innerHTML = "No planet found!";
    } else {
      const planet = data[0];
      // edit here
      openSkySimulation(planet.ra, planet.dec, planetName);
    }
  } catch (error) {
    console.error("Error fetching data:", error);
    document.getElementById("result").innerHTML =
      "An error occurred: " + error.message;
  }
}

function selectPlanet(planetName) {
    document.getElementById("dropdownButton").textContent = planetName;
    document.getElementById("dropdownMenu").classList.add("hidden");
    searchPlanet(planetName); // Call the search function with the selected planet
    document.getElementById("dropdownButton").classList.add("hidden");
    starTrail = true;
}

async function fetchAllPlanets() {
  const apiUrl =
    "https://exosky-eqaacuazcwazejev.canadacentral-01.azurewebsites.net/api/all-planets";
  try {
    const response = await fetch(apiUrl);
    const data = await response.json();
    const planetOptions = document.getElementById("planetOptions");
    planetOptions.innerHTML = "";

    if (data.length === 0) {
      planetOptions.innerHTML =
        "<li class='text-gray-500'>No planets found!</li>";
    } else {
      data.forEach((planet) => {
        const option = document.createElement("li");
        option.className = "p-4 text-white cursor-pointer hover:bg-blue-500";
        option.textContent = planet.pl_name;
        option.onclick = () => {
          console.log(`Planet selected: ${planet.pl_name}`); // Log the planet name
          selectPlanet(planet.pl_name); // Call selectPlanet to handle selection
        };
        planetOptions.appendChild(option);
      });
    }
  } catch (error) {
    console.error("Error fetching planets:", error);
    const planetOptions = document.getElementById("planetOptions");
    planetOptions.innerHTML =
      "<li class='text-gray-500'>Error fetching data!</li>";
  }
}

function filterPlanets() {
  const filter = document.getElementById("dropdownButton").value.toLowerCase();
  const planetOptions = document.getElementById("planetOptions");

  // Show or hide the loading message
  const loadingMessage = document.querySelector(".loading-message");
  loadingMessage.style.display = filter ? "none" : "block"; // Show loading when searching

  const options = planetOptions.getElementsByTagName("li");
  for (let i = 0; i < options.length; i++) {
    const option = options[i];
    const planetName = option.textContent.toLowerCase();
    option.style.display = planetName.includes(filter) ? "" : "none";
  }

  // Hide loading message once done
  loadingMessage.style.display = "none";
}

async function openSkySimulation(ra, dec, planetName) {

    async function loadDependencies() {
        console.log('loadDependencies called');
        try {
            await loadScript('https://cdn.jsdelivr.net/npm/three@0.132.2/build/three.min.js');
            await loadScript('https://cdn.jsdelivr.net/npm/three@0.132.2/examples/js/controls/OrbitControls.js');
            console.log('Three.js and OrbitControls loaded successfully');
            await loadStarData();
        } catch (error) {
            console.error('Error loading scripts:', error);
            showError('Failed to load required libraries. Please try refreshing the page.');
        }
    }
    loadDependencies();
    scene.remove(stars);
    scene.remove(starTrail);

    let isZoomedIn = false;
    const zoomInLevel = 50;
    const zoomOutLevel = 400;
    let textureLoader;
    let planetTexture;

function loadScript(url) {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = url;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
    });
}
 
let controls;
let centerSphere; 
let mouse;
let raycaster;

function initPlanet(starData) {
    mouse = new THREE.Vector2(); // Create a mouse vector
    console.log('init called with', starData.length, 'stars');            
    scene = new THREE.Scene();
    raycaster = new THREE.Raycaster(); // Create a raycaster
    //renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000); // Set clear color to black
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.gammaFactor = 2.2;

    document.body.appendChild(renderer.domElement);

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000);
    camera.position.set(0, 0, zoomOutLevel); // Move camera back further
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enableZoom = true;
    controls.screenSpacePanning = false;
    controls.enablePan = false;
    controls.minDistance = zoomInLevel;
    controls.maxDistance = zoomOutLevel;
    // camera.position.z = 200;

    camera.position.set(0, 0, zoomOutLevel); 
    controls.target.set(0, 0, 0); // Set control target to center of scene



    if (typeof THREE.OrbitControls !== 'function') {
        console.error('THREE.OrbitControls is not a constructor. Type:', typeof THREE.OrbitControls);
        showError('Failed to initialize controls. Please try refreshing the page.');
        return;
    }

    // Add an ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    // Initialize the texture loader
    textureLoader = new THREE.TextureLoader();

    // Load a planet texture
    const textures = [
        '2k_makemake_fictional.jpg', 
        '2k_ceres_fictional.jpg',
        '2k_haumea_fictional.jpg',
        '2k_eris_fictional.jpg'
    ];
    function getRandomTexture() {
        // Pick a random texture from the array
        const randomIndex = Math.floor(Math.random() * textures.length);
        return textures[randomIndex];
    }

    planetTexture = textureLoader.load(getRandomTexture(), 
        function(texture) {
            texture.minFilter = THREE.LinearMipMapLinearFilter;
            texture.magFilter = THREE.LinearFilter;
            texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
            // Texture loaded successfully
            console.log('Planet texture loaded');
            createPlanet();
        },
        undefined,
        function(err) {
            console.error('An error occurred loading the texture');
        }
    );

    planetTexture.anisotropy = renderer.capabilities.getMaxAnisotropy();
    planetTexture.encoding = THREE.sRGBEncoding;

    //createPlanet();
    addStars(starData);
    animatePlanet();

    window.addEventListener('resize', onWindowResize, false);
    window.addEventListener('mousemove', onMouseMove, false);
    window.addEventListener('click', onClick, false);  // Add click listener for planet
}

function onClick(event) {
    // Update the mouse position in normalized device coordinates
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    // Cast a ray from the camera to the scene
    raycaster.setFromCamera(mouse, camera);

    // Check if the planet (centerSphere) is clicked
    const intersects = raycaster.intersectObject(centerSphere);
    if (intersects.length > 0) {
        // Toggle zoom state with smooth animation using GSAP
        if (isZoomedIn) {
            gsap.to(camera.position, { z: zoomOutLevel, duration: 1, ease: "power2.inOut" });
        } else {
            gsap.to(camera.position, { z: zoomInLevel, duration: 1, ease: "power2.inOut" });
        }
        isZoomedIn = !isZoomedIn;  // Toggle the zoom state
    }
}


// Create a separate function to create the planet
function createPlanet() {
    const sphereGeometry = new THREE.SphereGeometry(15, 512, 512);
    const sphereMaterial = new THREE.MeshStandardMaterial({ 
        map: planetTexture,
        roughness: 0.5,
        bumpMap: planetTexture,
        bumpScale: 0.05
    });
    centerSphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    scene.add(centerSphere);

    // // Add a point light to illuminate the planet
    // const pointLight = new THREE.PointLight(0xffffff, 1, 100);
    // pointLight.position.set(10, 10, 10);
    // scene.add(pointLight);
}

function onMouseMove(event) {
    // Calculate mouse position in normalized device coordinates
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    // Update the raycaster
    raycaster.setFromCamera(mouse, camera);

    // dummy large sphere for intersection
    const interactionRadius = 10; // Increase this value for a larger interaction range
    const largeSphereGeometry = new THREE.SphereGeometry(interactionRadius, 32, 32);
    const largeSphereMaterial = new THREE.MeshBasicMaterial({ visible: false }); // Make it invisible
    const largeSphere = new THREE.Mesh(largeSphereGeometry, largeSphereMaterial);

    // Position the large sphere at the center of the centerSphere
    largeSphere.position.copy(centerSphere.position);

    // Calculate objects intersecting the picking ray
    const intersects = raycaster.intersectObjects([largeSphere]);
    if (intersects.length > 0) {
        document.body.style.cursor = 'pointer';
        centerSphere.material.emissive = new THREE.Color(0xaaaaaa);
        showPlanetName();
    } else {
        document.body.style.cursor = 'default';
        centerSphere.material.emissive = new THREE.Color(0x000000);
        //hidePlanetName();
    }
}

function showPlanetName() {
    const hoverDisplay = document.getElementById('hoverDisplay');
    hoverDisplay.innerText = `Planet: ${planetName}`; // Use the stored planet name
    hoverDisplay.style.display = 'block'; // Show the hover display

    // Set position based on mouse event coordinates
    hoverDisplay.style.left = `${event.clientX + 10}px`; // 10px offset to the right
    hoverDisplay.style.top = `${event.clientY - hoverDisplay.offsetHeight - 10}px`; // Position above the cursor
}


function addStars(starData) {
const starGeometry = new THREE.BufferGeometry();
const positions = new Float32Array(starData.length * 3);
const colors = new Float32Array(starData.length * 3);
const sizes = new Float32Array(starData.length);

let minRA = Infinity, maxRA = -Infinity;
let minDec = Infinity, maxDec = -Infinity;

// First pass: find min and max values
starData.forEach(star => {
minRA = Math.min(minRA, star.ra);
maxRA = Math.max(maxRA, star.ra);
minDec = Math.min(minDec, star.dec);
maxDec = Math.max(maxDec, star.dec);
});

const scaleFactor = 1000; // Increased scale factor
const centerRA = (minRA + maxRA) / 2;
const centerDec = (minDec + maxDec) / 2;

starData.forEach((star, i) => {
// Normalize and center the positions
const x = ((star.ra - centerRA) / (maxRA - minRA)) * scaleFactor;
const y = ((star.dec - centerDec) / (maxDec - minDec)) * scaleFactor;
const z = (Math.random() - 0.5) * scaleFactor; // Random depth

positions[i * 3] = x;
positions[i * 3 + 1] = y;
positions[i * 3 + 2] = z;

const color = new THREE.Color().setHSL(0, 0, 0.9 + Math.random() * 0.1);
colors[i * 3] = color.r;
colors[i * 3 + 1] = color.g;
colors[i * 3 + 2] = color.b;

sizes[i] = Math.max(2, star.brightness ? star.brightness * 5 : 2);
});

starGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
starGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
starGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));


const starTexture = new THREE.TextureLoader().load('https://threejs.org/examples/textures/sprites/spark1.png');

const starMaterial = new THREE.PointsMaterial({
size: 4,
vertexColors: true,
map: starTexture,
sizeAttenuation: true,
transparent: true,
opacity: 1,
});

stars = new THREE.Points(starGeometry, starMaterial);
scene.add(stars);

console.log('Added', starData.length, 'stars to the scene');
console.log('RA range:', minRA, 'to', maxRA);
console.log('Dec range:', minDec, 'to', maxDec);
}



function polarToCartesian(ra, dec, radius) {
    const phi = (90 - dec) * Math.PI / 180;
    const theta = ra * Math.PI / 180;
    const x = radius * Math.sin(phi) * Math.cos(theta);
    const y = radius * Math.cos(phi);
    const z = -radius * Math.sin(phi) * Math.sin(theta);
    return [x, y, z];
}

function animatePlanet() {
    displayExoplanet = true;
    requestAnimationFrame(animatePlanet);
    controls.update();
    renderer.render(scene, camera);
}



function showError(message) {
    const errorElement = document.getElementById('error-message');
    errorElement.textContent = message;
    errorElement.style.display = 'block';
}

async function loadStarData() {
    console.log('loadStarData called');
    console.log("Selected planet name:", planetName);
    try {
        console.log('Fetching star data for RA:', ra, 'DEC:', dec);
        const response = await fetch(`/api/star-data?ra=${ra}&dec=${dec}`);
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }
        const starData = await response.json();
        console.log('Received star data:', starData.length, 'stars');
        if (starData.length > 0) {
            console.log('Sample star data:', starData.slice(0, 5));
        }
        if (starData.length === 0) {
            showError("No star data found for this location.");
        } else {
            initPlanet(starData);
        }
    } catch (error) {
        console.error("Error fetching star data:", error);
        showError(`Error loading star data: ${error.message}`);
    }
}
console.log('Starting initialization');
}
