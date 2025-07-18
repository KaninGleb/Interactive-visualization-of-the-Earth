# Earth Interactive Visualization 🌍

An interactive 3D visualization of Earth with customizable settings, built using **`Three.js`**. This project features a rotating Earth model with realistic textures, an atmospheric glow, a dynamic starfield, and post-processing effects like bloom. Users can interact with the scene using mouse controls and adjust various parameters through a settings menu. ✨

## Features 🌟

- **`Interactive Earth Model`** 🪐: View a high-quality 3D Earth with realistic textures (diffuse, specular, and normal maps) sourced from Three.js examples.
- **`Orbit Controls`** 🖱️: Rotate the Earth with mouse drag and zoom with scroll.
- **`Atmospheric Effects`** 🌌: Customize the glow intensity and color of Earth's atmosphere using a shader-based material.
- **`Dynamic Starfield`** ⭐: Adjust the number of stars (500–10,000), their size, and twinkling speed for a realistic night sky.
- **`Bloom Post-Processing`** 🌈: Fine-tune bloom effects with adjustable strength, radius, and threshold for a cinematic look.
- **`Responsive Design`** 📱: Adapts to different screen sizes with a mobile-friendly settings menu.
- **`GeoJSON Landmasses`** 🌎: Simplified representation of world landmasses using GeoJSON data, extruded as 3D shapes.
- **`Customizable Settings`** ⚙️: Modify simulation parameters via an intuitive UI, including:
  - Star count, size, and twinkle speed.
  - Atmospheric glow intensity and color.
  - Earth's rotation speed.
  - Bloom effect parameters.
- **`Loading Indicator`** ⏳: Displays a loading animation while textures are being fetched.

## Tech Stack 🛠️

- **`Three.js`**: For 3D rendering, scene management, and post-processing.
- **`HTML/CSS`**: Structured layout with a modern, responsive design using the Inter font and CSS custom properties.
- **`JavaScript` (ES Modules)**: Modular code for scene setup, controls, and animations.
- **`pnpm`**: Dependency management for faster and more efficient installs.
- **`Vite`**: Fast development server and build tool.
- **`Prettier`**: Code formatting for consistency.

## Installation 🚀

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/earth-visualization.git
   ```

2. Navigate to the project directory:
   ```bash
   cd earth-visualization
   ```

3. Install dependencies using pnpm:
   ```bash
   pnpm install
   ```

4. Start the development server:
   ```bash
   pnpm run dev
   ```

5. Open your browser and navigate to `http://localhost:5173` (or the port specified by Vite).

## Usage 🎮

- **Interaction** 🖼️:
  - Use the mouse to rotate the Earth.
  - Scroll to zoom in and out.
  - Click the ☰ button (top-right) to open the settings menu.
- **Settings Menu** 🛠️:
  - Adjust sliders and inputs to customize the visualization (e.g., star count, glow color, rotation speed).
  - Click "Apply" to update the scene with new settings.
- **Responsive Controls** 📲:
  - On mobile devices, the settings menu slides in from the right and takes up the full screen width.

## Dependencies 📦

- `three`: ^0.178.0 (3D rendering library)
- `prettier`: ^3.6.2 (code formatter)
- `vite`: ^7.0.5 (development server)

## Notes 📝

- Textures are loaded from `threejs.org` examples. Ensure an internet connection for the initial load.
- The GeoJSON data is simplified for performance; consider enhancing it for more detailed landmasses.
- Performance may vary based on device capabilities, especially with high star counts or bloom effects.
