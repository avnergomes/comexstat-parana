import json
import sys
import io

if sys.platform == 'win32':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

# Load municipality JSON
with open('assets/mun_PR.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

# Check structure
if isinstance(data, dict):
    if 'features' in data:
        # GeoJSON format
        print("GeoJSON format detected")
        for feat in data['features'][:5]:
            props = feat.get('properties', {})
            print(f"  Properties: {list(props.keys())[:10]}")
            print(f"  Sample: {props}")
            break
    else:
        print("Dict format, keys:", list(data.keys())[:10])
elif isinstance(data, list):
    print(f"List format, {len(data)} items")
    if len(data) > 0:
        print(f"  First item: {data[0]}")

# Try to extract codes if GeoJSON
if isinstance(data, dict) and 'features' in data:
    mun_dict = {}
    for feat in data['features']:
        props = feat.get('properties', {})
        # Try different common field names
        code = props.get('CodIbge') or props.get('CD_MUN') or props.get('CD_GEOCMU') or props.get('IBGE') or props.get('codigo')
        name = props.get('Municipio') or props.get('NM_MUN') or props.get('NM_MUNICIP') or props.get('NOME') or props.get('nome')
        if code and name:
            mun_dict[int(code)] = name

    print(f"\nExtracted {len(mun_dict)} municipalities")

    # Show first 10
    for i, (code, name) in enumerate(sorted(mun_dict.items())[:20]):
        print(f"  {code}: {name}")

    # Save as Python dict
    print("\n\n# MUNICIPIOS_PR dict:")
    print("MUNICIPIOS_PR = {")
    for code, name in sorted(mun_dict.items()):
        print(f'    {code}: "{name}",')
    print("}")
