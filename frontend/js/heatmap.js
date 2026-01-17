 // Initialize the map focused on India
        let map = L.map('map').setView([20.5937, 78.9629], 5);

        // Add CartoDB Positron tiles for better contrast
        L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
            attribution: '© OpenStreetMap contributors © CARTO',
            subdomains: 'abcd',
            maxZoom: 20
        }).addTo(map);

        // Store grid rectangles
        let gridRectangles = [];
        let currentData = {};

        // More accurate India bounds
        const INDIA_BOUNDS = {
            north: 37.5,
            south: 6.5,
            east: 97.5,
            west: 68.0
        };

        // Set map bounds to restrict view to India
        const southWest = L.latLng(INDIA_BOUNDS.south - 2, INDIA_BOUNDS.west - 2);
        const northEast = L.latLng(INDIA_BOUNDS.north + 2, INDIA_BOUNDS.east + 2);
        const bounds = L.latLngBounds(southWest, northEast);
        map.setMaxBounds(bounds);

        // Enhanced color scale with better visibility
        function getColorForPM(value) {
            if (value === null || value === undefined) return '#E0E0E0';
            if (value <= 15) return '#00E400';    // Bright green
            if (value <= 30) return '#FFFF00';    // Yellow
            if (value <= 55) return '#FF8C00';    // Orange
            if (value <= 110) return '#FF0000';   // Red
            return '#8B008B';                     // Dark magenta
        }

        // Generate more realistic mock data with city hotspots
        function generateMockData() {
            const data = {};
            
            // Major Indian cities with typically higher pollution
            const pollutionHotspots = [
                {lat: 28.6, lng: 77.2, name: "Delhi", basePM: 120},
                {lat: 19.0, lng: 72.8, name: "Mumbai", basePM: 85},
                {lat: 22.5, lng: 88.3, name: "Kolkata", basePM: 95},
                {lat: 12.9, lng: 77.6, name: "Bangalore", basePM: 65},
                {lat: 17.3, lng: 78.4, name: "Hyderabad", basePM: 75},
                {lat: 13.0, lng: 80.2, name: "Chennai", basePM: 70},
                {lat: 23.0, lng: 72.5, name: "Ahmedabad", basePM: 90},
                {lat: 26.9, lng: 80.9, name: "Lucknow", basePM: 110},
                {lat: 25.3, lng: 82.9, name: "Varanasi", basePM: 105},
                {lat: 30.3, lng: 78.0, name: "Dehradun", basePM: 80}
            ];

            // Create a 0.5-degree grid for better resolution
            for (let lat = INDIA_BOUNDS.south; lat < INDIA_BOUNDS.north; lat += 0.5) {
                for (let lng = INDIA_BOUNDS.west; lng < INDIA_BOUNDS.east; lng += 0.5) {
                    const gridKey = `${lat.toFixed(1)}_${lng.toFixed(1)}`;
                    
                    // Base pollution level
                    let basePM25 = 25 + Math.random() * 30;
                    
                    // Check proximity to pollution hotspots
                    for (const hotspot of pollutionHotspots) {
                        const distance = Math.sqrt(
                            Math.pow(lat - hotspot.lat, 2) + 
                            Math.pow(lng - hotspot.lng, 2)
                        );
                        
                        if (distance < 1) {
                            const influence = Math.max(0, 1 - distance);
                            basePM25 += hotspot.basePM * influence;
                        }
                    }
                    
                    // Add some regional variation
                    const regionalFactor = Math.sin(lat * 0.1) * Math.cos(lng * 0.1) * 20;
                    basePM25 += regionalFactor;
                    
                    // Ensure values are within realistic bounds
                    basePM25 = Math.max(5, Math.min(200, basePM25));
                    
                    data[gridKey] = {
                        lat: lat,
                        lng: lng,
                        pm25: Math.round(basePM25),
                        pm10: Math.round(basePM25 * 1.5 + Math.random() * 20),
                        source: 'satellite',
                        timestamp: new Date().toISOString()
                    };
                }
            }
            
            return data;
        }

        // Create enhanced grid rectangles
        function createGridRectangles() {
            // Clear existing rectangles
            gridRectangles.forEach(rect => map.removeLayer(rect));
            gridRectangles = [];

            const pollutant = document.getElementById('pollutant').value;
            const dataSource = document.getElementById('data-source').value;

            for (let lat = INDIA_BOUNDS.south; lat < INDIA_BOUNDS.north; lat += 0.5) {
                for (let lng = INDIA_BOUNDS.west; lng < INDIA_BOUNDS.east; lng += 0.5) {
                    const gridKey = `${lat.toFixed(1)}_${lng.toFixed(1)}`;
                    const gridData = currentData[gridKey];
                    
                    if (gridData) {
                        const pmValue = pollutant === 'pm25' ? gridData.pm25 : gridData.pm10;
                        const color = getColorForPM(pmValue);
                        
                        const rectangle = L.rectangle([
                            [lat, lng],
                            [lat + 0.5, lng + 0.5]
                        ], {
                            color: '#ffffff',
                            fillColor: color,
                            fillOpacity: 0.7,
                            weight: 1,
                            opacity: 0.8,
                            className: 'grid-cell'
                        });

                        // Enhanced popup with better formatting
                        const popupContent = `
                            <div class="popup-title">Grid: ${lat.toFixed(1)}°N, ${lng.toFixed(1)}°E</div>
                            <div>PM2.5: <span class="popup-value">${gridData.pm25} μg/m³</span></div>
                            <div>PM10: <span class="popup-value">${gridData.pm10} μg/m³</span></div>
                            <div>Source: <span class="popup-value">${gridData.source}</span></div>
                            <div>Updated: <span class="popup-value">${new Date(gridData.timestamp).toLocaleString()}</span></div>
                        `;
                        
                        rectangle.bindPopup(popupContent);

                        // Add hover effect
                        rectangle.on('mouseover', function() {
                            this.setStyle({
                                weight: 2,
                                opacity: 1
                            });
                        });

                        rectangle.on('mouseout', function() {
                            this.setStyle({
                                weight: 1,
                                opacity: 0.8
                            });
                        });

                        // Add click event
                        rectangle.on('click', function() {
                            updateMapInfo(gridData);
                        });

                        rectangle.addTo(map);
                        gridRectangles.push(rectangle);
                    }
                }
            }
        }

        // Update map info panel
        function updateMapInfo(gridData) {
            document.getElementById('selected-grid').textContent = `${gridData.lat.toFixed(1)}°N, ${gridData.lng.toFixed(1)}°E`;
            document.getElementById('selected-pm25').textContent = `${gridData.pm25} μg/m³`;
            document.getElementById('selected-pm10').textContent = `${gridData.pm10} μg/m³`;
            document.getElementById('selected-source').textContent = gridData.source;
        }

        // Update heatmap function
        function updateHeatmap() {
            const pollutant = document.getElementById('pollutant').value;
            const dataSource = document.getElementById('data-source').value;
           const selectedDate = document.getElementById('date').value;
console.log('Updating heatmap with:', { pollutant, dataSource, selectedDate });
 
            // Generate new data (in real app, this would be an API call)
            currentData = generateMockData();
            createGridRectangles();
            
            // Update source in info panel
            document.getElementById('selected-source').textContent = dataSource;
        }

        // Initialize the map on page load
        document.addEventListener('DOMContentLoaded', function() {
            // Set current date/time
           const today = new Date().toISOString().slice(0, 10);
document.getElementById('date').value = today;
 
            // Load initial data
            updateHeatmap();
        });

        // Navigation functions
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                const text = this.textContent;
                if (text.includes('Home')) {
                    alert('Navigate to Home page');
                } else if (text.includes('Regional')) {
                    alert('Navigate to Regional Analysis page');
                } else if (text.includes('Compare')) {
                    alert('Navigate to Comparison page');
                }
            });
        });
       