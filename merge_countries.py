"""
Merge country subdivisions into single country polygons
"""
import json
from pathlib import Path
from collections import defaultdict

def merge_countries():
    input_file = Path("dashboard/public/data/countries.geojson")
    output_file = Path("dashboard/public/data/countries_merged.geojson")

    print("Loading GeoJSON...")
    with open(input_file, 'r', encoding='utf-8') as f:
        data = json.load(f)

    print(f"Total features: {len(data['features'])}")

    # Group features by ISO_CODE
    by_country = defaultdict(list)
    country_names = {}

    for feature in data['features']:
        props = feature.get('properties', {})
        iso = props.get('ISO_CODE')
        if iso:
            by_country[iso].append(feature)
            # Store country name (use LEVEL_NAME or derive from features)
            if iso not in country_names:
                # Try to get a representative name
                level_name = props.get('LEVEL_NAME', '')
                continent = props.get('CONTINENT', '')
                country_names[iso] = {
                    'name': level_name,
                    'continent': continent
                }

    print(f"Unique countries: {len(by_country)}")

    # Merge polygons for each country
    merged_features = []

    for iso, features in by_country.items():
        # Collect all coordinates
        all_polygons = []

        for feature in features:
            geom = feature.get('geometry', {})
            geom_type = geom.get('type')
            coords = geom.get('coordinates', [])

            if geom_type == 'Polygon':
                all_polygons.append(coords)
            elif geom_type == 'MultiPolygon':
                all_polygons.extend(coords)

        if not all_polygons:
            continue

        # Create merged feature
        merged_feature = {
            'type': 'Feature',
            'properties': {
                'ISO_CODE': iso,
                'NAME': country_names[iso]['name'],
                'CONTINENT': country_names[iso]['continent']
            },
            'geometry': {
                'type': 'MultiPolygon',
                'coordinates': all_polygons
            }
        }

        merged_features.append(merged_feature)

    print(f"Merged features: {len(merged_features)}")

    # Create output GeoJSON
    output_data = {
        'type': 'FeatureCollection',
        'name': 'countries_merged',
        'features': merged_features
    }

    # Write output
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(output_data, f)

    # Get file size
    size_mb = output_file.stat().st_size / (1024 * 1024)
    print(f"Output file: {output_file} ({size_mb:.2f} MB)")

    # List some countries
    print("\nSample countries:")
    for feat in merged_features[:10]:
        print(f"  {feat['properties']['ISO_CODE']}: {feat['properties']['NAME']}")

if __name__ == '__main__':
    merge_countries()
