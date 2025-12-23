"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Select from "@/components/ui/Select";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

interface Alumno {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
}

interface Curso {
  id: string;
  nombre: string;
  escuela: {
    nombre: string;
  };
}

export default function NuevoCertificadoPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [alumnos, setAlumnos] = useState<Alumno[]>([]);
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [formData, setFormData] = useState({
    alumnoId: "",
    cursoId: "",
    fechaFinalizacion: "",
    observaciones: "",
  });

  useEffect(() => {
    fetchAlumnos();
    fetchCursos();
  }, []);

  const fetchAlumnos = async () => {
    try {
      const response = await fetch("/api/usuarios?rol=ALUMNO");
      const data = await response.json();
      setAlumnos(data);
    } catch (error) {
      console.error("Error al cargar alumnos:", error);
    }
  };

  const fetchCursos = async () => {
    try {
      const response = await fetch("/api/cursos");
      const data = await response.json();
      setCursos(data);
    } catch (error) {
      console.error("Error al cargar cursos:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/certificados", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          alumnoId: formData.alumnoId,
          cursoId: formData.cursoId,
          fechaFinalizacion: formData.fechaFinalizacion,
          observaciones: formData.observaciones || undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.error || "Error al crear certificado");
        setLoading(false);
        return;
      }

      router.push("/jefe-estudios");
    } catch (err) {
      setError("Error al crear certificado");
      setLoading(false);
    }
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-navy-900 mb-6">
          Nuevo Certificado
        </h1>

        <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <Select
            label="Alumno"
            value={formData.alumnoId}
            onChange={(e) =>
              setFormData({ ...formData, alumnoId: e.target.value })
            }
            options={[
              { value: "", label: "Seleccione un alumno" },
              ...alumnos.map((alumno) => ({
                value: alumno.id,
                label: `${alumno.nombre} ${alumno.apellido} - ${alumno.email}`,
              })),
            ]}
            required
          />

          <Select
            label="Curso"
            value={formData.cursoId}
            onChange={(e) =>
              setFormData({ ...formData, cursoId: e.target.value })
            }
            options={[
              { value: "", label: "Seleccione un curso" },
              ...cursos.map((curso) => ({
                value: curso.id,
                label: `${curso.escuela.nombre} - ${curso.nombre}`,
              })),
            ]}
            required
          />

          <Input
            label="Fecha de Finalización"
            type="date"
            value={formData.fechaFinalizacion}
            onChange={(e) =>
              setFormData({ ...formData, fechaFinalizacion: e.target.value })
            }
            required
          />

          <div>
            <label className="block text-sm font-medium text-navy-700 mb-2">
              Observaciones
            </label>
            <textarea
              value={formData.observaciones}
              onChange={(e) =>
                setFormData({ ...formData, observaciones: e.target.value })
              }
              className="w-full px-4 py-2 border border-navy-300 rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-transparent text-navy-900 placeholder:text-navy-400"
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => router.back()}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Generando..." : "Generar Certificado"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

