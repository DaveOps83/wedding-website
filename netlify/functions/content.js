// Serves the actual wedding weekend details (schedule, venues, dress codes,
// coordinator contact, guest book / gift fund links, map embeds) — none of
// which should ever ship in the static client bundle, since that's readable
// via "View Source" by anyone before they ever enter the password. Gated
// behind the same signed session token as verify.js and weather.js.

const { verifyToken } = require('./lib/tokens');

const CONTENT = {
  en: {
    coordinatorName: "Lucía de Andrés",
    coordinatorRole: "Event Coordinator",
    coordinatorPhone: "+34666891100",
    guestbookUrl: "https://www.wedibox.com/w/merici-and-david-malaga",
    giftfundUrl: "https://revolut.me/merici0c9",
    guestbookNote: "Leave us a message and upload your photos. You can also add song requests to the party playlist. This only opens up for use on the wedding day.",
    giftfundNote: "Having you here is truly the best gift. But if you want to give us another, we'd prefer money.",
    fri_c_schedule: [["17:30", "Ceremony starts"], ["18:15", "Photos outside the church"]],
    fri_c_loc: "Málaga historic centre.",
    fri_c_transport: "Only reachable on foot. Cars aren't permitted in the historic centre, so allow a few extra minutes to arrive on time.",
    fri_c_dress: "Casual elegant or cocktail, think long summer dresses, a button-down shirt, or dress trousers with a tie and blazer. Please cover your shoulders for the ceremony, a simple scarf or shawl will do. No need to buy something specific to wear if you don't have it.",
    fri_c_venue: "Iglesia de San Juan",
    fri_c_map: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d44264.80183265609!2d-4.42061895!3d36.73558899999999!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xd72f7960a0d93d9%3A0x4c5de4593229a6a5!2sIglesia%20de%20San%20Juan%20de%20M%C3%A1laga!5e0!3m2!1sen!2suk!4v1788265142526!5m2!1sen!2suk",
    fri_r_schedule: [["19:00", "Guests arrive"], ["19:15", "Cocktails on the lower forecourt"], ["20:30", "Dinner on the main forecourt"], ["22:45", "The party begins!"], ["01:15", "Late-night bites"], ["03:00", "Open bar ends"]],
    fri_r_loc: "Camino de Casabermeja 128, Málaga.",
    fri_r_transport: "Taxi, Uber, or car are the easiest options.",
    fri_r_dress: "Casual elegant or cocktail, think long summer dresses, a button-down shirt, or dress trousers with a tie and blazer.",
    fri_r_venue: "Hacienda Nadales",
    fri_r_map: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d5531.43439208823!2d-4.425044000000001!3d36.7586953!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xd72f64475c1d34f%3A0x5a2b7af23409ad48!2sHacienda%20Nadales!5e0!3m2!1sen!2suk!4v1788265463507!5m2!1sen!2suk",
    sat_schedule: [["15:00", "Drinks & tapas"], ["17:00", "Up to the terrace or the dance area if you feel like partying. We have no fixed plan for afterwards, let's see where the night takes us."]],
    sat_loc: "Paseo de la Farola 25, Málaga.",
    sat_transport: "Taxi, Uber, or car recommended.",
    sat_dress: "Smart resort casual, Trocadero is a stylish waterfront terrace, so think elevated but relaxed: linen shirts, sundresses, smart sandals or espadrilles. No swimwear or flip-flops.",
    sat_venue: "Trocadero Casa de Botes",
    sat_map: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d5534.722448509869!2d-4.4146975!3d36.7130757!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xd72f7e997e94611%3A0x31211f666633e5b8!2sTrocadero%20Casa%20de%20Botes!5e0!3m2!1sen!2suk!4v1788265508037!5m2!1sen!2suk",
    sun_schedule: [["13:00", "We'll be unwinding on the beach from this time, you're welcome to join us. If you'd like help arranging a sun lounger, just let us know. They come as a set of two and are €10 per set."]],
    sun_loc: "Torremolinos.",
    sun_transport: "Taxi, Uber, or car recommended.",
    sun_dress: "Casual beachwear, obviously.",
    sun_venue: "La Playa Surf House",
    sun_map: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d710.952215165983!2d-4.478702105348915!3d36.64286746715987!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xd72f962bed1b663%3A0xbae0e1e4ff7170bd!2sLa%20Playa%20Surf%20House%20%7C%20Chiringuito%20Torremolinos!5e0!3m2!1sen!2suk!4v1788265940335!5m2!1sen!2suk"
  },
  es: {
    coordinatorName: "Lucía de Andrés",
    coordinatorRole: "Coordinadora del evento",
    coordinatorPhone: "+34666891100",
    guestbookUrl: "https://www.wedibox.com/w/merici-and-david-malaga",
    giftfundUrl: "https://revolut.me/merici0c9",
    guestbookNote: "Déjanos un mensaje y sube tus fotos. También puedes añadir canciones a la lista de la fiesta. Esto solo se abre para usarse el día de la boda.",
    giftfundNote: "Teneros aquí es de verdad el mejor regalo. Pero si queréis darnos otro, preferimos dinero.",
    fri_c_schedule: [["17:30", "Comienza la ceremonia"], ["18:15", "Fotos a la salida de la iglesia"]],
    fri_c_loc: "centro histórico de Málaga.",
    fri_c_transport: "Solo se puede llegar a pie. No se permiten coches en el centro histórico, así que reserva unos minutos extra para llegar a tiempo.",
    fri_c_dress: "Elegante informal o cóctel: vestidos largos de verano, camisa entallada, o pantalón de vestir con corbata y chaqueta. Por favor, cubre los hombros para la ceremonia, basta con un pañuelo o chal sencillo. No hace falta comprar algo específico si no lo tienes.",
    fri_c_venue: "Iglesia de San Juan",
    fri_c_map: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d44264.80183265609!2d-4.42061895!3d36.73558899999999!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xd72f7960a0d93d9%3A0x4c5de4593229a6a5!2sIglesia%20de%20San%20Juan%20de%20M%C3%A1laga!5e0!3m2!1sen!2suk!4v1788265142526!5m2!1sen!2suk",
    fri_r_schedule: [["19:00", "Llegada de los invitados"], ["19:15", "Cócteles en el patio inferior"], ["20:30", "Cena en el patio principal"], ["22:45", "¡Empieza la fiesta!"], ["01:15", "Aperitivos de madrugada"], ["03:00", "Termina la barra libre"]],
    fri_r_loc: "Camino de Casabermeja 128, Málaga.",
    fri_r_transport: "Taxi, Uber o coche son las opciones más sencillas.",
    fri_r_dress: "Elegante informal o cóctel: vestidos largos de verano, camisa entallada, o pantalón de vestir con corbata y chaqueta.",
    fri_r_venue: "Hacienda Nadales",
    fri_r_map: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d5531.43439208823!2d-4.425044000000001!3d36.7586953!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xd72f64475c1d34f%3A0x5a2b7af23409ad48!2sHacienda%20Nadales!5e0!3m2!1sen!2suk!4v1788265463507!5m2!1sen!2suk",
    sat_schedule: [["15:00", "Copas y tapas"], ["17:00", "Sube a la terraza o a la pista de baile si te apetece fiesta. No tenemos plan fijo para después, veamos hacia dónde nos lleva la noche."]],
    sat_loc: "Paseo de la Farola 25, Málaga.",
    sat_transport: "Se recomienda taxi, Uber o coche.",
    sat_dress: "Informal elegante de resort. Trocadero es una terraza junto al mar con estilo, así que piensa en algo elevado pero relajado: camisas de lino, vestidos de verano, sandalias elegantes o espadrilles. Sin bañador ni chanclas.",
    sat_venue: "Trocadero Casa de Botes",
    sat_map: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d5534.722448509869!2d-4.4146975!3d36.7130757!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xd72f7e997e94611%3A0x31211f666633e5b8!2sTrocadero%20Casa%20de%20Botes!5e0!3m2!1sen!2suk!4v1788265508037!5m2!1sen!2suk",
    sun_schedule: [["13:00", "Estaremos relajándonos en la playa a partir de esta hora, estáis invitados a acompañarnos. Si queréis ayuda para conseguir una tumbona, decidnoslo. Vienen en juegos de dos y cuestan 10 € el juego."]],
    sun_loc: "Torremolinos.",
    sun_transport: "Se recomienda taxi, Uber o coche.",
    sun_dress: "Ropa de playa informal, evidentemente.",
    sun_venue: "La Playa Surf House",
    sun_map: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d710.952215165983!2d-4.478702105348915!3d36.64286746715987!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xd72f962bed1b663%3A0xbae0e1e4ff7170bd!2sLa%20Playa%20Surf%20House%20%7C%20Chiringuito%20Torremolinos!5e0!3m2!1sen!2suk!4v1788265940335!5m2!1sen!2suk"
  },
  pt: {
    coordinatorName: "Lucía de Andrés",
    coordinatorRole: "Coordenadora do evento",
    coordinatorPhone: "+34666891100",
    guestbookUrl: "https://www.wedibox.com/w/merici-and-david-malaga",
    giftfundUrl: "https://revolut.me/merici0c9",
    guestbookNote: "Deixa-nos uma mensagem e envia as tuas fotos. Também podes adicionar músicas à lista da festa. Isto só abre para uso no dia do casamento.",
    giftfundNote: "Ter-vos aqui é realmente o melhor presente. Mas se quiserem dar-nos outro, preferimos dinheiro.",
    fri_c_schedule: [["17:30", "A cerimónia começa"], ["18:15", "Fotografias à saída da igreja"]],
    fri_c_loc: "centro histórico de Málaga.",
    fri_c_transport: "Só é possível chegar a pé. Não são permitidos carros no centro histórico, por isso reserve alguns minutos extra para chegar a tempo.",
    fri_c_dress: "Elegante casual ou cocktail: vestidos longos de verão, camisa social, ou calças de vestir com gravata e blazer. Por favor cubra os ombros para a cerimónia, basta um lenço ou xale simples. Não é preciso comprar algo específico se não tiveres.",
    fri_c_venue: "Iglesia de San Juan",
    fri_c_map: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d44264.80183265609!2d-4.42061895!3d36.73558899999999!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xd72f7960a0d93d9%3A0x4c5de4593229a6a5!2sIglesia%20de%20San%20Juan%20de%20M%C3%A1laga!5e0!3m2!1sen!2suk!4v1788265142526!5m2!1sen!2suk",
    fri_r_schedule: [["19:00", "Chegada dos convidados"], ["19:15", "Cocktails no pátio inferior"], ["20:30", "Jantar no pátio principal"], ["22:45", "Começa a festa!"], ["01:15", "Petiscos noturnos"], ["03:00", "Fim do bar aberto"]],
    fri_r_loc: "Camino de Casabermeja 128, Málaga.",
    fri_r_transport: "Táxi, Uber ou carro são as opções mais fáceis.",
    fri_r_dress: "Elegante casual ou cocktail: vestidos longos de verão, camisa social, ou calças de vestir com gravata e blazer.",
    fri_r_venue: "Hacienda Nadales",
    fri_r_map: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d5531.43439208823!2d-4.425044000000001!3d36.7586953!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xd72f64475c1d34f%3A0x5a2b7af23409ad48!2sHacienda%20Nadales!5e0!3m2!1sen!2suk!4v1788265463507!5m2!1sen!2suk",
    sat_schedule: [["15:00", "Copos e petiscos"], ["17:00", "Suba até ao terraço ou à pista de dança se quiser festa. Não temos plano fixo para depois, vamos ver para onde a noite nos leva."]],
    sat_loc: "Paseo de la Farola 25, Málaga.",
    sat_transport: "Recomenda-se táxi, Uber ou carro.",
    sat_dress: "Casual chique de resort. O Trocadero é um terraço à beira-mar com estilo, por isso pense em algo elegante mas relaxado: camisas de linho, vestidos de verão, sandálias elegantes ou espadrilles. Sem roupa de banho nem chinelos.",
    sat_venue: "Trocadero Casa de Botes",
    sat_map: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d5534.722448509869!2d-4.4146975!3d36.7130757!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xd72f7e997e94611%3A0x31211f666633e5b8!2sTrocadero%20Casa%20de%20Botes!5e0!3m2!1sen!2suk!4v1788265508037!5m2!1sen!2suk",
    sun_schedule: [["13:00", "Vamos estar a relaxar na praia a partir desta hora, são bem-vindos a juntar-se a nós. Se quiserem ajuda a conseguir uma espreguiçadeira, basta avisar-nos. Vêm em conjuntos de duas e custam 10 € o conjunto."]],
    sun_loc: "Torremolinos.",
    sun_transport: "Recomenda-se táxi, Uber ou carro.",
    sun_dress: "Roupa de praia casual, obviamente.",
    sun_venue: "La Playa Surf House",
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
