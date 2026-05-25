'use client';
import { supabase } from './lib/supabase';
import { useEffect, useMemo, useState } from 'react';

export default function SistemaRutinas() {
  const colaboradores = [
    'Eunice Nunez',
    'Amaurys Mendez',
    'Aaron Guzman',
    'Kelly Duran',
  ];

  const tareasBase = [
    'Revisar correos de presupuestos',
    'Filtrar compras almacenadas',
    'Hacer devoluciones por tiempo en tienda',
    'Revisar el bin amarillo del holding para limpiarlo',
    'Reposición de catálogos',
    'Reposición de carritos',
    'Revisar la mercancía de venta directa',
    'Revisar si hay mercancía física fuera de ruta',
    'Asegurarse que el tono de los teléfonos tenga volumen',
    'Revisar compras enganchadas',
    'Revisar los lockers',
  ];

  const [colaborador, setColaborador] = useState('');

  const [historial, setHistorial] = useState<any[]>([]);

  const [tareas, setTareas] = useState(
    tareasBase.map((t) => ({
      nombre: t,
      realizada: false,
      observacion: '',
    }))
  );
  const cargarHistorial = async () => {
    const { data, error } = await supabase
      .from('rutinas')
      .select('*')
      .order('id', { ascending: false });
  
    if (error) {
      console.error(error);
      return;
    }
  
    setHistorial(data || []);
  };
 

useEffect(() => {
    cargarHistorial();
  
  }, []);

  const toggleTarea = (index: number) => {
    const copia = [...tareas];

    copia[index].realizada = !copia[index].realizada;

    setTareas(copia);
  };

  const actualizarObservacion = (index: number, valor: string) => {
    const copia = [...tareas];

    copia[index].observacion = valor;

    setTareas(copia);
  };

  const limpiarFormulario = () => {
    setTareas(
      tareasBase.map((t) => ({
        nombre: t,
        realizada: false,
        observacion: '',
      }))
    );
  };

  const guardarRutinas = async () => {
    if (!colaborador) {
      alert('Selecciona un colaborador');
      return;
    }
  
    const realizadas = tareas.filter((t) => t.realizada);
  
    if (realizadas.length === 0) {
      alert('Selecciona al menos una rutina');
      return;
    }
  
    const nuevosRegistros = realizadas.map((t) => ({
      colaborador,
      rutina: t.nombre,
      observacion: t.observacion || '',
      fecha: new Date().toLocaleDateString(),
      hora: new Date().toLocaleTimeString(),
    }));
  
    const { error } = await supabase
      .from('rutinas')
      .insert(nuevosRegistros);
  
    if (error) {
      console.error(error);
      alert('Error guardando');
      return;
    }
  
    await cargarHistorial();
  
    limpiarFormulario();
  
    alert('Rutinas guardadas');
  };

const hoy = new Date().toLocaleDateString();

const totalRutinasHoy = historial.filter(
  (h) => h.fecha === hoy
).length;

  const colaboradoresActivos = new Set(historial.map((h) => h.colaborador))
    .size;

  const rutinasColaborador = historial.filter(
    (h) => h.colaborador === colaborador
  ).length;

  const sinActividad = colaboradores.length - colaboradoresActivos;

  const estadoColaboradores = useMemo(() => {
    return colaboradores.map((c) => {
      const registros = historial.filter((h) => h.colaborador === c);

      return {
        nombre: c,
        total: registros.length,
        estado: registros.length > 0 ? 'ACTIVO' : 'SIN ACTIVIDAD',
      };
    });
  }, [historial]);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-3xl shadow-xl p-8 mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <h1 className="text-4xl font-bold mb-2">Sistema de Rutinas</h1>

              <p className="text-gray-500">Control operativo diario</p>
            </div>

            <div className="w-full md:w-80">
              <label className="block text-sm mb-2 font-medium">
                Colaborador
              </label>

              <select
                value={colaborador}
                onChange={(e) => setColaborador(e.target.value)}
                className="w-full border rounded-xl p-3"
              >
                <option value="">Seleccionar</option>

                {colaboradores.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow p-6">
            <h2 className="text-gray-500 mb-2">Rutinas hoy</h2>

            <p className="text-5xl font-bold">{totalRutinasHoy}</p>
          </div>

          <div className="bg-white rounded-2xl shadow p-6">
            <h2 className="text-gray-500 mb-2">Colaboradores activos</h2>

            <p className="text-5xl font-bold">{colaboradoresActivos}</p>
          </div>

          <div className="bg-white rounded-2xl shadow p-6">
            <h2 className="text-gray-500 mb-2">Rutinas colaborador</h2>

            <p className="text-5xl font-bold">{rutinasColaborador}</p>
          </div>

          <div className="bg-white rounded-2xl shadow p-6">
            <h2 className="text-gray-500 mb-2">Sin actividad</h2>

            <p className="text-5xl font-bold">{sinActividad}</p>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-xl p-8 mb-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-2xl font-bold">Registro Diario</h2>
            </div>

            <button
              onClick={guardarRutinas}
              className="bg-black text-white px-6 py-3 rounded-xl"
            >
              Guardar
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b text-left">
                  <th className="py-4">OK</th>

                  <th className="py-4">Rutina</th>

                  <th className="py-4">Observación</th>
                </tr>
              </thead>

              <tbody>
                {tareas.map((tarea, index) => (
                  <tr key={index} className="border-b">
                    <td className="py-4">
                      <input
                        type="checkbox"
                        checked={tarea.realizada}
                        onChange={() => toggleTarea(index)}
                        className="w-5 h-5"
                      />
                    </td>

                    <td className="py-4 font-medium">{tarea.nombre}</td>

                    <td className="py-4">
                      <input
                        type="text"
                        value={tarea.observacion}
                        onChange={(e) =>
                          actualizarObservacion(index, e.target.value)
                        }
                        placeholder="Observación"
                        className="border rounded-lg p-2 w-full"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-xl p-8">
          <h2 className="text-2xl font-bold mb-6">Historial</h2>

          <div className="max-h-[500px] overflow-auto">
            <table className="w-full">
            <thead>
  <tr className="border-b text-left">
    <th className="py-4">Colaborador</th>

    <th className="py-4">Rutina</th>

    <th className="py-4">Observación</th>

    <th className="py-4">Fecha</th>

    <th className="py-4">Hora</th>
  </tr>
</thead>

<tbody>
  {historial.map((h, index) => (
    <tr key={index} className="border-b">
      <td className="py-4">{h.colaborador}</td>

      <td className="py-4">{h.rutina}</td>

      <td className="py-4">{h.observacion}</td>

      <td className="py-4">{h.fecha}</td>

      <td className="py-4">{h.hora}</td>
    </tr>
  ))}
</tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
