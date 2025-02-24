# NASA Space Apps Challenge 2024 (Byte Bisons)
How to run: 
`npm start`
Access `https://localhost:3000`
OR visit exosky-eqaacuazcwazejev.canadacentral-01.azurewebsites.net
## Exosky! Challenge Outline
### High-Level Summary
The Exoplanet Stellar Explorer (ESE) is an interactive web application that allows users to visualize the stellar environments of any chosen exoplanet. Users can select an exoplanet from the NASA Exoplanet Archive and enjoy a 3d representation of the stellar environment around the exoplanet. This project is important because it provides an engaging and accessible way for people of all ages to explore complex astronomical data and concepts, potentially inspiring youth to pursue their interests in astronomy. With further work, it could also serve as an educational tool, providing a fun way of interacting with exoplanetary data.
### Project Demo
https://github.com/laraibmahdi/NASA_exosky
### Final Project
https://docs.google.com/presentation/d/1-_XWtHnFXpZIL8m-trJbcVGVhcV5q-eQbLWmjau5ZUU/edit?usp=sharing
### Project Details
Exoplanet Stellar Explorer (ESE) allows for the exploration and visualization of exoplanetary data, namely the starry sky as observed from the point of view of someone on the exoplanet. ESE integrates data from the NASA Exoplanet Archive and the Gaia database to provide users with a 3D visualization of stellar environments for any exoplanet of their choosing. 

The backend handles API requests to the aforementioned astronomical databases with Node.js and Express. Specifically, we use the astronomical coordinates of the selected exoplanet (fetched from the NASA Exoplanet Archive) to query the Gaia database for coordinates of the surrounding stars. The frontend uses Three.js to render an interactive 3D representation of the stellar environment of the particular exoplanet selected.

The goal of ESE is to present complex astronomical datasets in an accessible and engaging manner for all ages, potentially serving as an educational resource.
### Use of Artificial Intelligence
AI tools were used in the making of this project. ChatGPT (https://chat.openai.com/) was used for information, ideas, and explanations.
### Space Agency Data
https://exoplanetarchive.ipac.caltech.edu/
https://www.cosmos.esa.int/web/gaia/data-release-3
### References
https://www.solarsystemscope.com/textures/
