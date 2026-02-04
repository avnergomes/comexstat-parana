# -*- coding: utf-8 -*-
"""
Módulo de previsão para ComexStat Paraná.

Gera previsões de exportações e importações usando modelos estatísticos.
Utiliza ExponentialSmoothing do statsmodels (mais leve que Prophet).
"""

import pandas as pd
import numpy as np
import json
from pathlib import Path
from datetime import datetime
import sys
import io
import warnings

# Configurar encoding UTF-8 para Windows
if sys.platform == 'win32':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

warnings.filterwarnings('ignore')

# Tentar importar statsmodels
try:
    from statsmodels.tsa.holtwinters import ExponentialSmoothing
    STATSMODELS_AVAILABLE = True
except ImportError:
    STATSMODELS_AVAILABLE = False
    print("AVISO: statsmodels não disponível, usando previsão simples")

# Paths
INPUT_DIR = Path("data/processed")
OUTPUT_PATH = Path("dashboard/public/data/forecasts.json")


class NumpyEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, (np.integer, np.int64, np.int32)):
            return int(obj)
        if isinstance(obj, (np.floating, np.float64, np.float32)):
            return float(obj)
        if isinstance(obj, np.ndarray):
            return obj.tolist()
        if pd.isna(obj):
            return None
        return super().default(obj)


def load_timeseries():
    """Carrega série temporal de exportações e importações."""
    print("Carregando dados de série temporal...")

    # Tentar carregar do parquet unificado
    exp_path = INPUT_DIR / "unified_exp_pr.parquet"
    imp_path = INPUT_DIR / "unified_imp_pr.parquet"

    if not exp_path.exists():
        # Fallback para dados originais
        exp_path = INPUT_DIR / "exportacoes_pr_agro.parquet"
        imp_path = INPUT_DIR / "importacoes_pr_agro.parquet"

    if not exp_path.exists():
        print(f"ERRO: Arquivo {exp_path} não encontrado")
        return None, None

    df_exp = pd.read_parquet(exp_path)
    df_imp = pd.read_parquet(imp_path) if imp_path.exists() else None

    return df_exp, df_imp


def aggregate_by_year(df, tipo='exp'):
    """Agrega dados por ano."""
    if df is None:
        return None

    # Identificar coluna de ano
    if 'CO_ANO' in df.columns:
        ano_col = 'CO_ANO'
    elif 'ano' in df.columns:
        ano_col = 'ano'
    else:
        print(f"ERRO: Coluna de ano não encontrada")
        return None

    agg = df.groupby(ano_col).agg({
        'VL_FOB': 'sum',
        'KG_LIQUIDO': 'sum'
    }).reset_index()

    agg.columns = ['ano', 'valor', 'peso']
    agg = agg.sort_values('ano')

    return agg


def forecast_simple(series, n_periods=2):
    """
    Previsão simples usando média móvel e tendência linear.
    Fallback quando statsmodels não está disponível.
    """
    if len(series) < 3:
        # Série muito curta, usar último valor
        last_val = series.iloc[-1]
        return [last_val] * n_periods, [last_val * 0.9] * n_periods, [last_val * 1.1] * n_periods

    # Calcular tendência linear
    x = np.arange(len(series))
    y = series.values

    # Regressão linear simples
    n = len(x)
    sum_x = np.sum(x)
    sum_y = np.sum(y)
    sum_xy = np.sum(x * y)
    sum_x2 = np.sum(x ** 2)

    slope = (n * sum_xy - sum_x * sum_y) / (n * sum_x2 - sum_x ** 2)
    intercept = (sum_y - slope * sum_x) / n

    # Previsão
    forecast_x = np.arange(len(series), len(series) + n_periods)
    forecast_vals = intercept + slope * forecast_x

    # Intervalo de confiança (baseado em desvio padrão dos resíduos)
    residuals = y - (intercept + slope * x)
    std_residuals = np.std(residuals)

    lower = forecast_vals - 1.96 * std_residuals
    upper = forecast_vals + 1.96 * std_residuals

    # Garantir valores não negativos
    forecast_vals = np.maximum(forecast_vals, 0)
    lower = np.maximum(lower, 0)

    return forecast_vals.tolist(), lower.tolist(), upper.tolist()


def forecast_exponential_smoothing(series, n_periods=2):
    """
    Previsão usando Exponential Smoothing (Holt-Winters).
    """
    if not STATSMODELS_AVAILABLE:
        return forecast_simple(series, n_periods)

    if len(series) < 4:
        return forecast_simple(series, n_periods)

    try:
        # Modelo Holt (tendência, sem sazonalidade)
        model = ExponentialSmoothing(
            series,
            trend='add',
            seasonal=None,
            damped_trend=True
        )
        fit = model.fit(optimized=True)

        # Previsão
        forecast = fit.forecast(n_periods)

        # Intervalo de confiança
        # Aproximação usando erro padrão dos resíduos
        residuals = series - fit.fittedvalues
        std_residuals = residuals.std()

        lower = forecast - 1.96 * std_residuals
        upper = forecast + 1.96 * std_residuals

        # Garantir valores não negativos
        forecast = np.maximum(forecast, 0)
        lower = np.maximum(lower, 0)

        return forecast.tolist(), lower.tolist(), upper.tolist()

    except Exception as e:
        print(f"  AVISO: Erro no modelo, usando fallback: {e}")
        return forecast_simple(series, n_periods)


def generate_forecasts(df_exp, df_imp, n_periods=2):
    """Gera previsões para exportações e importações."""
    print("\n=== Gerando Previsões ===\n")

    # Agregar por ano
    exp_yearly = aggregate_by_year(df_exp, 'exp')
    imp_yearly = aggregate_by_year(df_imp, 'imp') if df_imp is not None else None

    if exp_yearly is None:
        print("ERRO: Dados de exportação não disponíveis")
        return None

    # Último ano nos dados
    ultimo_ano = int(exp_yearly['ano'].max())
    anos_previsao = [ultimo_ano + i + 1 for i in range(n_periods)]

    print(f"Dados históricos: {int(exp_yearly['ano'].min())}-{ultimo_ano}")
    print(f"Previsão para: {anos_previsao}")

    forecasts = {
        'exportacoes': [],
        'importacoes': [],
        'balanca': []
    }

    # Previsão de exportações
    print("\nExportações:")
    series_exp_valor = exp_yearly['valor']
    series_exp_peso = exp_yearly['peso']

    valor_forecast, valor_lower, valor_upper = forecast_exponential_smoothing(series_exp_valor, n_periods)
    peso_forecast, peso_lower, peso_upper = forecast_exponential_smoothing(series_exp_peso, n_periods)

    for i, ano in enumerate(anos_previsao):
        forecasts['exportacoes'].append({
            'ano': ano,
            'valor': valor_forecast[i],
            'valorLower': valor_lower[i],
            'valorUpper': valor_upper[i],
            'peso': peso_forecast[i],
            'pesoLower': peso_lower[i],
            'pesoUpper': peso_upper[i]
        })
        print(f"  {ano}: US$ {valor_forecast[i]/1e9:.2f} bi ({valor_lower[i]/1e9:.2f} - {valor_upper[i]/1e9:.2f})")

    # Previsão de importações
    if imp_yearly is not None and len(imp_yearly) > 0:
        print("\nImportações:")
        series_imp_valor = imp_yearly['valor']
        series_imp_peso = imp_yearly['peso']

        valor_forecast_imp, valor_lower_imp, valor_upper_imp = forecast_exponential_smoothing(series_imp_valor, n_periods)
        peso_forecast_imp, peso_lower_imp, peso_upper_imp = forecast_exponential_smoothing(series_imp_peso, n_periods)

        for i, ano in enumerate(anos_previsao):
            forecasts['importacoes'].append({
                'ano': ano,
                'valor': valor_forecast_imp[i],
                'valorLower': valor_lower_imp[i],
                'valorUpper': valor_upper_imp[i],
                'peso': peso_forecast_imp[i],
                'pesoLower': peso_lower_imp[i],
                'pesoUpper': peso_upper_imp[i]
            })
            print(f"  {ano}: US$ {valor_forecast_imp[i]/1e9:.2f} bi ({valor_lower_imp[i]/1e9:.2f} - {valor_upper_imp[i]/1e9:.2f})")

        # Balança comercial
        print("\nBalança Comercial:")
        for i, ano in enumerate(anos_previsao):
            saldo = valor_forecast[i] - valor_forecast_imp[i]
            saldo_lower = valor_lower[i] - valor_upper_imp[i]
            saldo_upper = valor_upper[i] - valor_lower_imp[i]

            forecasts['balanca'].append({
                'ano': ano,
                'saldo': saldo,
                'saldoLower': saldo_lower,
                'saldoUpper': saldo_upper
            })
            print(f"  {ano}: US$ {saldo/1e9:.2f} bi ({saldo_lower/1e9:.2f} - {saldo_upper/1e9:.2f})")

    # Histórico para referência
    historico_exp = []
    for _, row in exp_yearly.iterrows():
        historico_exp.append({
            'ano': int(row['ano']),
            'valor': float(row['valor']),
            'peso': float(row['peso'])
        })

    historico_imp = []
    if imp_yearly is not None:
        for _, row in imp_yearly.iterrows():
            historico_imp.append({
                'ano': int(row['ano']),
                'valor': float(row['valor']),
                'peso': float(row['peso'])
            })

    return {
        'previsoes': forecasts,
        'historico': {
            'exportacoes': historico_exp,
            'importacoes': historico_imp
        },
        'modelo': 'ExponentialSmoothing' if STATSMODELS_AVAILABLE else 'LinearTrend',
        'geradoEm': datetime.now().isoformat(),
        'anosPrevisao': anos_previsao
    }


def main():
    """Função principal."""
    print("=" * 60)
    print("MÓDULO DE PREVISÃO - COMEXSTAT PARANÁ")
    print("=" * 60)

    # 1. Carregar dados
    df_exp, df_imp = load_timeseries()

    if df_exp is None:
        print("ERRO: Não foi possível carregar dados")
        return

    print(f"Exportações: {len(df_exp):,} registros")
    if df_imp is not None:
        print(f"Importações: {len(df_imp):,} registros")

    # 2. Gerar previsões
    forecasts = generate_forecasts(df_exp, df_imp, n_periods=2)

    if forecasts is None:
        print("ERRO: Não foi possível gerar previsões")
        return

    # 3. Salvar
    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    with open(OUTPUT_PATH, 'w', encoding='utf-8') as f:
        json.dump(forecasts, f, cls=NumpyEncoder, ensure_ascii=False, indent=2)

    print(f"\nPrevisões salvas em: {OUTPUT_PATH}")

    print("\n" + "=" * 60)
    print("PREVISÃO CONCLUÍDA")
    print("=" * 60)


if __name__ == "__main__":
    main()
