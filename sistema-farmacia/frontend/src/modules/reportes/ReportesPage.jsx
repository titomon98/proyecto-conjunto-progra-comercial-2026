import { useState } from 'react';
import ReporteMedicamentosMasVendidos from './components/ReporteMedicamentosMasVendidos.jsx';
import ReporteVentasDiarias from './components/ReporteVentasDiarias.jsx';

const PESTANAS = [
  { id: 'medicamentos', texto: 'Medicamentos más vendidos' },
  { id: 'diarias', texto: 'Ventas diarias' },
];

export default function ReportesPage() {
  const [pestana, setPestana] = useState('medicamentos');

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Reportes</h1>
        <p className="text-sm text-gray-500 mt-1">
          Consultas de solo lectura sobre las ventas registradas en la farmacia.
        </p>
      </header>

      <nav className="mb-6 flex gap-1 rounded-lg bg-white p-1 shadow-sm border border-gray-200 w-fit">
        {PESTANAS.map((p) => (
          <button
            key={p.id}
            onClick={() => setPestana(p.id)}
            className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              pestana === p.id ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            {p.texto}
          </button>
        ))}
      </nav>

      {pestana === 'medicamentos' ? (
        <ReporteMedicamentosMasVendidos />
      ) : (
        <ReporteVentasDiarias />
      )}
    </div>
  );
}