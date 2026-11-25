import type { SurveyDefinition } from '@/data/surveys/types';

export const travelersSurvey: SurveyDefinition = {
  id: 'travelers',
  adminTabLabel: 'Viajeros (búsqueda)',
  shortLabel: 'Búsqueda y selección de viajes',
  collection: 'investigacion_2026_viajeros',
  storagePrefix: 'travelers',
  sharePath: '/viajeros',
  shareEnvKey: 'VITE_PUBLIC_SURVEY_URL_TRAVELERS',
  shareMessageIntro:
    'Te invito a participar en esta encuesta anónima sobre cómo las personas buscan y eligen sus viajes.',
  researchTitle: 'El proceso de búsqueda y selección de viajes',
  researchIntroLabel: 'Introducción',
  researchIntro:
    'Esta investigación forma parte de un estudio independiente sobre la forma en que las personas buscan y eligen sus viajes. Su objetivo es comprender cómo comparan las distintas alternativas disponibles y cuáles son las principales dificultades que encuentran al momento de decidir.',
  researchNotice:
    'La encuesta es completamente anónima, demora aproximadamente 5 minutos y la información será utilizada únicamente con fines de investigación.',
  researchThanks: '¡Muchas gracias por tu colaboración!',
  estimatedMinutes: 5,
  filterQuestionId: 'viajoUltimosDosAnios',
  filterQuestion: {
    id: 'viajoUltimosDosAnios',
    label: 'En los últimos 24 meses, ¿planificaste o contrataste algún viaje turístico?',
    options: [
      { value: 'si', label: 'Sí' },
      { value: 'no', label: 'No' },
    ],
  },
  screenoutMessage:
    'Muchas gracias por tu tiempo. En esta etapa de la investigación buscamos conocer la experiencia de personas que hayan planificado o contratado un viaje recientemente.',
  filterQuestionNumber: 1,
  routes: {
    landing: '/viajeros',
    filter: '/viajeros/encuesta/filtro',
    section: (sectionNumber) => `/viajeros/encuesta/seccion/${sectionNumber}`,
    completed: '/viajeros/encuesta/completada',
    screenout: '/viajeros/encuesta/finalizada',
  },
  sections: [
    {
      id: 'perfil-viajero',
      title: 'Perfil del viajero',
      subtitle: '',
      questions: [
        {
          id: 'frecuenciaViajesTurismo',
          label: '¿Con qué frecuencia realizás viajes de turismo?',
          type: 'radio',
          required: true,
          options: [
            { value: 'una-vez-anio-o-menos', label: 'Una vez al año o menos' },
            { value: 'dos-veces-anio', label: 'Dos veces al año' },
            { value: 'tres-o-mas-anio', label: 'Tres o más veces al año' },
          ],
        },
        {
          id: 'formaContratacionViajeReciente',
          label:
            'Pensando en tu viaje más reciente, ¿cómo contrataste la mayor parte de los servicios?',
          type: 'radio',
          required: true,
          options: [
            { value: 'agencia-viajes', label: 'A través de una agencia de viajes' },
            {
              value: 'directo-internet',
              label:
                'Directamente por internet (hoteles, aerolíneas, plataformas como despegar, etc.)',
            },
            { value: 'combinacion', label: 'Una combinación de ambas opciones' },
          ],
        },
      ],
    },
    {
      id: 'proceso-busqueda',
      title: 'Proceso de búsqueda',
      subtitle: '',
      questions: [
        {
          id: 'fuentesInformacionViaje',
          label: 'Cuando comenzaste a buscar ese viaje, ¿dónde buscaste información?',
          type: 'checkbox',
          required: true,
          helperText: 'Podés seleccionar más de una opción.',
          options: [
            { value: 'google', label: 'Google' },
            { value: 'redes-sociales', label: 'Redes sociales' },
            { value: 'recomendaciones', label: 'Recomendaciones de familiares o amigos' },
            { value: 'agencias-viajes', label: 'Agencias de viajes' },
            { value: 'booking', label: 'Booking' },
            { value: 'despegar', label: 'Despegar' },
            { value: 'sitios-hoteles', label: 'Sitios web de hoteles' },
            { value: 'sitios-aerolineas', label: 'Sitios web de aerolíneas' },
            { value: 'youtube', label: 'YouTube' },
            { value: 'otra', label: 'Otra' },
          ],
        },
        {
          id: 'tiempoComparacionOpciones',
          label:
            'Antes de decidirte por ese viaje, aproximadamente ¿cuánto tiempo dedicaste a comparar opciones?',
          type: 'radio',
          required: true,
          options: [
            { value: 'menos-1-hora', label: 'Menos de 1 hora' },
            { value: '1-3-horas', label: 'Entre 1 y 3 horas' },
            { value: '3-6-horas', label: 'Entre 3 y 6 horas' },
            { value: 'mas-6-horas', label: 'Más de 6 horas' },
          ],
        },
        {
          id: 'alternativasComparadas',
          label: 'Aproximadamente, ¿cuántas alternativas comparaste antes de tomar la decisión?',
          type: 'radio',
          required: true,
          options: [
            { value: 'solo-una', label: 'Solo una' },
            { value: 'dos-tres', label: 'Entre dos y tres' },
            { value: 'cuatro-seis', label: 'Entre cuatro y seis' },
            { value: 'mas-seis', label: 'Más de seis' },
          ],
        },
      ],
    },
    {
      id: 'experiencia-decision',
      title: 'Tu experiencia durante la decisión',
      subtitle:
        'Indicá cuánto estás de acuerdo con las siguientes afirmaciones, pensando en ese mismo viaje.',
      scaleLegend: '1 = Totalmente en desacuerdo · 5 = Totalmente de acuerdo',
      questions: [
        {
          id: 'infoConfiableDemasiadoTiempo',
          label: 'Encontrar información confiable para ese viaje requirió demasiado tiempo.',
          type: 'scale',
          required: true,
        },
        {
          id: 'dificilCompararFormatosDiferentes',
          label:
            'Me resultó difícil comparar las distintas propuestas porque cada empresa presentaba la información de manera diferente.',
          type: 'scale',
          required: true,
        },
        {
          id: 'dudaOpcionMejor',
          label:
            'Cuando finalmente contraté ese viaje, me quedó la duda de si existía una opción mejor.',
          type: 'scale',
          required: true,
        },
        {
          id: 'masSeguroCompararMismoLugar',
          label:
            'Me habría sentido más seguro al contratar ese viaje si hubiera podido comparar fácilmente distintas alternativas disponibles en un mismo lugar.',
          labelEmphasis: 'fácilmente',
          type: 'scale',
          required: true,
        },
        {
          id: 'muchaInformacionDecisionDificil',
          label: 'La gran cantidad de información disponible hizo que tomar la decisión fuera más difícil.',
          type: 'scale',
          required: true,
        },
      ],
    },
    {
      id: 'factores-decision',
      title: 'Factores de decisión',
      subtitle: '',
      questions: [
        {
          id: 'factoresDecisionViaje',
          label: '¿Cuáles fueron los tres factores que más influyeron en tu decisión para ese viaje?',
          type: 'checkbox',
          required: true,
          maxSelections: 3,
          helperText: 'Seleccioná hasta tres opciones.',
          options: [
            { value: 'precio', label: 'Precio' },
            { value: 'calidad-alojamiento', label: 'Calidad del alojamiento' },
            { value: 'ubicacion', label: 'Ubicación del Hotel' },
            { value: 'horarios-vuelo', label: 'Horarios del vuelo' },
            { value: 'cantidad-escalas', label: 'Cantidad de escalas' },
            { value: 'reputacion-agencia', label: 'Confianza que me transmitió la agencia o empresa' },
            { value: 'opiniones-viajeros', label: 'Opiniones de otros viajeros' },
            { value: 'servicios-incluidos', label: 'Servicios incluidos' },
            { value: 'formas-pago', label: 'Formas de pago' },
            { value: 'atencion-recibida', label: 'Atención recibida' },
            { value: 'otro', label: 'Otro' },
          ],
        },
      ],
    },
    {
      id: 'reflexion-final',
      title: 'Reflexión final',
      subtitle: '',
      questions: [
        {
          id: 'mayorDificultadElegirViaje',
          label: '¿Cuál fue la mayor dificultad que encontraste al momento de elegir ese viaje?',
          type: 'textarea',
          required: true,
          helperText: 'Respuesta abierta.',
        },
        {
          id: 'mejoraProcesoBusquedaContratacion',
          label:
            'Si pudieras mejorar una sola parte del proceso de búsqueda y contratación de ese viaje, ¿qué cambiarías?',
          type: 'textarea',
          required: true,
          helperText: 'Respuesta abierta.',
        },
        {
          id: 'postergacionPorInseguridad',
          label:
            'Pensando en tu viaje más reciente, ¿demoraste la contratación porque no estabas seguro de haber encontrado la mejor opción?',
          type: 'radio',
          required: true,
          options: [
            { value: 'si', label: 'Sí' },
            { value: 'no', label: 'No' },
          ],
        },
      ],
    },
  ],
};
