"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface MateriaProfesor {
  id: string;
  materia: {
    id: string;
    nombre: string;
    codigo: string;
    curso: {
      nombre: string;
      escuela: {
        nombre: string;
      };
    };
  };
}

export default function MateriasList() {
  const [materias, setMaterias] = useState<MateriaProfesor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMaterias();
  }, []);

  const fetchMaterias = async () => {
    try {
      const response = await fetch("/api/materias/profesor");
      const data = await response.json();
      setMaterias(data);
    } catch (error) {
      console.error("Error al cargar materias:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Cargando...</div>;
  }

  return (
    <div>
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-navy-200">
          {materias.length === 0 ? (
            <li className="px-6 py-4 text-center text-navy-500">
              No tienes materias asignadas
            </li>
          ) : (
            materias.map((mp) => (
              <li key={mp.id} className="px-6 py-4 hover:bg-navy-50">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-navy-900">
                      {mp.materia.nombre}
                    </p>
                    <div className="mt-2 flex items-center text-sm text-navy-500">
                      <span>{mp.materia.curso.escuela.nombre}</span>
                      <span className="mx-2">•</span>
                      <span>{mp.materia.curso.nombre}</span>
                      <span className="mx-2">•</span>
                      <span>Código: {mp.materia.codigo}</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <Link
                      href={`/profesor/materia/${mp.materia.id}`}
                      className="bg-navy-700 text-white px-4 py-2 rounded-lg hover:bg-navy-800 text-sm font-medium transition-colors"
                    >
                      Cargar Notas
                    </Link>
                  </div>
                </div>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}

