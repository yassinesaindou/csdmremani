/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Building, Calendar, Users, X } from "lucide-react";
import { useState } from "react";

interface DepartmentCardProps {
  user: any;
  userDepartments: any[];
  departments: any[];
  isAdmin: boolean;
  onAssignDepartment: (departmentId: string) => void;
  onRemoveAssignment: (assignmentId: string, departmentName: string) => void;
}

export function DepartmentCard({ 
  user, 
  userDepartments, 
  departments, 
  isAdmin, 
  onAssignDepartment, 
  onRemoveAssignment 
}: DepartmentCardProps) {
  const [selectedDept, setSelectedDept] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAssign = async () => {
    if (!selectedDept) {
      alert("Veuillez sélectionner un département");
      return;
    }

    setLoading(true);
    try {
      await onAssignDepartment(selectedDept);
      setSelectedDept("");
    } finally {
      setLoading(false);
    }
  };

  // Filter out already assigned departments
  const availableDepartments = departments.filter(dept => 
    !userDepartments.some(userDept => userDept.departmentId === dept.departmentId)
  );

  return (
    <Card className="border-2 border-blue-100">
      <CardHeader className="pb-4">
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl flex items-center gap-2">
            <Building className="h-5 w-5 text-blue-500" />
            Affectations Départementales
          </CardTitle>
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            {userDepartments.length} affectation(s)
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Current Departments */}
        <div className="space-y-4">
          <div className="flex items-center text-sm text-gray-500">
            <Building className="mr-2 h-4 w-4" />
            Départements assignés
          </div>
          
          {userDepartments.length > 0 ? (
            <div className="space-y-3">
              {userDepartments.map((assignment) => (
                <div 
                  key={assignment.assignmentId}
                  className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200"
                >
                  <div className="flex-1">
                    <div className="font-semibold text-blue-800">
                      {assignment.departments?.departementName || "Département"}
                    </div>
                    <div className="text-sm text-blue-600 mt-1 flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      Affecté le {new Date(assignment.createdAt).toLocaleDateString("fr-FR")}
                    </div>
                  </div>
                  
                  {isAdmin && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onRemoveAssignment(
                        assignment.assignmentId, 
                        assignment.departments?.departementName || "ce département"
                      )}
                      className="text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
              <div className="text-amber-800">Aucun département assigné</div>
            </div>
          )}
        </div>

        {/* Assign New Department */}
        {isAdmin && (
          <div className="space-y-4 pt-4 border-t">
            <div className="flex items-center text-sm text-gray-500">
              <Users className="mr-2 h-4 w-4" />
              Assigner un nouveau département
            </div>
            <div className="flex gap-3">
              <Select value={selectedDept} onValueChange={setSelectedDept}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Sélectionner un département" />
                </SelectTrigger>
                <SelectContent>
                  {availableDepartments.length > 0 ? (
                    availableDepartments.map((dept) => (
                      <SelectItem key={dept.departmentId} value={dept.departmentId}>
                        {dept.departementName}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="" disabled>
                      Tous les départements sont assignés
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
              <Button 
                onClick={handleAssign}
                disabled={loading || !selectedDept}
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                {loading ? "..." : "Ajouter"}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}