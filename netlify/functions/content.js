// Serves the actual wedding weekend details (schedule, venues, dress codes,
// coordinator contact, guest book / gift fund links, map embeds) — none of
// which should ever ship in the static client bundle, since that's readable
// via "View Source" by anyone before they ever enter the password. Gated
// behind the same signed session token as verify.js and weather.js.

const { verifyToken } = require('./lib/tokens');

const CONTENT = {
  en: {
    coordinatorName: "Luc\u00eda de Andr\u00e9s",
    coordinatorRole: "Event Coordinator",
    coordinatorPhone: "+34666891100",
    guestbookUrl: "https://www.wedibox.com/w/merici-and-david-malaga",
    giftfundUrl: "https://revolut.me/merici0c9",
    guestbookNote: "Leave us a message and upload your photos. You can also add song requests to the party playlist. This only opens up for use on the wedding day.",
    giftfundNote: "Having you here is truly the best gift. But if you want to give us another, we'd prefer money.",
    fri_c_schedule: [["17:30", "Ceremony starts"], ["18:15", "Photos outside the church"]],
    fri_c_loc: "M\u00e1laga historic centre.",
    fri_c_transport: "Private cars aren't permitted in the historic centre, so allow extra time to arrive on time if you have your own transport.",
    fri_c_dress: "Casual elegant, think long summer dresses, a button-down shirt, or a suit and tie.",
    fri_c_venue: "Iglesia de San Juan",
    fri_c_map: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d44264.80183265609!2d-4.42061895!3d36.73558899999999!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xd72f7960a0d93d9%3A0x4c5de4593229a6a5!2sIglesia%20de%20San%20Juan%20de%20M%C3%A1laga!5e0!3m2!1sen!2suk!4v1788265142526!5m2!1sen!2suk",
    fri_r_schedule: [["19:00", "Guests arrive"], ["19:15", "Cocktails on the lower forecourt"], ["20:30", "Dinner on the main forecourt"], ["22:45", "The party begins!"], ["01:15", "Late-night bites"], ["03:00", "Open bar ends"]],
    fri_r_loc: "Camino de Casabermeja 128, M\u00e1laga.",
    fri_r_transport: "Taxi, Uber, or car are the easiest options.",
    fri_r_dress: "Casual elegant, think long summer dresses, a button-down shirt, or a suit and tie.",
    fri_r_venue: "Hacienda Nadales",
    fri_r_map: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d5531.43439208823!2d-4.425044000000001!3d36.7586953!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xd72f64475c1d34f%3A0x5a2b7af23409ad48!2sHacienda%20Nadales!5e0!3m2!1sen!2suk!4v1788265463507!5m2!1sen!2suk",
    sat_schedule: [["15:00", "Drinks & tapas"], ["17:00", "Up to the terrace or the dance area if you feel like partying. We have no fixed plan for afterwards, let's see where the night takes us."]],
    sat_loc: "Paseo de la Farola 25, M\u00e1laga.",
    sat_transport: "Taxi, Uber, or car recommended.",
    sat_dress: "Smart resort casual, Trocadero is a stylish waterfront terrace, so think elevated but relaxed: linen shirts, sundresses, smart sandals or espadrilles. No swimwear or flip-flops.",
    sat_venue: "Trocadero Casa de Botes",
    sat_map: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d5534.722448509869!2d-4.4146975!3d36.7130757!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xd72f7e997e94611%3A0x31211f666633e5b8!2sTrocadero%20Casa%20de%20Botes!5e0!3m2!1sen!2suk!4v1788265508037!5m2!1sen!2suk",
    sun_schedule: [["13:00", "We'll be unwinding on the beach from this time, you're welcome to join us."]],
    sun_loc: "Torremolinos.",
    sun_transport: "Taxi, Uber, or car recommended.",
    sun_dress: "Casual beachwear, obviously.",
    sun_venue: "La Playa Surf House",
    sun_notes: [
      "This is an entirely optional event, if the beach is not your thing or you would like to do something else on Sunday, you do you!",
      "If you'd like help arranging a sun bed, just let us know. They accommodate two and are \u20ac10 per set.",
      "Booking a table at the venue does not automatically book you a sun bed as well. These are separate things.",
      "<em>\"And always remember to bring a towel...\"</em>"
    ],
    sun_map: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d710.952215165983!2d-4.478702105348915!3d36.64286746715987!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xd72f962bed1b663%3A0xbae0e1e4ff7170bd!2sLa%20Playa%20Surf%20House%20%7C%20Chiringuito%20Torremolinos!5e0!3m2!1sen!2suk!4v1788265940335!5m2!1sen!2suk"
  },
  es: {
    coordinatorName: "Luc\u00eda de Andr\u00e9s",
    coordinatorRole: "Coordinadora del evento",
    coordinatorPhone: "+34666891100",
    guestbookUrl: "https://www.wedibox.com/w/merici-and-david-malaga",
    giftfundUrl: "https://revolut.me/merici0c9",
    guestbookNote: "D\u00e9janos un mensaje y sube tus fotos. Tambi\u00e9n puedes a\u00f1adir canciones a la lista de la fiesta. Esto solo se abre para usarse el d\u00eda de la boda.",
    giftfundNote: "Teneros aqu\u00ed es de verdad el mejor regalo. Pero si quer\u00e9is darnos otro, preferimos dinero.",
    fri_c_schedule: [["17:30", "Comienza la ceremonia"], ["18:15", "Fotos a la salida de la iglesia"]],
    fri_c_loc: "centro hist\u00f3rico de M\u00e1laga.",
    fri_c_transport: "No se permiten coches particulares en el centro hist\u00f3rico, as\u00ed que reserva tiempo extra para llegar a tiempo si vas en tu propio transporte.",
    fri_c_dress: "Casual elegante. Imagina vestidos de verano largos, camisa abotonada, o traje con corbata.",
    fri_c_venue: "Iglesia de San Juan",
    fri_c_map: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d44264.80183265609!2d-4.42061895!3d36.73558899999999!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xd72f7960a0d93d9%3A0x4c5de4593229a6a5!2sIglesia%20de%20San%20Juan%20de%20M%C3%A1laga!5e0!3m2!1sen!2suk!4v1788265142526!5m2!1sen!2suk",
    fri_r_schedule: [["19:00", "Llegada de los invitados"], ["19:15", "C\u00f3cteles en el patio inferior"], ["20:30", "Cena en el patio principal"], ["22:45", "\u00a1Empieza la fiesta!"], ["01:15", "Aperitivos de madrugada"], ["03:00", "Termina la barra libre"]],
    fri_r_loc: "Camino de Casabermeja 128, M\u00e1laga.",
    fri_r_transport: "Taxi, Uber o coche son las opciones m\u00e1s sencillas.",
    fri_r_dress: "Casual elegante. Imagina vestidos de verano largos, camisa abotonada, o traje con corbata.",
    fri_r_venue: "Hacienda Nadales",
    fri_r_map: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d5531.43439208823!2d-4.425044000000001!3d36.7586953!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xd72f64475c1d34f%3A0x5a2b7af23409ad48!2sHacienda%20Nadales!5e0!3m2!1sen!2suk!4v1788265463507!5m2!1sen!2suk",
    sat_schedule: [["15:00", "Copas y tapas"], ["17:00", "Sube a la terraza o a la pista de baile si te apetece fiesta. No tenemos plan fijo para despu\u00e9s, veamos hacia d\u00f3nde nos lleva la noche."]],
    sat_loc: "Paseo de la Farola 25, M\u00e1laga.",
    sat_transport: "Se recomienda taxi, Uber o coche.",
    sat_dress: "Informal elegante, estilo resort. Trocadero es una terraza con encanto junto al mar, as\u00ed que buscamos un look cuidado pero relajado, camisas de lino, vestidos vaporosos, sandalias elegantes o alpargatas. Sin traje de ba\u00f1o ni cholas.",
    sat_venue: "Trocadero Casa de Botes",
    sat_map: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d5534.722448509869!2d-4.4146975!3d36.7130757!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xd72f7e997e94611%3A0x31211f666633e5b8!2sTrocadero%20Casa%20de%20Botes!5e0!3m2!1sen!2suk!4v1788265508037!5m2!1sen!2suk",
    sun_schedule: [["13:00", "Estaremos relaj\u00e1ndonos en la playa a partir de esta hora, est\u00e1is invitados a acompa\u00f1arnos."]],
    sun_loc: "Torremolinos.",
    sun_transport: "Se recomienda taxi, Uber o coche.",
    sun_dress: "Ropa de playa informal, evidentemente.",
    sun_venue: "La Playa Surf House",
    sun_notes: [
      "Este es un evento totalmente opcional; si la playa no es lo tuyo o prefieres hacer otra cosa el domingo, \u00a1haz lo que quieras!",
      "Si quer\u00e9is ayuda para conseguir una tumbona, decidnoslo. Son para dos personas y cuestan 10 \u20ac el juego.",
      "Reservar una mesa en el lugar no os reserva autom\u00e1ticamente una tumbona tambi\u00e9n. Son cosas independientes.",
      "Y recuerda siempre traer una toalla..."
    ],
    sun_map: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d710.952215165983!2d-4.478702105348915!3d36.64286746715987!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xd72f962bed1b663%3A0xbae0e1e4ff7170bd!2sLa%20Playa%20Surf%20House%20%7C%20Chiringuito%20Torremolinos!5e0!3m2!1sen!2suk!4v1788265940335!5m2!1sen!2suk"
  },
  pt: {
    coordinatorName: "Luc\u00eda de Andr\u00e9s",
    coordinatorRole: "Coordenadora do evento",
    coordinatorPhone: "+34666891100",
    guestbookUrl: "https://www.wedibox.com/w/merici-and-david-malaga",
    giftfundUrl: "https://revolut.me/merici0c9",
    guestbookNote: "Deixa-nos uma mensagem e envia as tuas fotos. Tamb\u00e9m podes adicionar m\u00fasicas \u00e0 lista da festa. Isto s\u00f3 abre para uso no dia do casamento.",
    giftfundNote: "Ter-vos aqui \u00e9 realmente o melhor presente. Mas se quiserem dar-nos outro, preferimos dinheiro.",
    fri_c_schedule: [["17:30", "A cerim\u00f3nia come\u00e7a"], ["18:15", "Fotografias \u00e0 sa\u00edda da igreja"]],
    fri_c_loc: "centro hist\u00f3rico de M\u00e1laga.",
    fri_c_transport: "N\u00e3o s\u00e3o permitidos carros particulares no centro hist\u00f3rico, por isso reserve tempo extra para chegar a tempo se tiver transporte pr\u00f3prio.",
    fri_c_dress: "Elegante casual: vestidos longos de ver\u00e3o, camisa social, ou fato e gravata.",
    fri_c_venue: "Iglesia de San Juan",
    fri_c_map: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d44264.80183265609!2d-4.42061895!3d36.73558899999999!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xd72f7960a0d93d9%3A0x4c5de4593229a6a5!2sIglesia%20de%20San%20Juan%20de%20M%C3%A1laga!5e0!3m2!1sen!2suk!4v1788265142526!5m2!1sen!2suk",
    fri_r_schedule: [["19:00", "Chegada dos convidados"], ["19:15", "Cocktails no p\u00e1tio inferior"], ["20:30", "Jantar no p\u00e1tio principal"], ["22:45", "Come\u00e7a a festa!"], ["01:15", "Petiscos noturnos"], ["03:00", "Fim do bar aberto"]],
    fri_r_loc: "Camino de Casabermeja 128, M\u00e1laga.",
    fri_r_transport: "T\u00e1xi, Uber ou carro s\u00e3o as op\u00e7\u00f5es mais f\u00e1ceis.",
    fri_r_dress: "Elegante casual: vestidos longos de ver\u00e3o, camisa social, ou fato e gravata.",
    fri_r_venue: "Hacienda Nadales",
    fri_r_map: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d5531.43439208823!2d-4.425044000000001!3d36.7586953!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xd72f64475c1d34f%3A0x5a2b7af23409ad48!2sHacienda%20Nadales!5e0!3m2!1sen!2suk!4v1788265463507!5m2!1sen!2suk",
    sat_schedule: [["15:00", "Copos e petiscos"], ["17:00", "Suba at\u00e9 ao terra\u00e7o ou \u00e0 pista de dan\u00e7a se quiser festa. N\u00e3o temos plano fixo para depois, vamos ver para onde a noite nos leva."]],
    sat_loc: "Paseo de la Farola 25, M\u00e1laga.",
    sat_transport: "Recomenda-se t\u00e1xi, Uber ou carro.",
    sat_dress: "Casual chique de resort. O Trocadero \u00e9 um terra\u00e7o \u00e0 beira-mar com estilo, por isso pense em algo elegante mas relaxado: camisas de linho, vestidos de ver\u00e3o, sand\u00e1lias elegantes ou espadrilles. Sem roupa de banho nem chinelos.",
    sat_venue: "Trocadero Casa de Botes",
    sat_map: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d5534.722448509869!2d-4.4146975!3d36.7130757!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xd72f7e997e94611%3A0x31211f666633e5b8!2sTrocadero%20Casa%20de%20Botes!5e0!3m2!1sen!2suk!4v1788265508037!5m2!1sen!2suk",
    sun_schedule: [["13:00", "Vamos estar a relaxar na praia a partir desta hora, s\u00e3o bem-vindos a juntar-se a n\u00f3s."]],
    sun_loc: "Torremolinos.",
    sun_transport: "Recomenda-se t\u00e1xi, Uber ou carro.",
    sun_dress: "Roupa de praia casual, obviamente.",
    sun_venue: "La Playa Surf House",
    sun_notes: [
      "Este \u00e9 um evento totalmente opcional; se a praia n\u00e3o for a tua onda ou preferires fazer outra coisa no domingo, faz o que quiseres!",
      "Se quiserem ajuda a conseguir uma espregui\u00e7adeira, basta avisar-nos. S\u00e3o para duas pessoas e custam 10 \u20ac o conjunto.",
      "Reservar uma mesa no local n\u00e3o reserva automaticamente uma espregui\u00e7adeira tamb\u00e9m. S\u00e3o coisas separadas.",
      "E lembra-te sempre de trazer uma toalha..."
    ],
    sun_map: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d710.952215165983!2d-4.478702105348915!3d36.64286746715987!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xd72f962bed1b663%3A0xbae0e1e4ff7170bd!2sLa%20Playa%20Surf%20House%20%7C%20Chiringuito%20Torremolinos!5e0!3m2!1sen!2suk!4v1788265940335!5m2!1sen!2suk"
  }
};

exports.CONTENT = CONTENT;

exports.handler = async (event) => {
  const tokenSecret = process.env.WEDDING_TOKEN_SECRET;
  if (!tokenSecret) {
    console.error('WEDDING_TOKEN_SECRET environment variable not set');
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Server configuration error' })
    };
  }

  const authHeader = (event.headers && (event.headers.authorization || event.headers.Authorization)) || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!verifyToken(token, tokenSecret)) {
    return {
      statusCode: 401,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Unauthorized' })
    };
  }

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
    body: JSON.stringify(CONTENT)
  };
};
