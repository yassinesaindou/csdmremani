/* eslint-disable react/no-unescaped-entities */
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function DeactivatedPage() {
  const [countdown, setCountdown] = useState(5);
  const router = useRouter();
    const supabase = createClient();
    
      const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };


  useEffect(() => {
    if (countdown === 0) {
      handleLogout();
      return;
    }

    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [countdown]);


  const handleManualLogout = async () => {
    setCountdown(0); // Skip countdown
    await handleLogout();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 to-orange-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg border-rose-200">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mb-4">
            <AlertCircle className="h-8 w-8 text-rose-600" />
          </div>
          <CardTitle className="text-2xl text-rose-700">
            Compte Désactivé
          </CardTitle>
          <CardDescription className="text-gray-600">
            Votre accès au système a été temporairement suspendu
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="bg-rose-50 border border-rose-200 rounded-lg p-4">
            <p className="text-rose-700 text-sm">
              Votre compte a été désactivé par l'administration. 
              Ceci peut être dû à plusieurs raisons :
            </p>
            <ul className="mt-2 text-sm text-rose-600 space-y-1 pl-4">
              <li className="list-disc">Période d'essai expirée</li>
              <li className="list-disc">Compte en attente de vérification</li>
              <li className="list-disc">Suspension administrative</li>
              <li className="list-disc">Changement de département</li>
            </ul>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-center justify-center space-x-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-amber-600">{countdown}</div>
                <div className="text-sm text-amber-500">secondes</div>
              </div>
              <div className="text-amber-600">
                <p className="text-sm">Déconnexion automatique dans</p>
                <p className="text-xs text-amber-500">Vous serez redirigé vers la page de connexion</p>
              </div>
            </div>
          </div>

          <div className="text-center text-sm text-gray-500">
            <p>
              Pour toute question concernant la désactivation de votre compte,
              veuillez contacter l'administration de l'hôpital.
            </p>
            <p className="mt-2">
              Email: admin@hopital-comores.km<br />
              Téléphone: +269 XXX XX XX
            </p>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col space-y-3">
          <Button
            onClick={handleManualLogout}
            variant="destructive"
            className="w-full"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Me déconnecter maintenant
          </Button>
          
          <Button
            onClick={() => router.push('/contact')}
            variant="outline"
            className="w-full"
          >
            Contacter l'administration
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}