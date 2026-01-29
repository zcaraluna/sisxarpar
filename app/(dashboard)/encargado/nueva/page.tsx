"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";
import DireccionSelect from "@/components/forms/DireccionSelect";

interface Escuela {
  id: string;
  nombre: string;
  codigo: string;
}

interface Curso {
  id: string;
  nombre: string;
  codigo: string;
  costo: number;
  escuelaId: string;
}

export default function NuevaInscripcionPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [escuelas, setEscuelas] = useState<Escuela[]>([]);
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    email: "",
    cedula: "",
    telefono: "",
    direccion: {
      departamento: "" as string | undefined,
      ciudad: "" as string | undefined,
      barrio: "" as string | undefined,
    },
    escuelaId: "",
    cursoId: "",
    observaciones: "",
  });

  useEffect(() => {
    fetchEscuelas();
  }, []);

  useEffect(() => {
    if (formData.escuelaId) {
      fetchCursos(formData.escuelaId);
    } else {
      setCursos([]);
      setFormData((prev) => ({ ...prev, cursoId: "" }));
    }
  }, [formData.escuelaId]);

  const fetchEscuelas = async () => {
    try {
      const response = await fetch("/api/escuelas");
      const data = await response.json();
      setEscuelas(data);
    } catch (error) {
      console.error("Error al cargar escuelas:", error);
    }
  };

  const fetchCursos = async (escuelaId: string) => {
    try {
      const response = await fetch(`/api/cursos?escuelaId=${escuelaId}`);
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
      const response = await fetch("/api/inscripciones", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nombre: formData.nombre,
          apellido: formData.apellido,
          email: formData.email,
          cedula: formData.cedula || undefined,
          telefono: formData.telefono || undefined,
          direccion: formData.direccion.departamento
            ? `${formData.direccion.departamento}, ${formData.direccion.ciudad || ""}${formData.direccion.barrio ? `, ${formData.direccion.barrio}` : ""}`.trim()
            : undefined,
          cursoId: formData.cursoId,
          observaciones: formData.observaciones || undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.error || "Error al crear inscripción");
        setLoading(false);
        return;
      }

      router.push("/encargado");
    } catch (err) {
      setError("Error al crear inscripción");
      setLoading(false);
    }
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold tracking-tight mb-6">
          Nueva Inscripción
        </h1>

        <form onSubmit={handleSubmit} className="bg-card border shadow-sm rounded-lg p-6 space-y-6">
          {error && (
            <div className="bg-destructive/15 border border-destructive text-destructive px-4 py-3 rounded text-sm">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Nombre"
              value={formData.nombre}
              onChange={(e) =>
                setFormData({ ...formData, nombre: e.target.value })
              }
              required
            />
            <Input
              label="Apellido"
              value={formData.apellido}
              onChange={(e) =>
                setFormData({ ...formData, apellido: e.target.value })
              }
              required
            />
            <Input
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              required
            />
            <Input
              label="Cédula"
              value={formData.cedula}
              onChange={(e) =>
                setFormData({ ...formData, cedula: e.target.value })
              }
            />
            <Input
              label="Teléfono"
              value={formData.telefono}
              onChange={(e) =>
                setFormData({ ...formData, telefono: e.target.value })
              }
            />
          </div>

          <div className="pt-4 border-t border-border">
            <label className="block text-sm font-medium text-foreground mb-4">
              Dirección
            </label>
            <DireccionSelect
              value={{
                departamento: formData.direccion.departamento || undefined,
                ciudad: formData.direccion.ciudad || undefined,
                barrio: formData.direccion.barrio || undefined,
              }}
              onChange={(direccion) =>
                setFormData({
                  ...formData,
                  direccion: {
                    departamento: direccion.departamento || "",
                    ciudad: direccion.ciudad || "",
                    barrio: direccion.barrio || "",
                  },
                })
              }
            />
          </div>

          <div className="pt-4 border-t border-border space-y-6">
            <Select
              label="Escuela"
              value={formData.escuelaId}
              onChange={(e) =>
                setFormData({ ...formData, escuelaId: e.target.value })
              }
              options={[
                { value: "", label: "Seleccione una escuela" },
                ...escuelas.map((escuela) => ({
                  value: escuela.id,
                  label: escuela.nombre,
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
                  label: `${curso.nombre} - G. ${curso.costo.toLocaleString()}`,
                })),
              ]}
              required
              disabled={!formData.escuelaId}
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
              {loading ? "Guardando..." : "Guardar Inscripción"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

