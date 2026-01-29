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
    return <div className="text-center py-8 text-muted-foreground">Cargando...</div>;
  }

  return (
    <div>
      <div className="bg-card border shadow-sm overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-border">
          {materias.length === 0 ? (
            <li className="px-6 py-4 text-center text-muted-foreground">
              No tienes materias asignadas
            </li>
          ) : (
            materias.map((mp) => (
              <li key={mp.id} className="px-6 py-4 hover:bg-muted/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-foreground">
                      {mp.materia.nombre}
                    </p>
                    <div className="mt-2 flex items-center text-sm text-muted-foreground">
                      <span>{mp.materia.curso.escuela.nombre}</span>
                      <span className="mx-2 text-border">•</span>
                      <span>{mp.materia.curso.nombre}</span>
                      <span className="mx-2 text-border">•</span>
                      <span className="font-medium text-foreground">Código: {mp.materia.codigo}</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <Link
                      href={`/profesor/materia/${mp.materia.id}`}
                      className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2"
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

