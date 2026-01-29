"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";

interface Alumno {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  cedula?: string;
  inscripcionId: string;
}

interface Nota {
  id: string;
  calificacion: number;
  periodo: string;
  observaciones?: string;
}

export default function MateriaNotasPage() {
  const params = useParams();
  const materiaId = params.id as string;

  const [alumnos, setAlumnos] = useState<Alumno[]>([]);
  const [notas, setNotas] = useState<Record<string, Nota>>({});
  const [calificaciones, setCalificaciones] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [periodo, setPeriodo] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetchData();
  }, [materiaId]);

  const fetchData = async () => {
    try {
      const [alumnosResponse, notasResponse] = await Promise.all([
        fetch(`/api/materias/${materiaId}/alumnos`),
        fetch(`/api/notas?materiaId=${materiaId}`),
      ]);

      const alumnosData = await alumnosResponse.json();
      const notasData = await notasResponse.json();

      setAlumnos(alumnosData);

      // Crear mapa de notas por alumno y período
      const notasMap: Record<string, Nota> = {};
      const calificacionesMap: Record<string, string> = {};
      notasData.forEach((nota: any) => {
        const key = `${nota.alumnoId}-${nota.periodo}`;
        notasMap[key] = nota;
        calificacionesMap[nota.alumnoId] = nota.calificacion.toString();
      });
      setNotas(notasMap);
      setCalificaciones(calificacionesMap);

      // Establecer período actual si hay notas
      if (notasData.length > 0) {
        setPeriodo(notasData[0].periodo);
      } else {
        // Generar período actual (año-semestre)
        const now = new Date();
        const year = now.getFullYear();
        const semester = now.getMonth() < 6 ? 1 : 2;
        setPeriodo(`${year}-${semester}`);
      }
    } catch (error) {
      console.error("Error al cargar datos:", error);
      setError("Error al cargar datos");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNota = async (alumnoId: string, calificacion: number) => {
    if (!periodo) {
      setError("Debe seleccionar un período");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const response = await fetch("/api/notas", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          alumnoId,
          materiaId,
          calificacion,
          periodo,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.error || "Error al guardar nota");
        setSaving(false);
        return;
      }

      // Actualizar notas localmente
      const notaData = await response.json();
      const key = `${alumnoId}-${periodo}`;
      setNotas((prev) => ({
        ...prev,
        [key]: notaData,
      }));
      setCalificaciones((prev) => ({
        ...prev,
        [alumnoId]: calificacion.toString(),
      }));

      setSaving(false);
    } catch (err) {
      setError("Error al guardar nota");
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Cargando...</div>;
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold tracking-tight mb-6">Cargar Notas</h1>

        {error && (
          <div className="bg-destructive/15 border border-destructive text-destructive px-4 py-3 rounded mb-4 text-sm">
            {error}
          </div>
        )}

        <div className="bg-card border shadow-sm rounded-lg p-6 mb-6">
          <div className="max-w-xs">
            <label className="block text-sm font-medium mb-2">
              Período Escolar
            </label>
            <input
              type="text"
              value={periodo}
              onChange={(e) => setPeriodo(e.target.value)}
              placeholder="Ej: 2024-1"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
        </div>

        <div className="bg-card border shadow-sm overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-border">
            {alumnos.length === 0 ? (
              <li className="px-6 py-4 text-center text-muted-foreground">
                No hay alumnos inscritos en este curso
              </li>
            ) : (
              alumnos.map((alumno) => {
                const key = `${alumno.id}-${periodo}`;
                const nota = notas[key];
                const calificacion = calificaciones[alumno.id] || nota?.calificacion.toString() || "";

                return (
                  <li key={alumno.id} className="px-6 py-4 hover:bg-muted/30 transition-colors">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-foreground">
                          {alumno.nombre} {alumno.apellido}
                        </p>
                        {alumno.cedula && (
                          <p className="text-xs text-muted-foreground font-mono">
                            ID: {alumno.cedula}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            step="0.01"
                            value={calificacion}
                            onChange={(e) =>
                              setCalificaciones((prev) => ({
                                ...prev,
                                [alumno.id]: e.target.value,
                              }))
                            }
                            className="w-24 flex h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                            placeholder="0-100"
                          />
                          <Button
                            onClick={() =>
                              handleSaveNota(
                                alumno.id,
                                parseFloat(calificacion) || 0
                              )
                            }
                            disabled={saving || !calificacion}
                          >
                            Guardar
                          </Button>
                        </div>
                        {nota && (
                          <span className="text-[10px] font-bold uppercase tracking-widest text-primary">
                            Guardado
                          </span>
                        )}
                      </div>
                    </div>
                  </li>
                );
              })
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}

