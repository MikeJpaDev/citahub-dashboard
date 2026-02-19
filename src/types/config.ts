export interface ConfiguracionClaim {
    id?: number;

    // CAPACIDAD
    cantidad_citas_por_dia: number;
    cantidad_citas_por_hora: number;
    duracion_cita_minutos: number;

    // HORARIO GENERAL
    hora_inicio: string; // "HH:MM:SS"
    hora_fin: string;    // "HH:MM:SS"

    // DIAS HABILITADOS (1=Lunes ... 7=Domingo)
    dias_habilitados: number[];

    // SERVICIOS DISPONIBLES
    servicios_disponibles: string[];

    // REGLAS DE NEGOCIO
    max_citas_por_usuario: number;
    ventana_meses_anticipacion: number;
    permitir_solo_mes_siguiente: boolean;

    // REGLAS OPERATIVAS
    asignacion_automatica_hora: boolean;
    requiere_confirmacion_explicita: boolean;

    // EMAIL
    enviar_email_en_creacion: boolean;
    enviar_email_en_modificacion: boolean;

    // CONTROL DEL SISTEMA
    sistema_activo: boolean;
    modo_mantenimiento: boolean;

    // METADATOS
    created_at?: string;
    updated_at?: string;
}
