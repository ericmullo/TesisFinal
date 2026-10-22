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
    description=(
        "Microservicio para evaluación de riesgo crediticio "
        "mediante un modelo Random Forest."
    ),
    version="2.0.0"
)


# ============================================================
# RUTAS
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


try:
    modelo = joblib.load(
        MODEL_PATH
    )
except Exception as error:
    raise RuntimeError(
        "No se pudo cargar el modelo de riesgo: "
        f"{str(error)}"
    )


print(
    f"Modelo cargado correctamente desde: {MODEL_PATH}"
)


# ============================================================
# DATOS QUE RECIBIRÁ LA IA
# ============================================================

class DatosCredito(BaseModel):

    # --------------------------------------------------------
    # INFORMACIÓN FINANCIERA
    # --------------------------------------------------------

    ingresos_mensuales: float = Field(
        ge=0
    )

    egresos_mensuales: float = Field(
        ge=0
    )

    nivel_endeudamiento: float = Field(
        ge=0,
        le=100
    )

    capacidad_pago: float = Field(
        ge=0
    )


    # --------------------------------------------------------
    # SEGMENTACIÓN DEL CRÉDITO
    # --------------------------------------------------------

    tipo_credito: str = Field(
        min_length=1
    )

    subsegmento_credito: str = Field(
        min_length=1
    )

    producto_credito: str = Field(
        min_length=1
    )


    # --------------------------------------------------------
    # CONDICIONES DEL CRÉDITO
    # --------------------------------------------------------

    monto_solicitado: float = Field(
        gt=0
    )

    plazo_meses: int = Field(
        gt=0
    )


    # --------------------------------------------------------
    # INFORMACIÓN ECONÓMICA
    # --------------------------------------------------------

    ventas_anuales: float = Field(
        ge=0
    )

    fuente_pago: str = Field(
        min_length=1
    )


    # --------------------------------------------------------
    # ANTIGÜEDAD
    # --------------------------------------------------------

    antiguedad_laboral_anios: float = Field(
        ge=0
    )


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
        "servicio":
            "Evaluación de Riesgo Crediticio",

        "estado":
            "activo",

        "version":
            "2.0.0",

        "modelo":
            "Random Forest"
    }


# ============================================================
# HEALTH CHECK
# ============================================================

@app.get("/health")
def health():

    return {
        "status":
            "ok",

        "modelo_cargado":
            True,

        "version_api":
            "2.0.0"
    }


# ============================================================
# NORMALIZAR TEXTO
# ============================================================

def normalizar_texto(
    valor: str
) -> str:

    if valor is None:
        return "No aplica"


    valor_limpio = str(
        valor
    ).strip()


    if not valor_limpio:
        return "No aplica"


    return valor_limpio


# ============================================================
# CONSTRUIR ENTRADA
# ============================================================

def construir_entrada(
    datos: DatosCredito
) -> pd.DataFrame:

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
                    normalizar_texto(
                        datos.tipo_credito
                    ),

                "subsegmento_credito":
                    normalizar_texto(
                        datos.subsegmento_credito
                    ),

                "producto_credito":
                    normalizar_texto(
                        datos.producto_credito
                    ),

                "monto_solicitado":
                    datos.monto_solicitado,

                "plazo_meses":
                    datos.plazo_meses,

                "ventas_anuales":
                    datos.ventas_anuales,

                "fuente_pago":
                    normalizar_texto(
                        datos.fuente_pago
                    ),

                "antiguedad_laboral_anios":
                    datos.antiguedad_laboral_anios
            }
        ]
    )


    return entrada


# ============================================================
# OBTENER PROBABILIDAD DE MORA
# ============================================================

def obtener_probabilidad_mora(
    entrada: pd.DataFrame
) -> float:

    probabilidades = (
        modelo.predict_proba(
            entrada
        )
    )


    # --------------------------------------------------------
    # La clase:
    #
    # 0 = No mora
    # 1 = Mora
    #
    # Por eso tomamos la probabilidad de la clase 1.
    # --------------------------------------------------------

    probabilidad_mora = float(
        probabilidades[0][1]
    )


    return probabilidad_mora


# ============================================================
# CLASIFICAR RIESGO
# ============================================================

def clasificar_riesgo(
    probabilidad_porcentaje: float
):

    # --------------------------------------------------------
    # Estos umbrales son reglas del prototipo.
    #
    # No representan automáticamente una política oficial
    # de aprobación de la cooperativa.
    # --------------------------------------------------------

    if probabilidad_porcentaje < 20:

        nivel_riesgo = (
            "Bajo"
        )

        recomendacion = (
            "Perfil con riesgo estimado bajo. "
            "Continuar con la revisión crediticia "
            "y documental."
        )


    elif probabilidad_porcentaje < 40:

        nivel_riesgo = (
            "Medio"
        )

        recomendacion = (
            "Perfil con riesgo estimado medio. "
            "Se recomienda revisión adicional "
            "de capacidad de pago, endeudamiento "
            "y documentación."
        )


    else:

        nivel_riesgo = (
            "Alto"
        )

        recomendacion = (
            "Perfil con riesgo estimado alto. "
            "Se recomienda realizar un análisis "
            "crediticio detallado antes de tomar "
            "una decisión."
        )


    return (
        nivel_riesgo,
        recomendacion
    )


# ============================================================
# PREDICCIÓN
# ============================================================

@app.post(
    "/predict",
    response_model=ResultadoPrediccion
)
def predecir_riesgo(
    datos: DatosCredito
):

    try:

        # ----------------------------------------------------
        # CONSTRUIR DATAFRAME
        # ----------------------------------------------------

        entrada = (
            construir_entrada(
                datos
            )
        )


        # ----------------------------------------------------
        # PREDICCIÓN
        # ----------------------------------------------------

        probabilidad = (
            obtener_probabilidad_mora(
                entrada
            )
        )


        # ----------------------------------------------------
        # PROBABILIDAD EN PORCENTAJE
        # ----------------------------------------------------

        probabilidad_porcentaje = round(
            probabilidad
            * 100,
            2
        )


        # ----------------------------------------------------
        # SCORE IA
        # ----------------------------------------------------
        #
        # No corresponde al score de un buró.
        #
        # Es un indicador interno:
        #
        # 100 = menor riesgo
        #   0 = mayor riesgo
        # ----------------------------------------------------

        score_ia = round(
            (
                1
                -
                probabilidad
            )
            * 100
        )


        score_ia = max(
            0,
            min(
                100,
                score_ia
            )
        )


        # ----------------------------------------------------
        # NIVEL Y RECOMENDACIÓN
        # ----------------------------------------------------

        (
            nivel_riesgo,
            recomendacion
        ) = clasificar_riesgo(
            probabilidad_porcentaje
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
                "Random Forest - Riesgo Crediticio v2"
        )


    except ValueError as error:

        raise HTTPException(
            status_code=400,
            detail=(
                "Los datos enviados no son compatibles "
                "con el modelo de riesgo: "
                f"{str(error)}"
            )
        )


    except Exception as error:

        print(
            f"Error durante la predicción: {error}"
        )


        raise HTTPException(
            status_code=500,
            detail=(
                "Error al realizar la predicción: "
                f"{str(error)}"
            )
        )