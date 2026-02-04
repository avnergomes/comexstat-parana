import pandas as pd
import sys
import io
if sys.platform == 'win32':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
df = pd.read_parquet('data/processed/fluxo_municipio_pais.parquet')
print('Columns:', df.columns.tolist())
print('\nSample:')
print(df.head(3))
