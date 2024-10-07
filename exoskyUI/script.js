let scene, camera, renderer, stars;
const starCount = 50000; // Number of stars
let exoplanets = []; // Store all fetched exoplanets
let currentIndex = 0;
const loadCount = 10; // Number of exoplanets to load each time

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
    }

    starGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    starGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    const starTexture = new THREE.TextureLoader().load('https://threejs.org/examples/textures/sprites/spark1.png');

    const starMaterial = new THREE.PointsMaterial({
        size: 0.2,
        sizeAttenuation: true,
        map: starTexture,
        transparent: true,
        opacity: 1,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
    });

    stars = new THREE.Points(starGeometry, starMaterial);
    scene.add(stars);
}

function animate() {
    requestAnimationFrame(animate);

    stars.geometry.attributes.position.array.forEach((value, index) => {
        if (index % 3 === 2) {
            stars.geometry.attributes.position.array[index] += 0.003;

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
    renderer.render(scene, camera);
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
window.onclick = function(event) {
    const dropdownMenu = document.getElementById("dropdownMenu");
    if (!event.target.matches('#dropdownButton') && !dropdownMenu.contains(event.target)) {
        dropdownMenu.classList.add("hidden");
    }
  };

// Call the fetchAllPlanets on window load
window.onload = async function() {
    init(); // Initialize Three.js
    await fetchAllPlanets(); // Fetch all exoplanets
    document.getElementById("dropdownButton").onclick = toggleDropdown; // Toggle dropdown on button click

    // Add event listener for search input
    const searchInput = document.getElementById("dropdownButton");
    searchInput.addEventListener("input", filterPlanets);
};

async function searchPlanet(planetName) {
    console.log("Searching for planet:", planetName);
    const apiUrl = `http://localhost:3000/api/exoplanets?name=${planetName}`;

    try {
        const response = await fetch(apiUrl);

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status} - ${response.statusText}`);
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

        const scriptRunUrl = `http://localhost:3000/api/run-script`;
        const scriptResponse = await fetch(scriptRunUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                ra_exo: data[0].ra,
                dec_exo: data[0].dec,
                distance_exo: data[0].sy_dist,
            }),
        });

        if (!scriptResponse.ok) {
            throw new Error(`Failed to run Python script: ${scriptResponse.status}`);
        }

        const scriptOutput = await scriptResponse.text();
        console.log("Script output:", scriptOutput);
    } catch (error) {
        console.error("Error fetching data:", error);
        document.getElementById("result").innerHTML = "An error occurred: " + error.message;
    }
}

function selectPlanet(planetName) {
    document.getElementById("dropdownButton").textContent = planetName;
    document.getElementById("dropdownMenu").classList.add("hidden");
    searchPlanet(planetName); // Call the search function with the selected planet
  }

async function fetchAllPlanets() {
    const apiUrl = "http://localhost:3000/api/all-planets";
    try {
        const response = await fetch(apiUrl);
        const data = await response.json();
        const planetOptions = document.getElementById("planetOptions");
        planetOptions.innerHTML = '';

        if (data.length === 0) {
            planetOptions.innerHTML = "<li class='text-gray-500'>No planets found!</li>";
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
        planetOptions.innerHTML = "<li class='text-gray-500'>Error fetching data!</li>";
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

function openSkySimulation(ra, dec, planetName) {
    // edit here
    const url = `/3d-simulation?ra=${encodeURIComponent(ra)}&dec=${encodeURIComponent(dec)}
        &name=${encodeURIComponent(planetName)}`;
    window.open(url, '_blank');
}
