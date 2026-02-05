/* eslint-disable react/no-unescaped-entities */
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  User, 
  Building, 
  Shield, 
  Key, 
  Save, 
  CheckCircle, 
  AlertCircle,
  Mail,
  Phone
} from "lucide-react";
import { useRouter } from "next/navigation";
import { updateProfile, changePassword, getCurrentUser } from "./actions";

interface UserProfile {
  userId: string;
  fullName: string | null;
  email: string | null;
  phoneNumber: string | null;
  role: string | null;
  isActive: boolean;
}

interface Department {
  departmentId: string;
  departementName: string;
}

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [profileSaving, setProfileSaving] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [userDepartments, setUserDepartments] = useState<Department[]>([]);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  const router = useRouter();

  useEffect(() => {
    loadUserData();
  }, []);

  async function loadUserData() {
    setLoading(true);
    setError(null);

    try {
      const result = await getCurrentUser();
      
      if (!result.success) {
        if (result.error === "Non autorisé") {
          router.push('/login');
          return;
        }
        throw new Error(result.error || "Erreur de chargement");
      }

      if (result.data) {
        setUserProfile(result.data.profile);
        setUserDepartments(result.data.departments);
      }

    } catch (err) {
      console.error("Error loading user data:", err);
      setError("Erreur lors du chargement des données utilisateur");
    } finally {
      setLoading(false);
    }
  }

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userProfile) return;

    setProfileSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const formData = new FormData();
      formData.append("fullName", userProfile.fullName || "");
      formData.append("phoneNumber", userProfile.phoneNumber || "");

      const result = await updateProfile(formData);

      if (result.success) {
        setSuccess(result.message || "Profil mis à jour avec succès");
        // Refresh user data to get updated info
        loadUserData();
      } else {
        setError(result.error || "Erreur lors de la mise à jour");
      }
      
    } catch (err) {
      console.error("Error updating profile:", err);
      setError("Erreur inconnue lors de la mise à jour");
    } finally {
      setProfileSaving(false);
      
      // Clear success message after 3 seconds
      if (success) {
        setTimeout(() => setSuccess(null), 3000);
      }
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError("Les nouveaux mots de passe ne correspondent pas");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setError("Le nouveau mot de passe doit contenir au moins 6 caractères");
      return;
    }

    setPasswordSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const formData = new FormData();
      formData.append("newPassword", passwordData.newPassword);
      formData.append("confirmPassword", passwordData.confirmPassword);

      const result = await changePassword(formData);

      if (result.success) {
        setSuccess(result.message || "Mot de passe changé avec succès");
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: ""
        });
      } else {
        setError(result.error || "Erreur lors du changement de mot de passe");
      }
      
    } catch (err) {
      console.error("Error changing password:", err);
      setError("Erreur inconnue lors du changement de mot de passe");
    } finally {
      setPasswordSaving(false);
      
      // Clear success message after 3 seconds
      if (success) {
        setTimeout(() => setSuccess(null), 3000);
      }
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
          <span className="ml-3 text-gray-600">Chargement de vos informations...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Paramètres</h1>
        <p className="text-gray-600 mt-2">
          Gérez vos informations personnelles et votre compte
        </p>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="mb-6 bg-emerald-50 text-emerald-700 border-emerald-200">
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid grid-cols-2 md:grid-cols-3 w-full max-w-md">
          <TabsTrigger value="profile">
            <User className="mr-2 h-4 w-4" />
            Profil
          </TabsTrigger>
          <TabsTrigger value="security">
            <Key className="mr-2 h-4 w-4" />
            Sécurité
          </TabsTrigger>
          <TabsTrigger value="departments">
            <Building className="mr-2 h-4 w-4" />
            Départements
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Informations Personnelles
              </CardTitle>
              <CardDescription>
                Mettez à jour vos informations de contact
              </CardDescription>
            </CardHeader>
            
            <form onSubmit={handleProfileUpdate}>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Nom complet</Label>
                    <Input
                      id="fullName"
                      value={userProfile?.fullName || ""}
                      onChange={(e) => setUserProfile(prev => 
                        prev ? { ...prev, fullName: e.target.value } : null
                      )}
                      placeholder="Votre nom complet"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="email"
                        value={userProfile?.email || ""}
                        disabled
                        className="bg-gray-50"
                      />
                      <Badge variant="outline" className="whitespace-nowrap">
                        <Mail className="h-3 w-3 mr-1" />
                        Vérifié
                      </Badge>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phoneNumber">Numéro de téléphone</Label>
                    <Input
                      id="phoneNumber"
                      value={userProfile?.phoneNumber || ""}
                      onChange={(e) => setUserProfile(prev => 
                        prev ? { ...prev, phoneNumber: e.target.value } : null
                      )}
                      placeholder="+269 XXX XX XX"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="role">Rôle</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="role"
                        value={userProfile?.role || "Non défini"}
                        disabled
                        className="bg-gray-50"
                      />
                      <Badge 
                        variant={userProfile?.role === 'admin' ? "default" : "outline"}
                        className="whitespace-nowrap"
                      >
                        <Shield className="h-3 w-3 mr-1" />
                        {userProfile?.role === 'admin' ? 'Admin' : 'Utilisateur'}
                      </Badge>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="h-4 w-4 text-emerald-500" />
                    <span className="text-sm font-medium">Statut du compte</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Votre compte est actuellement{" "}
                    <span className={`font-medium ${userProfile?.isActive ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {userProfile?.isActive ? 'actif' : 'inactif'}
                    </span>
                    {" "}et vous {userProfile?.isActive ? 'avez' : "n'avez pas"} accès au système.
                  </p>
                </div>
              </CardContent>

              <CardFooter>
                <Button type="submit" disabled={profileSaving}>
                  <Save className="mr-2 h-4 w-4" />
                  {profileSaving ? "Enregistrement..." : "Enregistrer les modifications"}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                Sécurité du compte
              </CardTitle>
              <CardDescription>
                Changez votre mot de passe pour sécuriser votre compte
              </CardDescription>
            </CardHeader>
            
            <form onSubmit={handlePasswordChange}>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Mot de passe actuel</Label>
                    <Input
                      id="currentPassword"
                      type="password"
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData(prev => ({
                        ...prev,
                        currentPassword: e.target.value
                      }))}
                      placeholder="Entrez votre mot de passe actuel"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="newPassword">Nouveau mot de passe</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData(prev => ({
                        ...prev,
                        newPassword: e.target.value
                      }))}
                      placeholder="Au moins 6 caractères"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirmer le nouveau mot de passe</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData(prev => ({
                        ...prev,
                        confirmPassword: e.target.value
                      }))}
                      placeholder="Répétez le nouveau mot de passe"
                      required
                    />
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                  <h4 className="text-sm font-medium text-blue-800 mb-2 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    Conseils de sécurité
                  </h4>
                  <ul className="text-sm text-blue-600 space-y-1 pl-4">
                    <li className="list-disc">Utilisez au moins 6 caractères</li>
                    <li className="list-disc">Combinez lettres, chiffres et symboles</li>
                    <li className="list-disc">Évitez les mots de passe courants</li>
                    <li className="list-disc">Ne réutilisez pas d'anciens mots de passe</li>
                  </ul>
                </div>
              </CardContent>

              <CardFooter>
                <Button type="submit" disabled={passwordSaving}>
                  <Key className="mr-2 h-4 w-4" />
                  {passwordSaving ? "Changement en cours..." : "Changer le mot de passe"}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>

        {/* Departments Tab */}
        <TabsContent value="departments">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Départements
              </CardTitle>
              <CardDescription>
                {userProfile?.role === 'admin' 
                  ? "En tant qu'administrateur, vous avez accès à tous les départements"
                  : "Départements auxquels vous avez accès"
                }
              </CardDescription>
            </CardHeader>

            <CardContent>
              {userProfile?.role === 'admin' ? (
                <div className="bg-emerald-50 p-6 rounded-lg border border-emerald-100 text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-emerald-100 rounded-full mb-4">
                    <Shield className="h-6 w-6 text-emerald-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-emerald-800 mb-2">
                    Accès Administrateur Complet
                  </h3>
                  <p className="text-emerald-600">
                    Vous avez accès à tous les départements et fonctionnalités du système.
                  </p>
                  <p className="text-sm text-emerald-500 mt-2">
                    Pour gérer les permissions des autres utilisateurs, utilisez la section Administration.
                  </p>
                </div>
              ) : userDepartments.length > 0 ? (
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 mb-4">
                      Vous avez accès à <span className="font-semibold">{userDepartments.length}</span> département(s).
                      Pour modifier vos départements, contactez votre administrateur.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {userDepartments.map((dept) => (
                      <div 
                        key={dept.departmentId}
                        className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Building className="h-4 w-4 text-blue-600" />
                          </div>
                          <h3 className="font-medium text-gray-900">
                            {dept.departementName}
                          </h3>
                        </div>
                        <p className="text-sm text-gray-500">
                          Accès complet aux fonctionnalités de ce département
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="bg-amber-50 p-6 rounded-lg border border-amber-100 text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-amber-100 rounded-full mb-4">
                    <AlertCircle className="h-6 w-6 text-amber-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-amber-800 mb-2">
                    Aucun département assigné
                  </h3>
                  <p className="text-amber-600">
                    Vous n'avez actuellement accès à aucun département.
                  </p>
                  <p className="text-sm text-amber-500 mt-2">
                    Contactez votre administrateur pour obtenir les permissions nécessaires.
                  </p>
                </div>
              )}
            </CardContent>

            <CardFooter className="border-t pt-6">
              <div className="text-sm text-gray-500">
                <p>
                  Pour toute question concernant vos permissions, contactez le service informatique.
                </p>
                <p className="mt-1">
                  Email: support@hopital-comores.km • Téléphone: +269 XXX XX XX
                </p>
              </div>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}