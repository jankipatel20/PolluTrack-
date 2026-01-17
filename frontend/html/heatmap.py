# india_heatmap.py
# Complete script to create India grid heatmap

import geopandas as gpd
import numpy as np
import plotly.express as px
import json
from shapely.geometry import box, Polygon
import pandas as pd

def create_india_grid_heatmap():
    """
    Complete working example to create India grid heatmap
    """
    
    print("🚀 Starting India Grid Heatmap Creation...")
    print("=" * 50)
    
    print("Step 1: Loading India boundary...")
    
    # Load India boundary with fallback
    try:
        # Try to load from online source
        india = gpd.read_file("https://raw.githubusercontent.com/geohacker/india/master/state/india_telengana.geojson")
        india = india.to_crs("EPSG:4326")
        print("✅ Loaded India boundary from online source")
    except Exception as e:
        print(f"⚠️ Online source failed: {e}")
        print("Using simplified boundary as fallback...")
        
        # Create a simplified India boundary
        coords = [
            (68.5, 6.5), (97.5, 6.5), (97.5, 37.5), (68.5, 37.5), (68.5, 6.5)
        ]
        india = gpd.GeoDataFrame(
            [1], 
            geometry=[Polygon(coords)], 
            crs="EPSG:4326"
        )
        print("✅ Created simplified boundary")
    
    print("\nStep 2: Creating 1°×1° grid...")
    
    # Create grid cells
    cells = []
    lat_range = range(6, 37)  # 6°N to 37°N
    lon_range = range(68, 98)  # 68°E to 98°E
    
    for lat in lat_range:
        for lon in lon_range:
            # Create 1°×1° square
            polygon = box(lon, lat, lon+1, lat+1)
            
            # Generate sample data (replace with your actual data)
            value = np.random.uniform(0, 20)
            
            cells.append({
                "geometry": polygon,
                "lat": lat,
                "lon": lon,
                "value": value,
                "grid_id": f"{lat}_{lon}"
            })
    
    # Convert to GeoDataFrame
    full_grid = gpd.GeoDataFrame(cells, crs="EPSG:4326")
    print(f"✅ Created {len(full_grid)} grid cells")
    
    print("\nStep 3: Clipping grid to India shape...")
    
    # Clip grid to India boundaries
    india_grid = gpd.overlay(full_grid, india, how="intersection")
    print(f"✅ After clipping: {len(india_grid)} grid cells remain")
    
    print("\nStep 4: Creating interactive map...")
    
    # Create interactive map
    geojson = json.loads(india_grid.to_json())
    
    fig = px.choropleth_mapbox(
        india_grid,
        geojson=geojson,
        locations=india_grid.index,
        color="value",
        color_continuous_scale="Viridis",
        mapbox_style="carto-positron",
        center={"lat": 22.5, "lon": 78.5},
        zoom=4.5,
        opacity=0.7,
        title="India Grid Heatmap (1°×1°)",
        hover_data=["lat", "lon", "value"]
    )
    
    fig.update_layout(
        margin={"r":0,"t":50,"l":0,"b":0},
        coloraxis_colorbar=dict(
            title="Sample Value",
            title_side="right"
        )
    )
    
    print("✅ Interactive map created")
    
    # Save as HTML file
    html_filename = "india_grid_heatmap.html"
    fig.write_html(html_filename)
    print(f"✅ Saved as '{html_filename}'")
    
    # Show in browser
    print("\n🌐 Opening in browser...")
    fig.show()
    
    print("\n" + "=" * 50)
    print("🎉 COMPLETE! Your India grid heatmap is ready!")
    print(f"📁 HTML file: {html_filename}")
    print("💡 You can now:")
    print("   - Open the HTML file in any browser")
    print("   - Share it with others")
    print("   - Embed it in websites")
    print("   - Replace sample data with your real data")
    
    return india_grid, fig

def add_custom_data_example():
    """
    Example of how to add your own data
    """
    print("\n" + "=" * 50)
    print("📊 EXAMPLE: Adding Your Own Data")
    print("=" * 50)
    
    # Example data format
    your_data = {
        "20_75": 15.2,   # Latitude 20°, Longitude 75°
        "21_76": 18.5,   # Latitude 21°, Longitude 76°
        "22_77": 12.8,   # Latitude 22°, Longitude 77°
        "23_78": 21.3,   # Latitude 23°, Longitude 78°
        "24_79": 9.7     # Latitude 24°, Longitude 79°
    }
    
    print("Your data should be in this format:")
    print("your_data = {")
    for key, value in your_data.items():
        lat, lon = key.split('_')
        print(f'    "{key}": {value},  # Lat: {lat}°, Lon: {lon}°')
    print("}")
    
    print("\nTo use your data:")
    print("1. Replace the sample data generation")
    print("2. Use your_data dictionary to populate values")
    print("3. Run the script again")

# Main execution
if __name__ == "__main__":
    # Create the heatmap
    grid_data, map_fig = create_india_grid_heatmap()
    
    # Show example of adding custom data
    add_custom_data_example()