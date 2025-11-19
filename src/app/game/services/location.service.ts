export class LocationService {
  static async getRegion(): Promise<{ country?: string; state?: string }> {
    try {
      // 1️⃣ tenta obter coordenadas via navegador
      const coords = await new Promise<GeolocationPosition>((resolve, reject) => {
        if (!navigator.geolocation) return reject('Geolocalização não suportada');
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 8000,
        });
      });

      const { latitude, longitude } = coords.coords;

      // 2️⃣ tenta buscar dados regionais com API pública
      const response = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=pt`
      );
      const data = await response.json();

      return {
        country: data.countryName || 'Desconhecido',
        state: data.principalSubdivision || 'Desconhecido',
      };
    } catch (err) {
      console.warn('⚠️ Falha ao obter localização, usando valores padrão.', err);
      return {
        country: '',
        state: '', // fallback manual para exibição
      };
    }
  }
}
