import { useEffect, useState } from 'react';
import { MapPin } from 'lucide-react';
import { citiesService } from '../../services/citiesService';

/**
 * Filtro de cidade reutilizado em Vendas, Pedidos, Estoque e Categorias.
 * Gerente escolhe livremente (inclui "Todas as Cidades"); supervisor vê
 * a própria cidade travada, já que o backend trava do mesmo jeito.
 */
export default function CityFilterSelect({ user, value, onChange }) {
  const [cities, setCities] = useState([]);

  useEffect(() => {
    if (user?.role !== 'MANAGER') return;
    citiesService.getCities()
      .then((data) => setCities((data || []).filter((c) => c.is_active)))
      .catch(() => setCities([]));
  }, [user?.role]);

  if (user?.role === 'CITY_SUPERVISOR') {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 text-gray-600 font-medium">
        <MapPin size={14} className="text-emerald-600" />
        {user.city ? `${user.city.name}/${user.city.state}` : 'Sem cidade'}
      </span>
    );
  }

  return (
    <select
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      className="text-xs bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-500"
    >
      <option value="">Todas as Cidades</option>
      {cities.map((city) => (
        <option key={city.id} value={city.id}>{city.name}/{city.state}</option>
      ))}
    </select>
  );
}
