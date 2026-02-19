import { useState, useEffect } from "react";
import {
  Settings,
  Clock,
  Calendar,
  Users,
  Wrench,
  Mail,
  ShieldCheck,
  List,
  Plus,
  X,
  Save,
  RefreshCw,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useConfig } from "@/hooks/useConfig";
import type { ConfiguracionClaim } from "@/types/config";

const DAYS = [
  { value: 1, label: "Lun" },
  { value: 2, label: "Mar" },
  { value: 3, label: "Mié" },
  { value: 4, label: "Jue" },
  { value: 5, label: "Vie" },
  { value: 6, label: "Sáb" },
  { value: 7, label: "Dom" },
];

function toTimeInput(time: string): string {
  // Convert "HH:MM:SS" → "HH:MM"
  return time ? time.slice(0, 5) : "";
}

function fromTimeInput(time: string): string {
  // Convert "HH:MM" → "HH:MM:00"
  return time ? `${time}:00` : "";
}

export const ConfiguracionPanel = () => {
  const { config, isLoading, error, refetch, saveConfig, isSaving } =
    useConfig();
  const [form, setForm] = useState<ConfiguracionClaim | null>(null);
  const [newService, setNewService] = useState("");

  // Sync local form whenever data loads / reloads
  useEffect(() => {
    if (config) setForm({ ...config });
  }, [config]);

  if (error) {
    return (
      <Card className="border-0 shadow-sm">
        <CardContent className="py-12">
          <div className="text-center space-y-4">
            <AlertCircle className="h-12 w-12 mx-auto text-destructive opacity-70" />
            <p className="text-destructive font-medium">
              Error al cargar la configuración del sistema
            </p>
            <Button
              onClick={() => refetch()}
              variant="outline"
              className="gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Reintentar
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isLoading || !form) {
    return (
      <div className="space-y-4">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-40 rounded-lg" />
        ))}
      </div>
    );
  }

  // ── helpers ──────────────────────────────────────────────────────────────
  const setField = <K extends keyof ConfiguracionClaim>(
    key: K,
    val: ConfiguracionClaim[K],
  ) => setForm((prev) => (prev ? { ...prev, [key]: val } : prev));

  const toggleDay = (day: number) => {
    const current = form.dias_habilitados;
    setField(
      "dias_habilitados",
      current.includes(day)
        ? current.filter((d) => d !== day)
        : [...current, day].sort((a, b) => a - b),
    );
  };

  const addService = () => {
    const trimmed = newService.trim();
    if (!trimmed || form.servicios_disponibles.includes(trimmed)) return;
    setField("servicios_disponibles", [...form.servicios_disponibles, trimmed]);
    setNewService("");
  };

  const removeService = (svc: string) =>
    setField(
      "servicios_disponibles",
      form.servicios_disponibles.filter((s) => s !== svc),
    );

  const handleSave = () => {
    if (!form) return;
    const payload: ConfiguracionClaim = {
      ...form,
      hora_inicio: fromTimeInput(form.hora_inicio),
      hora_fin: fromTimeInput(form.hora_fin),
    };
    saveConfig(payload);
  };

  // ── UI ───────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Settings className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="font-semibold text-lg">Configuración del Sistema</h2>
            <p className="text-sm text-muted-foreground">
              Ajusta los parámetros operativos de CLAIM S.A.
            </p>
          </div>
        </div>
        <Button onClick={handleSave} disabled={isSaving} className="gap-2">
          {isSaving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          {isSaving ? "Guardando…" : "Guardar Configuración"}
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* ── CAPACIDAD ──────────────────────────────────────────── */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              Capacidad
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label
                  htmlFor="citas-dia"
                  className="text-xs text-muted-foreground"
                >
                  Citas por día
                </Label>
                <Input
                  id="citas-dia"
                  type="number"
                  min={1}
                  value={form.cantidad_citas_por_dia}
                  onChange={(e) =>
                    setField("cantidad_citas_por_dia", Number(e.target.value))
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label
                  htmlFor="citas-hora"
                  className="text-xs text-muted-foreground"
                >
                  Citas por hora
                </Label>
                <Input
                  id="citas-hora"
                  type="number"
                  min={1}
                  value={form.cantidad_citas_por_hora}
                  onChange={(e) =>
                    setField("cantidad_citas_por_hora", Number(e.target.value))
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label
                  htmlFor="duracion"
                  className="text-xs text-muted-foreground"
                >
                  Duración (min)
                </Label>
                <Input
                  id="duracion"
                  type="number"
                  min={5}
                  step={5}
                  value={form.duracion_cita_minutos}
                  onChange={(e) =>
                    setField("duracion_cita_minutos", Number(e.target.value))
                  }
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ── HORARIO ────────────────────────────────────────────── */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              Horario General
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label
                  htmlFor="hora-inicio"
                  className="text-xs text-muted-foreground"
                >
                  Hora de inicio
                </Label>
                <Input
                  id="hora-inicio"
                  type="time"
                  value={toTimeInput(form.hora_inicio)}
                  onChange={(e) => setField("hora_inicio", e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label
                  htmlFor="hora-fin"
                  className="text-xs text-muted-foreground"
                >
                  Hora de fin
                </Label>
                <Input
                  id="hora-fin"
                  type="time"
                  value={toTimeInput(form.hora_fin)}
                  onChange={(e) => setField("hora_fin", e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ── DÍAS HABILITADOS ───────────────────────────────────── */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" />
              Días Habilitados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 flex-wrap">
              {DAYS.map((day) => {
                const active = form.dias_habilitados.includes(day.value);
                return (
                  <button
                    key={day.value}
                    type="button"
                    onClick={() => toggleDay(day.value)}
                    className={`
                      w-12 h-12 rounded-xl text-sm font-semibold border-2 transition-all duration-200
                      ${
                        active
                          ? "bg-primary text-primary-foreground border-primary shadow-sm"
                          : "bg-card text-muted-foreground border-border hover:border-primary/50"
                      }
                    `}
                  >
                    {day.label}
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              {form.dias_habilitados.length === 0
                ? "No hay días habilitados"
                : `${form.dias_habilitados.length} día(s) habilitado(s)`}
            </p>
          </CardContent>
        </Card>

        {/* ── SERVICIOS ──────────────────────────────────────────── */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <List className="h-4 w-4 text-primary" />
              Servicios Disponibles
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-wrap gap-2 min-h-[36px]">
              {form.servicios_disponibles.map((svc) => (
                <Badge
                  key={svc}
                  variant="secondary"
                  className="gap-1.5 pr-1 text-xs font-normal capitalize"
                >
                  {svc}
                  <button
                    type="button"
                    onClick={() => removeService(svc)}
                    className="rounded-full hover:bg-destructive/20 hover:text-destructive transition-colors p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
              {form.servicios_disponibles.length === 0 && (
                <p className="text-xs text-muted-foreground">
                  Sin servicios configurados
                </p>
              )}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Nuevo servicio…"
                value={newService}
                onChange={(e) => setNewService(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addService()}
                className="text-sm h-8"
              />
              <Button
                size="sm"
                variant="outline"
                onClick={addService}
                className="h-8 px-2"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── BOTTOM SECTION: 3-column ───────────────────────────────────────── */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Reglas de Negocio */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-primary" />
              Reglas de Negocio
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label
                htmlFor="max-citas"
                className="text-xs text-muted-foreground"
              >
                Máx. citas por usuario
              </Label>
              <Input
                id="max-citas"
                type="number"
                min={1}
                value={form.max_citas_por_usuario}
                onChange={(e) =>
                  setField("max_citas_por_usuario", Number(e.target.value))
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label
                htmlFor="ventana-meses"
                className="text-xs text-muted-foreground"
              >
                Ventana de anticipación (meses)
              </Label>
              <Input
                id="ventana-meses"
                type="number"
                min={1}
                value={form.ventana_meses_anticipacion}
                onChange={(e) =>
                  setField("ventana_meses_anticipacion", Number(e.target.value))
                }
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Solo mes siguiente</p>
                <p className="text-xs text-muted-foreground">
                  Limitar a mes próximo
                </p>
              </div>
              <Switch
                checked={form.permitir_solo_mes_siguiente}
                onCheckedChange={(v) =>
                  setField("permitir_solo_mes_siguiente", v)
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Reglas Operativas */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Wrench className="h-4 w-4 text-primary" />
              Reglas Operativas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Asignación automática</p>
                <p className="text-xs text-muted-foreground">
                  Asignar hora automáticamente
                </p>
              </div>
              <Switch
                checked={form.asignacion_automatica_hora}
                onCheckedChange={(v) =>
                  setField("asignacion_automatica_hora", v)
                }
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Confirmación explícita</p>
                <p className="text-xs text-muted-foreground">
                  Requiere confirmación del usuario
                </p>
              </div>
              <Switch
                checked={form.requiere_confirmacion_explicita}
                onCheckedChange={(v) =>
                  setField("requiere_confirmacion_explicita", v)
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Email + Sistema */}
        <div className="space-y-6">
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Mail className="h-4 w-4 text-primary" />
                Notificaciones Email
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Al crear cita</p>
                  <p className="text-xs text-muted-foreground">
                    Enviar email en creación
                  </p>
                </div>
                <Switch
                  checked={form.enviar_email_en_creacion}
                  onCheckedChange={(v) =>
                    setField("enviar_email_en_creacion", v)
                  }
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Al modificar cita</p>
                  <p className="text-xs text-muted-foreground">
                    Enviar email en modificación
                  </p>
                </div>
                <Switch
                  checked={form.enviar_email_en_modificacion}
                  onCheckedChange={(v) =>
                    setField("enviar_email_en_modificacion", v)
                  }
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Settings className="h-4 w-4 text-primary" />
                Control del Sistema
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Sistema activo</p>
                  <p className="text-xs text-muted-foreground">
                    Habilitar el sistema de citas
                  </p>
                </div>
                <Switch
                  checked={form.sistema_activo}
                  onCheckedChange={(v) => setField("sistema_activo", v)}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-warning">
                    Modo mantenimiento
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Bloquear acceso temporalmente
                  </p>
                </div>
                <Switch
                  checked={form.modo_mantenimiento}
                  onCheckedChange={(v) => setField("modo_mantenimiento", v)}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
