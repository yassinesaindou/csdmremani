"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MaternityAppointment, DB_APPOINTMENT_STATUSES } from "../types";
import { createAppointment, updateAppointment } from "../actions";

interface AppointmentFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointment?: MaternityAppointment | null;
  onSuccess: () => void;
}

// Define a type for form data
interface FormDataState {
  patientName: string;
  patientPhoneNumber: string;
  patientAddress: string;
  appointmentReason: string;
  appointmentDate: string;
  appointmentTime: string;
  status: 'scheduled' | 'completed' | 'cancelled';
}

export function AppointmentFormModal({
  open,
  onOpenChange,
  appointment,
  onSuccess,
}: AppointmentFormModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormDataState>({
    patientName: "",
    patientPhoneNumber: "",
    patientAddress: "",
    appointmentReason: "",
    appointmentDate: "",
    appointmentTime: "",
    status: "scheduled",
  });

  // Helper function to convert UTC date to Comoros time (GMT+3)
  const convertUTCToComorosTime = (utcDate: Date): Date => {
    // Create a new date object
    const comorosDate = new Date(utcDate);
    // Add 3 hours to convert from UTC to Comoros time
    comorosDate.setHours(comorosDate.getHours() + 3);
    return comorosDate;
  };

  // Helper function to convert Comoros time to UTC
  const convertComorosTimeToUTC = (comorosDate: Date): Date => {
    // Create a new date object
    const utcDate = new Date(comorosDate);
    // Subtract 3 hours to convert from Comoros time to UTC
    utcDate.setHours(utcDate.getHours() - 3);
    return utcDate;
  };

  // Initialize form when appointment changes
  useEffect(() => {
    if (appointment) {
      let appointmentDate: Date;
      
      if (appointment.appointmentDate) {
        // Convert stored UTC date to Comoros time for display
        const utcDate = new Date(appointment.appointmentDate);
        appointmentDate = convertUTCToComorosTime(utcDate);
      } else {
        appointmentDate = new Date();
      }
      
      setFormData({
        patientName: appointment.patientName || "",
        patientPhoneNumber: appointment.patientPhoneNumber || "",
        patientAddress: appointment.patientAddress || "",
        appointmentReason: appointment.appointmentReason || "",
        appointmentDate: formatDateForInput(appointmentDate),
        appointmentTime: formatTimeForInput(appointmentDate),
        status: appointment.status || "scheduled",
      });
    } else {
      // Set default date/time to tomorrow at 9:00 AM Comoros time
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(9, 0, 0, 0); // 9:00 AM Comoros time
      
      setFormData({
        patientName: "",
        patientPhoneNumber: "",
        patientAddress: "",
        appointmentReason: "",
        appointmentDate: formatDateForInput(tomorrow),
        appointmentTime: formatTimeForInput(tomorrow),
        status: "scheduled",
      });
    }
    setError(null);
  }, [appointment, open]);

  const formatDateForInput = (date: Date): string => {
    // Format as YYYY-MM-DD (local timezone)
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const formatTimeForInput = (date: Date): string => {
    // Format as HH:mm (local timezone)
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Combine date and time in Comoros timezone
      const [year, month, day] = formData.appointmentDate.split('-').map(Number);
      const [hours, minutes] = formData.appointmentTime.split(':').map(Number);
      
      // Create date in Comoros timezone (GMT+3)
      const comorosDate = new Date(year, month - 1, day, hours, minutes, 0);
      
      // Convert to UTC for storage
      const utcDate = convertComorosTimeToUTC(comorosDate);
      
      console.log("Date sélectionnée (Comoros GMT+3):", comorosDate.toISOString());
      console.log("Date stockée (UTC):", utcDate.toISOString());
      console.log("Heure Comoros:", `${hours}:${minutes}`);
      console.log("Heure UTC:", utcDate.getHours() + ":" + utcDate.getMinutes());

      const appointmentDateTime = utcDate.toISOString();

      console.log("Soumission du formulaire avec les données:", {
        ...formData,
        appointmentDateTime
      });

      let result;
      if (appointment) {
        result = await updateAppointment(appointment.appointmentId, {
          patientName: formData.patientName,
          patientPhoneNumber: formData.patientPhoneNumber,
          patientAddress: formData.patientAddress,
          appointmentReason: formData.appointmentReason,
          appointmentDate: appointmentDateTime,
          status: formData.status,
        });
      } else {
        result = await createAppointment({
          patientName: formData.patientName,
          patientPhoneNumber: formData.patientPhoneNumber,
          patientAddress: formData.patientAddress,
          appointmentReason: formData.appointmentReason,
          appointmentDate: appointmentDateTime,
          status: formData.status,
        });
      }

      console.log("Résultat de l'action serveur:", result);

      if (result.success) {
        onOpenChange(false);
        onSuccess();
      } else {
        setError(result.error || "Erreur lors de l'opération");
      }
    } catch (err) {
      console.error("Erreur de soumission du formulaire:", err);
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof FormDataState, value: string) => {
    setFormData(prev => ({ 
      ...prev, 
      [field]: value 
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {appointment ? "Modifier Rendez-vous" : "Nouveau Rendez-vous"}
            </DialogTitle>
            <DialogDescription>
              {appointment 
                ? "Modifier les informations du rendez-vous"
                : "Créer un nouveau rendez-vous de maternité"}
            </DialogDescription>
          </DialogHeader>

          {error && (
            <div className="bg-rose-50 text-rose-700 text-sm p-3 rounded-md border border-rose-200">
              {error}
            </div>
          )}

          <div className="space-y-6 py-4">
            {/* Informations du Patient */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Informations du Patient</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="patientName">Nom complet *</Label>
                  <Input
                    id="patientName"
                    value={formData.patientName}
                    onChange={(e) => handleChange("patientName", e.target.value)}
                    placeholder="Nom du patient"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="patientPhoneNumber">Téléphone *</Label>
                  <Input
                    id="patientPhoneNumber"
                    value={formData.patientPhoneNumber}
                    onChange={(e) => handleChange("patientPhoneNumber", e.target.value)}
                    placeholder="+261 XX XX XXX XX"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="patientAddress">Adresse</Label>
                <Textarea
                  id="patientAddress"
                  value={formData.patientAddress}
                  onChange={(e) => handleChange("patientAddress", e.target.value)}
                  placeholder="Adresse complète du patient"
                  rows={2}
                />
              </div>
            </div>

            {/* Détails du Rendez-vous */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Détails du Rendez-vous</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="appointmentDate">Date *</Label>
                  <Input
                    id="appointmentDate"
                    type="date"
                    value={formData.appointmentDate}
                    onChange={(e) => handleChange("appointmentDate", e.target.value)}
                    required
                    min={new Date().toISOString().split('T')[0]}
                  />
                  <p className="text-xs text-gray-500">Heure Comoros (GMT+3)</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="appointmentTime">Heure *</Label>
                  <Input
                    id="appointmentTime"
                    type="time"
                    value={formData.appointmentTime}
                    onChange={(e) => handleChange("appointmentTime", e.target.value)}
                    required
                    step="900" // 15 minute intervals
                  />
                  <p className="text-xs text-gray-500">Format 24h</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Statut</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: 'scheduled' | 'completed' | 'cancelled') => 
                    handleChange("status", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un statut" />
                  </SelectTrigger>
                  <SelectContent>
                    {DB_APPOINTMENT_STATUSES.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${status.color.split(' ')[0]}`} />
                          {status.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="appointmentReason">Motif du rendez-vous</Label>
                <Textarea
                  id="appointmentReason"
                  value={formData.appointmentReason}
                  onChange={(e) => handleChange("appointmentReason", e.target.value)}
                  placeholder="Raison de la consultation, symptômes, suivi..."
                  rows={3}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={loading}>
              {loading 
                ? (appointment ? "Modification..." : "Création...")
                : (appointment ? "Modifier" : "Créer")
              }
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}