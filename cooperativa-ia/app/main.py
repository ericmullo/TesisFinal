from pathlib import Path

import joblib
import pandas as pd

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field


# ============================================================
# CONFIGURACIÓN DE FASTAPI
# ============================================================

app = FastAPI(
    title="Microservicio de Riesgo Crediticio",
    description="Microservicio para evaluación de riesgo mediante Random Forest",
    version="1.0.0"
)


# ============================================================
# RUTA DEL MODELO
# ============================================================

BASE_DIR = Path(__file__).resolve().parent.parent

MODEL_PATH = (
    BASE_DIR
    / "models"
    / "modelo_riesgo.pkl"
)


# ============================================================
# CARGAR MODELO
# ============================================================

if not MODEL_PATH.exists():
    raise RuntimeError(
        f"No se encontró el modelo en: {MODEL_PATH}"
    )

modelo = joblib.load(MODEL_PATH)

print(f"Modelo cargado correctamente desde: {MODEL_PATH}")


# ============================================================
# DATOS QUE RECIBIRÁ LA IA
# ============================================================

class DatosCredito(BaseModel):

    ingresos_mensuales: float = Field(ge=0)

    egresos_mensuales: float = Field(ge=0)

    nivel_endeudamiento: float = Field(
        ge=0,
        le=100
    )

    capacidad_pago: float

    tipo_credito: str

    monto_solicitado: float = Field(gt=0)

    plazo_meses: int = Field(gt=0)

    antiguedad_laboral_anios: float = Field(ge=0)


# ============================================================
# RESPUESTA DE LA IA
# ============================================================

class ResultadoPrediccion(BaseModel):

    probabilidad_mora: float

    score_ia: int

    nivel_riesgo: str

    recomendacion: str

    modelo: str


# ============================================================
# ENDPOINT PRINCIPAL
# ============================================================

@app.get("/")
def inicio():

    return {
        "servicio": "Evaluación de Riesgo Crediticio",
        "estado": "activo",
        "modelo": "Random Forest"
    }


# ============================================================
# HEALTH CHECK
# ============================================================

@app.get("/health")
def health():

    return {
        "status": "ok",
        "modelo_cargado": True
    }


# ============================================================
# PREDICCIÓN
# ============================================================

@app.post(
    "/predict",
    response_model=ResultadoPrediccion
)
def predecir_riesgo(datos: DatosCredito):

    try:

        # ----------------------------------------------------
        # Convertir los datos recibidos al formato del modelo
        # ----------------------------------------------------

        entrada = pd.DataFrame(
            [
                {
                    "ingresos_mensuales":
                        datos.ingresos_mensuales,

                    "egresos_mensuales":
                        datos.egresos_mensuales,

                    "nivel_endeudamiento":
                        datos.nivel_endeudamiento,

                    "capacidad_pago":
                        datos.capacidad_pago,

                    "tipo_credito":
                        datos.tipo_credito,

                    "monto_solicitado":
                        datos.monto_solicitado,

                    "plazo_meses":
                        datos.plazo_meses,

                    "antiguedad_laboral_anios":
                        datos.antiguedad_laboral_anios
                }
            ]
        )


        # ----------------------------------------------------
        # OBTENER PROBABILIDAD DE MORA
        # ----------------------------------------------------

        probabilidad = modelo.predict_proba(
            entrada
        )[0][1]


        # Convertimos de 0-1 a porcentaje 0-100
        probabilidad_porcentaje = round(
            probabilidad * 100,
            2
        )


        # ----------------------------------------------------
        # SCORE IA
        # ----------------------------------------------------
        #
        # Este NO es un score de buró.
        #
        # Es un indicador interno del prototipo:
        #
        # 100 = menor riesgo estimado
        #   0 = mayor riesgo estimado
        #

        score_ia = round(
            (1 - probabilidad) * 100
        )


        # ----------------------------------------------------
        # CLASIFICACIÓN DEL NIVEL DE RIESGO
        # ----------------------------------------------------
        #
        # Estos umbrales son reglas del prototipo.
        # Posteriormente pueden ajustarse según políticas
        # reales de la cooperativa.
        #

        if probabilidad_porcentaje < 20:

            nivel_riesgo = "Bajo"

            recomendacion = (
                "Perfil con riesgo estimado bajo. "
                "Continuar con la revisión crediticia."
            )

        elif probabilidad_porcentaje < 40:

            nivel_riesgo = "Medio"

            recomendacion = (
                "Perfil con riesgo estimado medio. "
                "Se recomienda revisión adicional."
            )

        else:

            nivel_riesgo = "Alto"

            recomendacion = (
                "Perfil con riesgo estimado alto. "
                "Se recomienda análisis detallado "
                "antes de tomar una decisión."
            )


        # ----------------------------------------------------
        # RESPUESTA
        # ----------------------------------------------------

        return ResultadoPrediccion(

            probabilidad_mora=
                probabilidad_porcentaje,

            score_ia=
                score_ia,

            nivel_riesgo=
                nivel_riesgo,

            recomendacion=
                recomendacion,

            modelo=
                "Random Forest - Prototipo v1"
        )


    except Exception as error:

        raise HTTPException(
            status_code=500,
            detail=f"Error al realizar la predicción: {str(error)}"
        )