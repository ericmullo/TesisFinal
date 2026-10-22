from pathlib import Path

import numpy as np
import pandas as pd


SEED = 42
NUM_REGISTROS = 15000

rng = np.random.default_rng(SEED)


# ============================================================
# RUTAS
# ============================================================

BASE_DIR = Path(__file__).resolve().parent.parent

DATASET_PATH = (
    BASE_DIR
    / "data"
    / "dataset_riesgo_crediticio_sintetico_v2.csv"
)


# ============================================================
# UTILIDADES
# ============================================================

def limitar(valor, minimo, maximo):

    return float(
        np.clip(
            valor,
            minimo,
            maximo
        )
    )


def elegir(
    opciones,
    probabilidades=None
):

    return rng.choice(
        opciones,
        p=probabilidades
    )


def redondear(valor):

    return round(
        float(valor),
        2
    )


def sigmoid(valor):

    return (
        1.0
        /
        (
            1.0
            +
            np.exp(-valor)
        )
    )


# ============================================================
# GENERAR SEGMENTO
# ============================================================

def generar_segmento():

    return str(
        elegir(
            [
                "Consumo",
                "Microcrédito",
                "Productivo",
                "Vivienda",
                "Inmobiliario",
                "Educativo"
            ],
            [
                0.42,
                0.30,
                0.08,
                0.09,
                0.06,
                0.05
            ]
        )
    )


# ============================================================
# DATOS SEGÚN SEGMENTO
# ============================================================

def generar_datos_segmento(
    tipo_credito
):

    ventas_anuales = 0.0

    subsegmento = (
        tipo_credito
    )

    producto = (
        "No aplica"
    )


    # ========================================================
    # CONSUMO
    # ========================================================

    if tipo_credito == "Consumo":

        ingresos = limitar(
            rng.lognormal(
                mean=np.log(1200),
                sigma=0.55
            ),
            450,
            8000
        )


        monto = limitar(
            rng.lognormal(
                mean=np.log(6000),
                sigma=0.75
            ),
            300,
            50000
        )


        plazo = int(
            elegir(
                [
                    6,
                    12,
                    18,
                    24,
                    36,
                    48,
                    60
                ],
                [
                    0.08,
                    0.20,
                    0.10,
                    0.24,
                    0.18,
                    0.12,
                    0.08
                ]
            )
        )


        subsegmento = (
            "Consumo"
        )


        producto = (
            "Mi15Libre"
        )


        fuente_pago = str(
            elegir(
                [
                    "Sueldo",
                    "Honorarios profesionales",
                    "Otros ingresos"
                ],
                [
                    0.78,
                    0.14,
                    0.08
                ]
            )
        )


        antiguedad = limitar(
            rng.gamma(
                shape=2.2,
                scale=2.2
            ),
            0.1,
            25
        )


    # ========================================================
    # MICROCRÉDITO
    # ========================================================

    elif tipo_credito == "Microcrédito":

        grupo = str(
            elegir(
                [
                    "Minorista",
                    "Simple",
                    "Ampliada"
                ],
                [
                    0.42,
                    0.40,
                    0.18
                ]
            )
        )


        if grupo == "Minorista":

            ventas_anuales = rng.uniform(
                3000,
                20000
            )

            subsegmento = (
                "Microcrédito Minorista"
            )

            monto = rng.uniform(
                300,
                12000
            )


        elif grupo == "Simple":

            ventas_anuales = rng.uniform(
                20000.01,
                120000
            )

            subsegmento = (
                "Microcrédito de Acumulación Simple"
            )

            monto = rng.uniform(
                1000,
                50000
            )


        else:

            ventas_anuales = rng.uniform(
                120000.01,
                300000
            )

            subsegmento = (
                "Microcrédito de Acumulación Ampliada"
            )

            monto = rng.uniform(
                5000,
                120000
            )


        margen_mensual = rng.uniform(
            0.10,
            0.34
        )


        ingresos = limitar(
            ventas_anuales
            /
            12
            *
            margen_mensual,
            350,
            18000
        )


        plazo = int(
            elegir(
                [
                    6,
                    12,
                    18,
                    24,
                    36,
                    48,
                    60
                ],
                [
                    0.08,
                    0.22,
                    0.10,
                    0.25,
                    0.18,
                    0.10,
                    0.07
                ]
            )
        )


        producto = str(
            elegir(
                [
                    "Mi15",
                    "15 Contigo Mujer",
                    "15 Sostenible",
                    "Taxista"
                ],
                [
                    0.40,
                    0.24,
                    0.18,
                    0.18
                ]
            )
        )


        fuente_pago = str(
            elegir(
                [
                    "Ventas del negocio",
                    "Ingresos por actividad comercial"
                ],
                [
                    0.72,
                    0.28
                ]
            )
        )


        antiguedad = limitar(
            rng.gamma(
                shape=2.0,
                scale=2.0
            ),
            0.1,
            20
        )


    # ========================================================
    # PRODUCTIVO
    # ========================================================

    elif tipo_credito == "Productivo":

        grupo = str(
            elegir(
                [
                    "PYMES",
                    "Empresarial",
                    "Corporativo"
                ],
                [
                    0.62,
                    0.28,
                    0.10
                ]
            )
        )


        # ----------------------------------------------------
        # PRODUCTIVO PYMES
        # > 300.000 hasta 1.500.000
        # ----------------------------------------------------

        if grupo == "PYMES":

            ventas_anuales = rng.uniform(
                300000.01,
                1500000
            )

            subsegmento = (
                "Productivo PYMES"
            )

            monto = rng.uniform(
                10000,
                350000
            )


        # ----------------------------------------------------
        # PRODUCTIVO EMPRESARIAL
        # > 1.500.000 hasta 7.000.000
        # ----------------------------------------------------

        elif grupo == "Empresarial":

            ventas_anuales = rng.uniform(
                1500000.01,
                7000000
            )

            subsegmento = (
                "Productivo Empresarial"
            )

            monto = rng.uniform(
                50000,
                900000
            )


        # ----------------------------------------------------
        # PRODUCTIVO CORPORATIVO
        # > 7.000.000
        # ----------------------------------------------------

        else:

            ventas_anuales = rng.uniform(
                7000000.01,
                15000000
            )

            subsegmento = (
                "Productivo Corporativo"
            )

            monto = rng.uniform(
                100000,
                1800000
            )


        margen_mensual = rng.uniform(
            0.06,
            0.22
        )


        ingresos = limitar(
            ventas_anuales
            /
            12
            *
            margen_mensual,
            2500,
            300000
        )


        plazo = int(
            elegir(
                [
                    12,
                    24,
                    36,
                    48,
                    60,
                    72
                ],
                [
                    0.08,
                    0.18,
                    0.22,
                    0.20,
                    0.22,
                    0.10
                ]
            )
        )


        producto = (
            "No aplica"
        )


        fuente_pago = str(
            elegir(
                [
                    "Ventas del negocio",
                    "Ingresos por actividad comercial"
                ],
                [
                    0.68,
                    0.32
                ]
            )
        )


        antiguedad = limitar(
            rng.gamma(
                shape=3.2,
                scale=2.1
            ),
            0.5,
            30
        )


    # ========================================================
    # VIVIENDA
    # ========================================================

    elif tipo_credito == "Vivienda":

        ingresos = limitar(
            rng.lognormal(
                mean=np.log(1800),
                sigma=0.55
            ),
            600,
            15000
        )


        monto = rng.uniform(
            15000,
            250000
        )


        plazo = int(
            elegir(
                [
                    60,
                    84,
                    120,
                    180,
                    240
                ],
                [
                    0.08,
                    0.10,
                    0.22,
                    0.30,
                    0.30
                ]
            )
        )


        subsegmento = (
            "Vivienda"
        )


        producto = (
            "No aplica"
        )


        fuente_pago = str(
            elegir(
                [
                    "Sueldo",
                    "Honorarios profesionales",
                    "Otros ingresos"
                ],
                [
                    0.76,
                    0.17,
                    0.07
                ]
            )
        )


        antiguedad = limitar(
            rng.gamma(
                shape=2.6,
                scale=2.2
            ),
            0.2,
            30
        )


    # ========================================================
    # INMOBILIARIO
    # ========================================================

    elif tipo_credito == "Inmobiliario":

        ingresos = limitar(
            rng.lognormal(
                mean=np.log(2400),
                sigma=0.62
            ),
            700,
            22000
        )


        monto = rng.uniform(
            20000,
            450000
        )


        plazo = int(
            elegir(
                [
                    60,
                    84,
                    120,
                    180,
                    240
                ],
                [
                    0.08,
                    0.10,
                    0.24,
                    0.30,
                    0.28
                ]
            )
        )


        subsegmento = (
            "Inmobiliario"
        )


        producto = (
            "No aplica"
        )


        fuente_pago = str(
            elegir(
                [
                    "Sueldo",
                    "Honorarios profesionales",
                    "Ingresos por actividad comercial"
                ],
                [
                    0.60,
                    0.18,
                    0.22
                ]
            )
        )


        antiguedad = limitar(
            rng.gamma(
                shape=2.8,
                scale=2.2
            ),
            0.2,
            30
        )


    # ========================================================
    # EDUCATIVO
    # ========================================================

    else:

        ingresos = limitar(
            rng.lognormal(
                mean=np.log(1100),
                sigma=0.50
            ),
            450,
            8000
        )


        monto = rng.uniform(
            500,
            50000
        )


        plazo = int(
            elegir(
                [
                    6,
                    12,
                    18,
                    24,
                    36,
                    48,
                    60
                ],
                [
                    0.08,
                    0.18,
                    0.10,
                    0.24,
                    0.20,
                    0.12,
                    0.08
                ]
            )
        )


        subsegmento = (
            "Educativo"
        )


        producto = (
            "No aplica"
        )


        fuente_pago = str(
            elegir(
                [
                    "Sueldo",
                    "Honorarios profesionales",
                    "Otros ingresos"
                ],
                [
                    0.70,
                    0.18,
                    0.12
                ]
            )
        )


        antiguedad = limitar(
            rng.gamma(
                shape=2.1,
                scale=2.0
            ),
            0.1,
            25
        )


    return {

        "ingresos":
            float(ingresos),

        "ventas_anuales":
            float(ventas_anuales),

        "subsegmento":
            subsegmento,

        "producto":
            producto,

        "monto":
            float(monto),

        "plazo":
            plazo,

        "fuente_pago":
            fuente_pago,

        "antiguedad":
            float(antiguedad)
    }


# ============================================================
# GENERAR REGISTRO
# ============================================================

def generar_registro(
    id_registro
):

    tipo_credito = (
        generar_segmento()
    )


    datos = (
        generar_datos_segmento(
            tipo_credito
        )
    )


    ingresos = (
        datos[
            "ingresos"
        ]
    )


    proporcion_egresos = limitar(
        rng.normal(
            0.52,
            0.16
        ),
        0.18,
        0.95
    )


    egresos = (
        ingresos
        *
        proporcion_egresos
    )


    capacidad_pago = max(
        ingresos
        -
        egresos,
        0
    )


    nivel_endeudamiento = limitar(
        rng.normal(
            34,
            19
        ),
        0,
        95
    )


    monto_solicitado = (
        datos[
            "monto"
        ]
    )


    plazo_meses = (
        datos[
            "plazo"
        ]
    )


    antiguedad = (
        datos[
            "antiguedad"
        ]
    )


    # ========================================================
    # VARIABLES DERIVADAS
    # ========================================================

    relacion_egresos = (
        egresos
        /
        max(
            ingresos,
            1
        )
    )


    relacion_capacidad = (
        capacidad_pago
        /
        max(
            ingresos,
            1
        )
    )


    # Aproximación académica.
    # No corresponde a una cuota contractual real.

    cuota_aproximada = (
        monto_solicitado
        /
        max(
            plazo_meses,
            1
        )
    )


    relacion_cuota_ingreso = (
        cuota_aproximada
        /
        max(
            ingresos,
            1
        )
    )


    # ========================================================
    # RIESGO SINTÉTICO
    # ========================================================

    riesgo_lineal = (

        -2.85

        +

        2.10
        *
        (
            nivel_endeudamiento
            /
            100
        )

        +

        1.75
        *
        relacion_egresos

        +

        2.00
        *
        min(
            relacion_cuota_ingreso,
            1.5
        )

        -

        1.15
        *
        relacion_capacidad

        -

        0.045
        *
        min(
            antiguedad,
            15
        )
    )


    ajuste_segmento = {

        "Consumo":
            0.05,

        "Microcrédito":
            0.18,

        "Productivo":
            0.08,

        "Vivienda":
            -0.08,

        "Inmobiliario":
            -0.03,

        "Educativo":
            0.02
    }


    ajuste_fuente_pago = {

        "Sueldo":
            -0.14,

        "Ventas del negocio":
            0.05,

        "Ingresos por actividad comercial":
            0.08,

        "Honorarios profesionales":
            0.02,

        "Otros ingresos":
            0.12
    }


    riesgo_lineal += (
        ajuste_segmento.get(
            tipo_credito,
            0.0
        )
    )


    riesgo_lineal += (
        ajuste_fuente_pago.get(
            datos[
                "fuente_pago"
            ],
            0.0
        )
    )


    riesgo_lineal += rng.normal(
        0,
        0.55
    )


    probabilidad_mora = sigmoid(
        riesgo_lineal
    )


    mora = int(
        rng.random()
        <
        probabilidad_mora
    )


    return {

        "id_registro":
            id_registro,

        "ingresos_mensuales":
            redondear(
                ingresos
            ),

        "egresos_mensuales":
            redondear(
                egresos
            ),

        "nivel_endeudamiento":
            round(
                nivel_endeudamiento,
                2
            ),

        "capacidad_pago":
            redondear(
                capacidad_pago
            ),

        "tipo_credito":
            tipo_credito,

        "subsegmento_credito":
            datos[
                "subsegmento"
            ],

        "producto_credito":
            datos[
                "producto"
            ],

        "monto_solicitado":
            redondear(
                monto_solicitado
            ),

        "plazo_meses":
            plazo_meses,

        "ventas_anuales":
            redondear(
                datos[
                    "ventas_anuales"
                ]
            ),

        "fuente_pago":
            datos[
                "fuente_pago"
            ],

        "antiguedad_laboral_anios":
            round(
                antiguedad,
                2
            ),

        "mora":
            mora
    }


# ============================================================
# GENERAR DATASET
# ============================================================

def generar_dataset():

    print(
        "\n========================================"
    )

    print(
        " GENERANDO DATASET SINTÉTICO V2"
    )

    print(
        "========================================\n"
    )


    registros = [

        generar_registro(
            indice
        )

        for indice in range(
            1,
            NUM_REGISTROS
            + 1
        )
    ]


    df = pd.DataFrame(
        registros
    )


    if (
        df
        .isnull()
        .any()
        .any()
    ):

        raise RuntimeError(
            "El dataset contiene valores nulos."
        )


    clases = set(
        df[
            "mora"
        ]
        .unique()
    )


    if (
        clases != {0, 1}
    ):

        raise RuntimeError(
            "La variable objetivo mora debe contener las clases 0 y 1."
        )


    DATASET_PATH.parent.mkdir(
        parents=True,
        exist_ok=True
    )


    df.to_csv(
        DATASET_PATH,
        index=False,
        encoding="utf-8-sig"
    )


    print(
        "Dataset generado correctamente."
    )


    print(
        f"\nArchivo:\n{DATASET_PATH}"
    )


    print(
        f"\nCantidad de registros: {len(df)}"
    )


    print(
        "\nDistribución por segmento:"
    )

    print(
        df[
            "tipo_credito"
        ]
        .value_counts()
    )


    print(
        "\nDistribución por subsegmento:"
    )

    print(
        df[
            "subsegmento_credito"
        ]
        .value_counts()
    )


    print(
        "\nDistribución por producto:"
    )

    print(
        df[
            "producto_credito"
        ]
        .value_counts()
    )


    print(
        "\nDistribución de mora:"
    )

    print(
        df[
            "mora"
        ]
        .value_counts()
    )


    print(
        "\nPorcentaje de mora:"
    )

    print(
        (
            df[
                "mora"
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


    print(
        "\nPrimeros registros:"
    )

    print(
        df.head()
    )


    print(
        "\n========================================"
    )

    print(
        " DATASET V2 LISTO"
    )

    print(
        "========================================\n"
    )


# ============================================================
# EJECUCIÓN
# ============================================================

if (
    __name__
    ==
    "__main__"
):

    generar_dataset()