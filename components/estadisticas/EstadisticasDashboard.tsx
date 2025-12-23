"use client";

import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import Select from "@/components/ui/Select";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

interface Estadisticas {
  totalIngresos: number;
  totalFacturas: number;
  ingresosPorEscuela: Record<string, number>;
  ingresosPorCurso: Record<string, number>;
  ingresosPorTipo: Record<string, number>;
  ingresosPorFecha: Record<string, number>;
  facturas: any[];
}

export default function EstadisticasDashboard() {
  const [estadisticas, setEstadisticas] = useState<Estadisticas | null>(null);
  const [loading, setLoading] = useState(true);
  const [escuelas, setEscuelas] = useState<any[]>([]);
  const [cursos, setCursos] = useState<any[]>([]);
  const [filtros, setFiltros] = useState({
    fechaInicio: "",
    fechaFin: "",
    escuelaId: "",
    cursoId: "",
    tipoFacturacion: "",
  });

  useEffect(() => {
    fetchEscuelas();
    fetchEstadisticas();
  }, []);

  useEffect(() => {
    if (filtros.escuelaId) {
      fetchCursos(filtros.escuelaId);
    } else {
      setCursos([]);
      setFiltros((prev) => ({ ...prev, cursoId: "" }));
    }
  }, [filtros.escuelaId]);

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

  const fetchEstadisticas = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filtros.fechaInicio) params.append("fechaInicio", filtros.fechaInicio);
      if (filtros.fechaFin) params.append("fechaFin", filtros.fechaFin);
      if (filtros.escuelaId) params.append("escuelaId", filtros.escuelaId);
      if (filtros.cursoId) params.append("cursoId", filtros.cursoId);
      if (filtros.tipoFacturacion)
        params.append("tipoFacturacion", filtros.tipoFacturacion);

      const response = await fetch(`/api/estadisticas/ingresos?${params}`);
      const data = await response.json();
      setEstadisticas(data);
    } catch (error) {
      console.error("Error al cargar estadísticas:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFiltrosChange = (key: string, value: string) => {
    setFiltros((prev) => ({ ...prev, [key]: value }));
  };

  const handleAplicarFiltros = () => {
    fetchEstadisticas();
  };

  const handleExportarPDF = async () => {
    if (!estadisticas) return;
    
    try {
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF();
      
      doc.setFontSize(16);
      doc.text("Reporte de Ingresos - Sis-ARPAR", 14, 20);
      
      doc.setFontSize(12);
      doc.text(`Total de Ingresos: G. ${estadisticas.totalIngresos.toLocaleString()}`, 14, 35);
      doc.text(`Total de Facturas: ${estadisticas.totalFacturas}`, 14, 42);
      
      let yPos = 55;
      doc.setFontSize(10);
      doc.text("Ingresos por Escuela:", 14, yPos);
      yPos += 7;
      
      Object.entries(estadisticas.ingresosPorEscuela).forEach(([escuela, monto]) => {
        doc.text(`${escuela}: G. ${Number(monto).toLocaleString()}`, 20, yPos);
        yPos += 7;
        if (yPos > 280) {
          doc.addPage();
          yPos = 20;
        }
      });
      
      doc.save(`reporte-ingresos-${new Date().toISOString().split("T")[0]}.pdf`);
    } catch (error) {
      console.error("Error al exportar PDF:", error);
      alert("Error al exportar PDF");
    }
  };

  const handleExportarExcel = async () => {
    if (!estadisticas) return;
    
    try {
      const ExcelJS = await import("exceljs");
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Ingresos");
      
      // Encabezados
      worksheet.columns = [
        { header: "Número de Factura", key: "numero", width: 20 },
        { header: "Escuela", key: "escuela", width: 30 },
        { header: "Curso", key: "curso", width: 30 },
        { header: "Monto", key: "monto", width: 15 },
        { header: "Tipo", key: "tipo", width: 15 },
        { header: "Fecha de Pago", key: "fechaPago", width: 20 },
      ];
      
      // Datos
      estadisticas.facturas.forEach((factura) => {
        worksheet.addRow({
          numero: factura.numero,
          escuela: factura.escuela,
          curso: factura.curso,
          monto: factura.monto,
          tipo: factura.tipoFacturacion === "PROPIO" ? "Propio" : "Tercero",
          fechaPago: factura.fechaPago ? new Date(factura.fechaPago).toLocaleDateString() : "",
        });
      });
      
      // Estilo de encabezados
      worksheet.getRow(1).font = { bold: true };
      worksheet.getRow(1).fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF1e3a8a" },
      };
      worksheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
      
      // Resumen
      const summaryRow = estadisticas.facturas.length + 3;
      worksheet.getCell(`A${summaryRow}`).value = "Total:";
      worksheet.getCell(`A${summaryRow}`).font = { bold: true };
      worksheet.getCell(`D${summaryRow}`).value = estadisticas.totalIngresos;
      worksheet.getCell(`D${summaryRow}`).font = { bold: true };
      
      // Generar archivo
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `reporte-ingresos-${new Date().toISOString().split("T")[0]}.xlsx`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error al exportar Excel:", error);
      alert("Error al exportar Excel");
    }
  };

  if (loading) {
    return <div className="text-center py-8">Cargando estadísticas...</div>;
  }

  if (!estadisticas) {
    return <div className="text-center py-8">Error al cargar estadísticas</div>;
  }

  // Preparar datos para gráficos
  const datosPorEscuela = Object.entries(estadisticas.ingresosPorEscuela).map(
    ([name, value]) => ({ name, value: Number(value) })
  );

  const datosPorCurso = Object.entries(estadisticas.ingresosPorCurso).map(
    ([name, value]) => ({ name, value: Number(value) })
  );

  const datosPorTipo = Object.entries(estadisticas.ingresosPorTipo).map(
    ([name, value]) => ({
      name: name === "PROPIO" ? "Propio" : "Tercero",
      value: Number(value),
    })
  );

  const datosPorFecha = Object.entries(estadisticas.ingresosPorFecha)
    .map(([fecha, monto]) => ({
      fecha: new Date(fecha).toLocaleDateString("es-PY", {
        month: "short",
        day: "numeric",
      }),
      monto: Number(monto),
    }))
    .sort((a, b) => a.fecha.localeCompare(b.fecha));

  const COLORS = ["#1e3a8a", "#3b82f6", "#60a5fa", "#93c5fd"];

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-semibold text-navy-900 mb-4">Filtros</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            label="Fecha Inicio"
            type="date"
            value={filtros.fechaInicio}
            onChange={(e) => handleFiltrosChange("fechaInicio", e.target.value)}
          />
          <Input
            label="Fecha Fin"
            type="date"
            value={filtros.fechaFin}
            onChange={(e) => handleFiltrosChange("fechaFin", e.target.value)}
          />
          <Select
            label="Escuela"
            value={filtros.escuelaId}
            onChange={(e) => handleFiltrosChange("escuelaId", e.target.value)}
            options={[
              { value: "", label: "Todas las escuelas" },
              ...escuelas.map((escuela) => ({
                value: escuela.id,
                label: escuela.nombre,
              })),
            ]}
          />
          <Select
            label="Curso"
            value={filtros.cursoId}
            onChange={(e) => handleFiltrosChange("cursoId", e.target.value)}
            options={[
              { value: "", label: "Todos los cursos" },
              ...cursos.map((curso) => ({
                value: curso.id,
                label: curso.nombre,
              })),
            ]}
            disabled={!filtros.escuelaId}
          />
          <Select
            label="Tipo de Facturación"
            value={filtros.tipoFacturacion}
            onChange={(e) =>
              handleFiltrosChange("tipoFacturacion", e.target.value)
            }
            options={[
              { value: "", label: "Todos" },
              { value: "PROPIO", label: "Propio" },
              { value: "TERCERO", label: "Tercero" },
            ]}
          />
          <div className="flex items-end">
            <Button onClick={handleAplicarFiltros} className="w-full">
              Aplicar Filtros
            </Button>
          </div>
        </div>
      </div>

      {/* Resumen */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-semibold text-navy-900 mb-2">
            Total de Ingresos
          </h3>
          <p className="text-3xl font-bold text-navy-700">
            G. {estadisticas.totalIngresos.toLocaleString()}
          </p>
        </div>
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-semibold text-navy-900 mb-2">
            Total de Facturas
          </h3>
          <p className="text-3xl font-bold text-navy-700">
            {estadisticas.totalFacturas}
          </p>
        </div>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-semibold text-navy-900 mb-4">
            Ingresos por Escuela
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={datosPorEscuela}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#1e3a8a" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-semibold text-navy-900 mb-4">
            Ingresos por Tipo
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={datosPorTipo}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) =>
                  `${name} ${(percent * 100).toFixed(0)}%`
                }
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {datosPorTipo.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-semibold text-navy-900 mb-4">
          Tendencia de Ingresos
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={datosPorFecha}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="fecha" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="monto"
              stroke="#1e3a8a"
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Botones de exportación */}
      <div className="flex justify-end space-x-4">
        <Button variant="secondary" onClick={handleExportarPDF}>
          Exportar PDF
        </Button>
        <Button variant="secondary" onClick={handleExportarExcel}>
          Exportar Excel
        </Button>
      </div>
    </div>
  );
}

