# Interactive Open Street Map 3D Visualization

The Interactive Map 3D Visualization project offers a dynamic and immersive experience for exploring geographical data in a three-dimensional environment. Leveraging the power of WebGL and the Three.js library, this project provides users with an interactive map viewing experience.

## Features

### 1. Detailed Building Rendering
Render 3D buildings based on geographical data and urban landscapes uploaded from Open Street Map (OSM).

### 2. Dynamic Road Display
Display dynamic roads and streets on the map based on OSM.

### 3. Lush Tree Population
Woodlands can be loaded with height information for each tree type.

### 4. Realistic Water Bodies
Visualize lakes, rivers, and other water bodies using advanced water shaders.

### 5. Interactive Controls
Users can interact with the map using controls such as zooming, panning, and rotating. These interactive features enable users to explore the map from different perspectives and angles.

## Installation

1. Clone this repository to your local machine.
2. Install threejs in the directory: "npm install three".
3. Install vite: "npm install vite".
4. Open the HTML file in a vite localhost: "npx vite".
5. Ensure an active internet connection to load dependencies via URLs.

## Usage

1. Start the development server: npx vite
2. Open your web browser and navigate to http://localhost:5173 to access the interactive map.

## Configuration

- Modify the config.js file to customize settings such as map center coordinates, default location, and initial zoom level.
- Adjust colors, materials, and rendering settings in the respective Three.js scripts to customize the map appearance further.

## Dependencies

- Three.js: A JavaScript library for building 3D graphics on the web.
- GeoTIFF: A JavaScript library for reading and manipulating GeoTIFF files.
- OpenStreetMap Data: Geographic data obtained from OpenStreetMap, used for rendering map features.
