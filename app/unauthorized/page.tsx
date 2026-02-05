/* eslint-disable react/no-unescaped-entities */
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldAlert, Home, ArrowLeft, Key } from "lucide-react";
import { useRouter } from "next/navigation";

export default function UnauthorizedPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg border-blue-200">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <ShieldAlert className="h-8 w-8 text-blue-600" />
          </div>
          <CardTitle className="text-2xl text-blue-700">
            Accès Non Autorisé
          </CardTitle>
          <CardDescription className="text-gray-600">
            Vous n'avez pas les permissions nécessaires pour accéder à cette ressource
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-blue-700 text-sm">
              L'accès à cette page est restreint. Ceci peut être dû à :
            </p>
            <ul className="mt-2 text-sm text-blue-600 space-y-1 pl-4">
              <li className="list-disc">Permissions insuffisantes pour votre rôle</li>
              <li className="list-disc">Département non autorisé</li>
              <li className="list-disc">Accès restreint à certaines fonctionnalités</li>
              <li className="list-disc">Session expirée ou invalide</li>
            </ul>
          </div>

          <div className="text-center">
            <div className="inline-flex items-center justify-center p-3 bg-indigo-100 rounded-full mb-3">
              <Key className="h-6 w-6 text-indigo-600" />
            </div>
            <p className="text-sm text-gray-600">
              Si vous pensez que c'est une erreur, veuillez contacter votre administrateur système
              ou le responsable de votre département pour demander les permissions nécessaires.
            </p>
          </div>

          <div className="text-center text-sm text-gray-500">
            <p>
              <strong>Service Informatique - Hôpital des Comores</strong><br />
              Email: support@hopital-comores.km<br />
              Extension: 123
            </p>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col space-y-3">
          <div className="grid grid-cols-2 gap-3 w-full">
            <Button
              onClick={() => router.push('/')}
              variant="default"
              className="w-full"
            >
              <Home className="mr-2 h-4 w-4" />
              Tableau de bord
            </Button>
            <Button
              onClick={() => router.back()}
              variant="outline"
              className="w-full"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour
            </Button>
          </div>

          <Button
            onClick={() => router.push('/login')}
            variant="ghost"
            className="w-full text-gray-500"
          >
            Se reconnecter avec un autre compte
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}