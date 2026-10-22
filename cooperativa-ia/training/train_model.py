from pathlib import Path

import joblib
import pandas as pd

from sklearn.compose import ColumnTransformer
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import (
    accuracy_score,
    balanced_accuracy_score,
    classification_report,
    confusion_matrix,
    roc_auc_score
)
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder


# ============================================================
# RUTAS
# ============================================================

BASE_DIR = (
    Path(__file__)
    .resolve()
    .parent
    .parent
)


DATASET_PATH = (
    BASE_DIR
    / "data"
    / "dataset_riesgo_crediticio_sintetico_v2.csv"
)


MODEL_PATH = (
    BASE_DIR
    / "models"
    / "modelo_riesgo.pkl"
)


# ============================================================
# VARIABLES DEL MODELO
# ============================================================

FEATURES = [

    "ingresos_mensuales",

    "egresos_mensuales",

    "nivel_endeudamiento",

    "capacidad_pago",

    "tipo_credito",

    "subsegmento_credito",

    "producto_credito",

    "monto_solicitado",

    "plazo_meses",

    "ventas_anuales",

    "fuente_pago",

    "antiguedad_laboral_anios"
]


TARGET = (
    "mora"
)


# ============================================================
# VARIABLES NUMÉRICAS
# ============================================================

NUMERIC_FEATURES = [

    "ingresos_mensuales",

    "egresos_mensuales",

    "nivel_endeudamiento",

    "capacidad_pago",

    "monto_solicitado",

    "plazo_meses",

    "ventas_anuales",

    "antiguedad_laboral_anios"
]


# ============================================================
# VARIABLES CATEGÓRICAS
# ============================================================

CATEGORICAL_FEATURES = [

    "tipo_credito",

    "subsegmento_credito",

    "producto_credito",

    "fuente_pago"
]


# ============================================================
# VALIDAR DATASET
# ============================================================

if (
    not DATASET_PATH.exists()
):

    raise FileNotFoundError(
        "No se encontró el dataset v2. "
        "Ejecute primero: "
        "python training/generate_dataset.py"
    )


# ============================================================
# CARGAR DATASET
# ============================================================

print(
    "\n========================================"
)

print(
    " CARGANDO DATASET V2"
)

print(
    "========================================\n"
)


df = pd.read_csv(
    DATASET_PATH
)


# ============================================================
# VALIDAR COLUMNAS
# ============================================================

columnas_requeridas = (
    FEATURES
    +
    [
        TARGET
    ]
)


columnas_faltantes = [

    columna

    for columna
    in columnas_requeridas

    if columna
    not in df.columns
]


if (
    columnas_faltantes
):

    raise ValueError(
        "Faltan columnas requeridas en el dataset: "
        +
        ", ".join(
            columnas_faltantes
        )
    )


# ============================================================
# VALIDAR NULOS
# ============================================================

if (
    df[
        columnas_requeridas
    ]
    .isnull()
    .any()
    .any()
):

    raise ValueError(
        "El dataset contiene valores nulos "
        "en columnas utilizadas por el modelo."
    )


# ============================================================
# VALIDAR CLASES
# ============================================================

clases = set(
    df[
        TARGET
    ]
    .unique()
)


if (
    clases != {0, 1}
):

    raise ValueError(
        "La variable objetivo 'mora' debe contener "
        "exactamente las clases 0 y 1."
    )


print(
    f"Cantidad de registros: {len(df)}"
)


print(
    "\nDistribución de mora:"
)


print(
    df[
        TARGET
    ]
    .value_counts()
)


print(
    "\nPorcentaje de mora:"
)


print(
    (
        df[
            TARGET
        ]
        .value_counts(
            normalize=True
        )
        *
        100
    )
    .round(
        2
    )
)


# ============================================================
# X / Y
# ============================================================

X = (
    df[
        FEATURES
    ]
    .copy()
)


y = (
    df[
        TARGET
    ]
    .copy()
)


# ============================================================
# DIVISIÓN ENTRENAMIENTO / PRUEBA
# ============================================================

(
    X_train,
    X_test,
    y_train,
    y_test
) = train_test_split(

    X,

    y,

    test_size=0.20,

    random_state=42,

    stratify=y
)


print(
    "\n========================================"
)

print(
    " DIVISIÓN DEL DATASET"
)

print(
    "========================================\n"
)


print(
    "Registros para entrenamiento:",
    len(
        X_train
    )
)


print(
    "Registros para prueba:",
    len(
        X_test
    )
)


# ============================================================
# PREPROCESAMIENTO
# ============================================================

preprocessor = ColumnTransformer(

    transformers=[

        (
            "categorical",

            OneHotEncoder(
                handle_unknown="ignore"
            ),

            CATEGORICAL_FEATURES
        ),

        (
            "numeric",

            "passthrough",

            NUMERIC_FEATURES
        )
    ]
)


# ============================================================
# RANDOM FOREST V2
# ============================================================

random_forest = RandomForestClassifier(

    n_estimators=400,

    max_depth=12,

    min_samples_split=6,

    min_samples_leaf=3,

    class_weight="balanced",

    random_state=42,

    n_jobs=-1
)


# ============================================================
# PIPELINE
# ============================================================

model = Pipeline(

    steps=[

        (
            "preprocessor",
            preprocessor
        ),

        (
            "classifier",
            random_forest
        )
    ]
)


# ============================================================
# ENTRENAMIENTO
# ============================================================

print(
    "\n========================================"
)

print(
    " ENTRENANDO RANDOM FOREST V2"
)

print(
    "========================================\n"
)


model.fit(
    X_train,
    y_train
)


print(
    "Entrenamiento completado correctamente."
)


# ============================================================
# PREDICCIONES
# ============================================================

predicciones = model.predict(
    X_test
)


probabilidades = (
    model.predict_proba(
        X_test
    )[:, 1]
)


# ============================================================
# MÉTRICAS
# ============================================================

accuracy = accuracy_score(
    y_test,
    predicciones
)


balanced_accuracy = (
    balanced_accuracy_score(
        y_test,
        predicciones
    )
)


auc = roc_auc_score(
    y_test,
    probabilidades
)


matriz = confusion_matrix(
    y_test,
    predicciones
)


# ============================================================
# MOSTRAR RESULTADOS
# ============================================================

print(
    "\n========================================"
)

print(
    " RESULTADOS DEL MODELO V2"
)

print(
    "========================================\n"
)


print(
    f"Accuracy: {accuracy:.4f}"
)


print(
    f"Balanced Accuracy: {balanced_accuracy:.4f}"
)


print(
    f"ROC AUC: {auc:.4f}"
)


print(
    "\nMatriz de confusión:"
)


print(
    matriz
)


print(
    "\nReporte de clasificación:"
)


print(
    classification_report(

        y_test,

        predicciones,

        digits=4,

        zero_division=0
    )
)


# ============================================================
# IMPORTANCIA DE VARIABLES
# ============================================================

preprocessor_entrenado = (
    model
    .named_steps[
        "preprocessor"
    ]
)


clasificador_entrenado = (
    model
    .named_steps[
        "classifier"
    ]
)


nombres_variables = (
    preprocessor_entrenado
    .get_feature_names_out()
)


importancias = (
    clasificador_entrenado
    .feature_importances_
)


tabla_importancias = (
    pd.DataFrame(
        {
            "variable":
                nombres_variables,

            "importancia":
                importancias
        }
    )
    .sort_values(
        by="importancia",
        ascending=False
    )
)


print(
    "\n========================================"
)

print(
    " VARIABLES MÁS IMPORTANTES"
)

print(
    "========================================\n"
)


print(
    tabla_importancias
    .head(
        20
    )
    .to_string(
        index=False
    )
)


# ============================================================
# GUARDAR MODELO
# ============================================================

MODEL_PATH.parent.mkdir(

    parents=True,

    exist_ok=True
)


joblib.dump(

    model,

    MODEL_PATH
)


print(
    "\n========================================"
)

print(
    " MODELO V2 GUARDADO"
)

print(
    "========================================\n"
)


print(
    f"Modelo guardado en:\n{MODEL_PATH}"
)


print(
    "\nEl modelo está listo para ser usado por FastAPI."
)