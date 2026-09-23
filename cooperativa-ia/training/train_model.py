from pathlib import Path

import joblib
import pandas as pd

from sklearn.compose import ColumnTransformer
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import (
    accuracy_score,
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

BASE_DIR = Path(__file__).resolve().parent.parent

DATASET_PATH = (
    BASE_DIR
    / "data"
    / "dataset_riesgo_crediticio_sintetico.csv"
)

MODEL_PATH = (
    BASE_DIR
    / "models"
    / "modelo_riesgo.pkl"
)


# ============================================================
# CARGAR DATASET
# ============================================================

print("\n========================================")
print(" CARGANDO DATASET")
print("========================================\n")

df = pd.read_csv(DATASET_PATH)

print("Cantidad de registros:", len(df))

print("\nPrimeros registros:")
print(df.head())


# ============================================================
# VARIABLES DE ENTRADA
# ============================================================

features = [
    "ingresos_mensuales",
    "egresos_mensuales",
    "nivel_endeudamiento",
    "capacidad_pago",
    "tipo_credito",
    "monto_solicitado",
    "plazo_meses",
    "antiguedad_laboral_anios"
]


# ============================================================
# VARIABLE OBJETIVO
# ============================================================

target = "mora"


X = df[features]

y = df[target]


# ============================================================
# DISTRIBUCIÓN
# ============================================================

print("\n========================================")
print(" DISTRIBUCIÓN DE MORA")
print("========================================\n")

print(y.value_counts())

print("\nPorcentajes:")

print(
    y.value_counts(normalize=True)
    * 100
)


# ============================================================
# DIVIDIR DATASET
# ============================================================

X_train, X_test, y_train, y_test = (
    train_test_split(
        X,
        y,

        test_size=0.20,

        random_state=42,

        stratify=y
    )
)


print("\n========================================")
print(" DIVISIÓN DEL DATASET")
print("========================================\n")

print(
    "Registros para entrenamiento:",
    len(X_train)
)

print(
    "Registros para prueba:",
    len(X_test)
)


# ============================================================
# VARIABLES NUMÉRICAS
# ============================================================

numeric_features = [
    "ingresos_mensuales",
    "egresos_mensuales",
    "nivel_endeudamiento",
    "capacidad_pago",
    "monto_solicitado",
    "plazo_meses",
    "antiguedad_laboral_anios"
]


# ============================================================
# VARIABLE CATEGÓRICA
# ============================================================

categorical_features = [
    "tipo_credito"
]


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
            categorical_features
        ),

        (
            "numeric",
            "passthrough",
            numeric_features
        )

    ]
)


# ============================================================
# RANDOM FOREST
# ============================================================

random_forest = RandomForestClassifier(

    n_estimators=300,

    max_depth=10,

    min_samples_split=5,

    min_samples_leaf=2,

    class_weight="balanced",

    random_state=42
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
# ENTRENAR
# ============================================================

print("\n========================================")
print(" ENTRENANDO RANDOM FOREST")
print("========================================\n")

model.fit(
    X_train,
    y_train
)

print(
    "Entrenamiento completado correctamente."
)


# ============================================================
# HACER PREDICCIONES SOBRE LOS DATOS DE PRUEBA
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


auc = roc_auc_score(
    y_test,
    probabilidades
)


matriz = confusion_matrix(
    y_test,
    predicciones
)


print("\n========================================")
print(" RESULTADOS DEL MODELO")
print("========================================\n")


print(
    f"Accuracy: {accuracy:.4f}"
)


print(
    f"ROC AUC: {auc:.4f}"
)


print(
    "\nMatriz de confusión:"
)

print(matriz)


print(
    "\nReporte de clasificación:"
)


print(
    classification_report(
        y_test,
        predicciones,
        digits=4
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


print("\n========================================")
print(" MODELO GUARDADO")
print("========================================\n")


print(
    f"Modelo guardado en:\n{MODEL_PATH}"
)


print(
    "\nEl modelo ya está listo para realizar predicciones."
)