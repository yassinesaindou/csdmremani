/* eslint-disable react/no-unescaped-entities */
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Edit, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { ROLE_LABELS } from "../types";

interface EditProfileModalProps {
  user: any;
  onSuccess: () => void;
}

export function EditProfileModal({ user, onSuccess }: EditProfileModalProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    fullName: user.fullName || "",
    phoneNumber: user.phoneNumber || "",
    role: user.role || "",
      branch: user.branch || "",
    email: user.email || "",
  });

  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Non autorisé");

      // Check admin permissions
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("userId", session.user.id)
        .single();

      if (profile?.role !== "admin") {
        throw new Error("Admin requis pour modifier les profils");
      }

      const updates = {
        fullName: formData.fullName.trim() || null,
        phoneNumber: formData.phoneNumber.trim() || null,
        role: formData.role || null,
        branch: formData.branch || null,
        updatedAt: new Date().toISOString(),
      };

      const { error: updateError } = await supabase
        .from("profiles")
        .update(updates)
        .eq("userId", user.userId);

      if (updateError) throw updateError;

      // Update email in auth if provided
      if (formData.email !== user.email && formData.email) {
        const { error: emailError } = await supabase.auth.admin.updateUserById(
          user.userId,
          { email: formData.email }
        );
        
        if (emailError) {
          console.warn("Could not update email:", emailError);
        }
      }

      setOpen(false);
      onSuccess();
      alert("Profil mis à jour avec succès");
      
    } catch (err) {
      console.error("Error updating profile:", err);
      setError(err instanceof Error ? err.message : "Erreur lors de la mise à jour");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
          <Edit className="mr-2 h-4 w-4" />
          Modifier le profil
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Modifier le profil</DialogTitle>
            <DialogDescription>
              Modifiez les informations de l'utilisateur
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            {error && (
              <div className="bg-rose-50 text-rose-700 p-3 rounded-md border border-rose-200 text-sm">
                {error}
              </div>
            )}
            
            <div className="grid gap-3">
              <div className="space-y-2">
                <Label htmlFor="fullName">Nom complet</Label>
                <Input
                  id="fullName"
                  value={formData.fullName}
                  onChange={(e) => handleChange("fullName", e.target.value)}
                  placeholder="Jean Dupont"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">Téléphone</Label>
                  <Input
                    id="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={(e) => handleChange("phoneNumber", e.target.value)}
                    placeholder="+261 XX XX XXX XX"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="role">Rôle</Label>
                  <Select
                    value={formData.role}
                    onValueChange={(value) => handleChange("role", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un rôle" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(ROLE_LABELS).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="branch">Département (affichage)</Label>
                <Input
                  id="branch"
                  value={formData.branch}
                  onChange={(e) => handleChange("branch", e.target.value)}
                  placeholder="Maternité"
                />
                <p className="text-xs text-gray-500">
                  Ce champ est seulement pour l'affichage. Pour assigner des départements, utilisez la section "Affectations Départementales".
                </p>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enregistrement...
                </>
              ) : (
                "Enregistrer les modifications"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}