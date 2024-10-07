let scene, camera, renderer, stars, starTrail;
const starCount = 10000; // Number of stars
let starTrails = []; // Store previous positions for the trail effect
const maxTrailLength = 10; // Number of positions in the trail

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
        size: 0.5,
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

    // Render the star trails
    renderStarTrails();

    stars.geometry.attributes.position.needsUpdate = true;
    renderer.render(scene, camera);
}

function renderStarTrails() {
    // For each star's trail, render the previous positions as small fading points
    const trailGeometry = new THREE.BufferGeometry();
    const trailVertices = [];

    starTrails.forEach(trail => {
        trail.forEach((pos, i) => {
            trailVertices.push(...pos);
        });
    });

    const trailPositions = new Float32Array(trailVertices);
    trailGeometry.setAttribute('position', new THREE.BufferAttribute(trailPositions, 3));

    const trailMaterial = new THREE.PointsMaterial({
        size: 0.1, // Make the trail points smaller than the stars
        sizeAttenuation: true,
        color: 0xffffff,
        transparent: true,
        opacity: 0.5, // Trail opacity (can be reduced for fading effect)
        depthWrite: false,
    });

    if (starTrail) {
        scene.remove(starTrail); // Remove the previous trail points
    }

    starTrail = new THREE.Points(trailGeometry, trailMaterial);
    scene.add(starTrail);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// Call the init function on window load
window.onload = function() {
    init(); // Initialize the scene
};
