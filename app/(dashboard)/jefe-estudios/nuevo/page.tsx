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
        <h1 className="text-3xl font-bold tracking-tight mb-6">
          Nuevo Certificado
        </h1>

        <form onSubmit={handleSubmit} className="bg-card border shadow-sm rounded-lg p-6 space-y-6">
          {error && (
            <div className="bg-destructive/15 border border-destructive text-destructive px-4 py-3 rounded text-sm">
              {error}
            </div>
          )}

          <div className="space-y-6">
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
          </div>

          <div className="pt-4 border-t border-border">
            <label className="block text-sm font-medium text-foreground mb-2">
              Observaciones
            </label>
            <textarea
              value={formData.observaciones}
              onChange={(e) =>
                setFormData({ ...formData, observaciones: e.target.value })
              }
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              rows={3}
              placeholder="Notas adicionales..."
            />
          </div>

          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
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

