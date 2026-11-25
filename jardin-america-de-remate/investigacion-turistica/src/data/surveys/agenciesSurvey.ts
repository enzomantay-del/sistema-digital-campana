import type { SurveyDefinition } from '@/data/surveys/types';

export const agenciesSurvey: SurveyDefinition = {
  id: 'agencies',
  adminTabLabel: 'Agencias (cotizaciones)',
  shortLabel: 'Cotizaciones en agencias',
  collection: 'investigacion_2026',
  storagePrefix: 'agencies',
  sharePath: '',
  shareEnvKey: 'VITE_PUBLIC_SURVEY_URL',
  shareMessageIntro:
    'Te invito a participar en esta encuesta anónima sobre cotizaciones en agencias de viajes minoristas.',
  researchTitle: 'El proceso de elaboración de cotizaciones en agencias de viajes minoristas',
  researchIntroLabel: 'Introducción',
  researchIntro:
    'Esta investigación forma parte de un estudio independiente sobre la comercialización turística en Argentina. Su objetivo es comprender cómo los asesores comerciales de agencias de viajes minoristas elaboran cotizaciones para sus clientes y cuáles son los principales desafíos que enfrentan durante ese proceso.',
  researchNotice:
    'La encuesta es completamente anónima, demora aproximadamente 5 minutos y la información será utilizada únicamente con fines de investigación.',
  researchThanks: 'Agradecemos profundamente tu colaboración.',
  estimatedMinutes: 5,
  filterQuestionId: 'participaCotizacionesIndividuales',
  filterQuestion: {
    id: 'participaCotizacionesIndividuales',
    label: '¿Participás habitualmente en la elaboración de cotizaciones individuales para clientes?',
    options: [
      { value: 'si', label: 'Sí' },
      { value: 'no', label: 'No' },
    ],
  },
  screenoutMessage:
    'Muchas gracias por tu tiempo. En esta etapa de la investigación estamos estudiando específicamente el proceso de elaboración de cotizaciones individuales en agencias de viajes minoristas.',
  filterQuestionNumber: 1,
  routes: {
    landing: '/',
    filter: '/encuesta/filtro',
    section: (sectionNumber) => `/encuesta/seccion/${sectionNumber}`,
    completed: '/encuesta/completada',
    screenout: '/encuesta/finalizada',
  },
  sections: [
    {
      id: 'perfil',
      title: 'Perfil del encuestado',
      subtitle: 'Contanos un poco sobre tu rol y la agencia donde trabajás.',
      questions: [
        {
          id: 'funcionPrincipal',
          label: '¿Cuál es tu función principal dentro de la agencia?',
          type: 'radio',
          required: true,
          options: [
            { value: 'propietario-cotizaciones', label: 'Propietario' },
            { value: 'asesor-comercial', label: 'Asesor/a comercial' },
            { value: 'ambas', label: 'Ambas funciones' },
            { value: 'otra', label: 'Otra' },
          ],
        },
        {
          id: 'aniosFuncionamientoAgencia',
          label: '¿Hace cuántos años está en funcionamiento la agencia donde trabajás?',
          type: 'radio',
          required: true,
          options: [
            { value: 'menos-2', label: 'Menos de 2 años' },
            { value: '2-5', label: 'Entre 2 y 5 años' },
            { value: '6-10', label: 'Entre 6 y 10 años' },
            { value: 'mas-10', label: 'Más de 10 años' },
          ],
        },
      ],
    },
    {
      id: 'proceso-cotizacion',
      title: 'El proceso de cotización',
      subtitle: 'Queremos conocer cómo elaborás y enviás tus propuestas a los clientes.',
      questions: [
        {
          id: 'fuentesConsulta',
          label:
            'Cuando preparás una cotización para un cliente, ¿qué fuentes consultás habitualmente?',
          type: 'checkbox',
          required: true,
          helperText: 'Podés seleccionar más de una opción.',
          options: [
            { value: 'operadores-mayoristas', label: 'Operadores mayoristas (Ola, Delfos, Juliá Tours, etc.)' },
            { value: 'agencias-operadoras', label: 'Agencias operadoras' },
            {
              value: 'prestadores-directos',
              label: 'Prestadores directos (compañías aéreas, hoteles, transportes, receptivos, etc.)',
            },
            { value: 'plataformas-online', label: 'Plataformas online (Booking, Expedia, etc.)' },
            { value: 'motores-busqueda', label: 'Motores de búsqueda (Google, metabuscadores, etc.)' },
            { value: 'otas', label: 'OTAs (Despegar, Almundo, etc.)' },
            { value: 'otra', label: 'Otra' },
          ],
        },
        {
          id: 'tiempoPreparacionCotizacion',
          label:
            'Pensando en una cotización importante, donde buscás ofrecer la mejor propuesta posible, ¿cuánto tiempo te demanda prepararla?',
          type: 'radio',
          required: true,
          options: [
            { value: 'menos-30', label: 'Menos de 30 minutos' },
            { value: '30-60', label: 'Entre 30 minutos y 1 hora' },
            { value: '1-2', label: 'Entre 1 y 2 horas' },
            { value: 'mas-2', label: 'Más de 2 horas' },
          ],
        },
        {
          id: 'tiempoPrimeraPropuesta',
          label:
            'Cuando recibís una consulta para un viaje individual, ¿en cuánto tiempo lográs enviar la primera propuesta al cliente?',
          type: 'radio',
          required: true,
          options: [
            { value: 'mismo-dia', label: 'El mismo día' },
            { value: 'dia-siguiente', label: 'Al día siguiente' },
            { value: '2-3-dias', label: 'Entre 2 y 3 días' },
            { value: 'mas-3-dias', label: 'Más de 3 días' },
          ],
        },
        {
          id: 'consultasSinCotizar',
          label:
            'En los últimos 30 días, aproximadamente, ¿cuántas consultas quedaron sin cotizar por falta de tiempo?',
          type: 'radio',
          required: true,
          options: [
            { value: 'ninguna', label: 'Ninguna' },
            { value: '1', label: '1' },
            { value: '2-3', label: '2 o 3' },
            { value: '4-mas', label: '4 o más' },
          ],
        },
      ],
    },
    {
      id: 'percepcion',
      title: 'Percepción',
      subtitle: 'Indicá cuánto estás de acuerdo con las siguientes afirmaciones.',
      scaleLegend: '1 = Totalmente en desacuerdo · 5 = Totalmente de acuerdo',
      questions: [
        {
          id: 'tiempoInfluyeCalidad',
          label:
            'El tiempo disponible influye directamente en la calidad de las cotizaciones que puedo preparar.',
          type: 'scale',
          required: true,
        },
        {
          id: 'gustariaMasTiempo',
          label: 'Me gustaría dedicar más tiempo a cada cotización del que realmente puedo dedicar.',
          type: 'scale',
          required: true,
        },
        {
          id: 'compararAlternativasLento',
          label: 'Comparar distintas alternativas consume demasiado tiempo.',
          type: 'scale',
          required: true,
        },
        {
          id: 'incertidumbreMejorOpcion',
          label:
            'Aun dedicando tiempo a una cotización, muchas veces no tengo la certeza de haber encontrado la mejor opción disponible.',
          type: 'scale',
          required: true,
        },
        {
          id: 'visionAmpliaMejoraria',
          label:
            'Contar con una visión más amplia de las alternativas disponibles mejoraría la calidad de mis propuestas.',
          type: 'scale',
          required: true,
        },
      ],
    },
    {
      id: 'desafios',
      title: 'Desafíos',
      subtitle: 'Queremos conocer las principales dificultades que enfrentás al cotizar.',
      questions: [
        {
          id: 'desafiosCotizacion',
          label: '¿Cuáles son hoy los principales desafíos al preparar una cotización?',
          type: 'checkbox',
          required: true,
          maxSelections: 3,
          helperText: 'Seleccioná hasta tres opciones.',
          options: [
            { value: 'falta-tiempo', label: 'Falta de tiempo' },
            { value: 'comparar-alternativas', label: 'Comparar alternativas' },
            { value: 'disponibilidad', label: 'Encontrar disponibilidad' },
            { value: 'cambios-precios', label: 'Cambios constantes de precios' },
            { value: 'mejor-vuelo', label: 'Elegir el mejor vuelo' },
            { value: 'mejor-alojamiento', label: 'Elegir el mejor alojamiento' },
            { value: 'info-confiable', label: 'Encontrar información confiable' },
            { value: 'otro', label: 'Otro' },
          ],
        },
        {
          id: 'ventasRespuestaRapida',
          label: '¿Creés que responder más rápido a las consultas aumentaría la cantidad de ventas que concretás?',
          type: 'radio',
          required: true,
          options: [
            { value: 'si-significativamente', label: 'Sí, significativamente' },
            { value: 'si-en-parte', label: 'Sí, en cierta medida' },
            { value: 'no-impacto', label: 'No tendría un impacto importante' },
            { value: 'no-se', label: 'No lo sé' },
          ],
        },
        {
          id: 'mayorDificultadCotizacion',
          label:
            '¿Cuál considerás que es hoy la mayor dificultad al momento de preparar una cotización para un cliente?',
          type: 'textarea',
          required: true,
          helperText: 'Respuesta abierta.',
        },
        {
          id: 'mejoraProcesoCotizacion',
          label:
            'Si pudieras mejorar una sola parte del proceso de elaboración de cotizaciones, ¿qué cambiarías?',
          type: 'textarea',
          required: true,
          helperText: 'Respuesta abierta.',
        },
        {
          id: 'ventasRespuestaRapidaConfirmacion',
          label: '¿Creés que responder más rápido a las consultas aumentaría la cantidad de ventas que concretás?',
          type: 'radio',
          required: true,
          options: [
            { value: 'si-significativamente', label: 'Sí, significativamente' },
            { value: 'si-en-parte', label: 'Sí, en cierta medida' },
            { value: 'no-impacto', label: 'No tendría un impacto importante' },
            { value: 'no-se', label: 'No lo sé' },
          ],
        },
      ],
    },
  ],
};
