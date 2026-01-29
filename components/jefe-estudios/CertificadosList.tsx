"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Certificado {
  id: string;
  numero: string;
  fechaEmision: string;
  fechaFinalizacion: string;
  promedio: number;
  alumno: {
    nombre: string;
    apellido: string;
    cedula?: string;
  };
  curso: {
    nombre: string;
    escuela: {
      nombre: string;
    };
  };
}

export default function CertificadosList() {
  const [certificados, setCertificados] = useState<Certificado[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCertificados();
  }, []);

  const fetchCertificados = async () => {
    try {
      const response = await fetch("/api/certificados");
      const data = await response.json();
      setCertificados(data);
    } catch (error) {
      console.error("Error al cargar certificados:", error);
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
          {certificados.length === 0 ? (
            <li className="px-6 py-4 text-center text-muted-foreground">
              No hay certificados registrados
            </li>
          ) : (
            certificados.map((certificado) => (
              <li key={certificado.id} className="px-6 py-4 hover:bg-muted/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center">
                      <p className="text-sm font-semibold text-foreground">
                        {certificado.alumno.nombre} {certificado.alumno.apellido}
                      </p>
                    </div>
                    <div className="mt-2 flex items-center text-sm text-muted-foreground">
                      <span>{certificado.curso.escuela.nombre}</span>
                      <span className="mx-2 text-border">•</span>
                      <span>{certificado.curso.nombre}</span>
                      <span className="mx-2 text-border">•</span>
                      <span className="font-medium text-foreground">Promedio: {Number(certificado.promedio).toFixed(2)}</span>
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground/70">
                      Certificado: {certificado.numero}
                    </div>
                  </div>
                  <div className="ml-4">
                    <Link
                      href={`/jefe-estudios/${certificado.id}`}
                      className="text-primary hover:underline text-sm font-medium"
                    >
                      Ver detalles
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

