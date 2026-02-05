"use client";

import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

import {
  Activity,
  ActivitySquare,
  Baby,
  BarChart3,
  Bed,
  Building,
  Calendar,
  ChevronDown,
  ChevronRight,
  ClipboardList,
  DollarSign,
  Droplets,
  FileCheck,
  FileText,
  FlaskConical,
  Heart,
  Hospital,
  LayoutDashboard,
  MapPin,
  Microscope,
  Package,
  Pill,
  Scissors,
  Settings as SettingsIcon,
  Shield,
  ShoppingBag,
  Sparkles,
  Stethoscope,
  Syringe,
  Thermometer,
  User,
  UserCog,
  Users,
  Utensils,
  LogOut,
  Receipt
} from "lucide-react";

import { signOut } from "@/app/(auth)/actions/auth";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
  useSidebar,
} from "@/components/ui/sidebar";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

interface Department {
  id: string;
  name: string;
  icon: React.ComponentType<any>;
  items: Array<{
    label: string;
    href: string;
    icon: React.ComponentType<any>;
  }>;
}

export default function HospitalSideBar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userDepartments, setUserDepartments] = useState<string[]>([]);
  const [openDepartments, setOpenDepartments] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  
  const pathname = usePathname();
  const router = useRouter();
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  const supabase = createClient();

  // Load user info and departments
  useEffect(() => {
    async function loadUserInfo() {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        router.push('/login');
        return;
      }

      // Get user role
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("userId", session.user.id)
        .single();

      if (profile) {
        setUserRole(profile.role);
      }

      // Get user departments from department_users table
      const { data: departmentAssignments } = await supabase
        .from("department_users")
        .select(`
          departments (
            departmentId,
            departementName
          )
        `)
        .eq("userId", session.user.id);

      if (departmentAssignments) {
        const deptIds = departmentAssignments
          .map((assignment: any) => assignment.departments?.departmentId)
          .filter(Boolean) as string[];
        setUserDepartments(deptIds);
      }

      setLoading(false);
    }

    loadUserInfo();
  }, [supabase, router]);

  // Auto-open current department
  useEffect(() => {
    const currentPath = pathname;
    
    // Map routes to departments
    const departmentMap: Record<string, string> = {
      '/admin': 'admin',
      '/maternity': 'maternity',
      '/medecine': 'medecine',
      '/pharmacy': 'pharmacy',
      '/laboratory': 'laboratory',
      '/vaccination': 'vaccination',
      '/nutrition': 'nutrition',
      '/operating_room': 'operating_room',
      '/operating-room': 'operating_room',
      '/management': 'management'
    };

    // Find which department this route belongs to
    for (const [route, deptId] of Object.entries(departmentMap)) {
      if (currentPath.startsWith(route)) {
        setOpenDepartments(prev => ({ ...prev, [deptId]: true }));
        break;
      }
    }
  }, [pathname]);

  async function handleLogout() {
    await signOut();
    router.push('/login');
  }

  const toggleDepartment = (departmentId: string) => {
    setOpenDepartments(prev => ({
      ...prev,
      [departmentId]: !prev[departmentId]
    }));
  };

  // Define all departments structure
  const allDepartments: Department[] = [
    {
      id: "admin",
      name: "Administration",
      icon: UserCog,
      items: [
        { label: "Utilisateurs", href: "/admin/users", icon: Users },
       
      ]
    },
    {
      id: "maternity",
      name: "Maternité",
      icon: Baby,
      items: [
        { label: "Consultations", href: "/maternity/consultations", icon: Stethoscope },
        { label: "Hospitalisations", href: "/maternity/hospitalizations", icon: Bed },
        { label: "Accouchements", href: "/maternity/deliveries", icon: Heart },
        { label: "Prénatal", href: "/maternity/prenatal", icon: Calendar },
        { label: "Planning Familial", href: "/maternity/family-planning", icon: Shield },
        { label: "Rendez-vous", href: "/maternity/appointments", icon: MapPin },
      ]
    },
    {
      id: "medecine",
      name: "Médecine",
      icon: Stethoscope,
      items: [
        { label: "Consultations", href: "/medecine/consultations", icon: FileText },
        { label: "Hospitalisations", href: "/medecine/hospitalizations", icon: Bed },
       
      ]
    },
    {
      id: "pharmacy",
      name: "Pharmacie",
      icon: Pill,
      items: [
        { label: "Stock", href: "/pharmacy/stock", icon: Package },
        { label: "Prescriptions", href: "/pharmacy/prescriptions", icon: FileText },
        { label: "Distribution", href: "/pharmacy/distribution", icon: Activity },
        { label: "Commandes", href: "/pharmacy/orders", icon: ShoppingBag },
      ]
    },
    {
      id: "laboratory",
      name: "Laboratoire",
      icon: FlaskConical,
      items: [
        { label: "Analyses", href: "/laboratory/tests", icon: ClipboardList },
        { label: "Résultats", href: "/laboratory/results", icon: FileCheck },
        { label: "Échantillons", href: "/laboratory/samples", icon: Droplets },
        { label: "Microbiologie", href: "/laboratory/microbiology", icon: Microscope },
      ]
    },
    {
      id: "vaccination",
      name: "Vaccination",
      icon: Syringe,
      items: [
        { label: "Enfants", href: "/vaccination/children", icon: Baby },
        { label: "Femmes Enceintes", href: "/vaccination/pregnant", icon: Heart },
        
      ]
    },
    {
      id: "nutrition",
      name: "Nutrition",
      icon: Utensils,
      items: [
        { label: "Évaluations", href: "/nutrition/assessments", icon: ClipboardList },
        { label: "Suivi", href: "/nutrition/follow-up", icon: Activity },
        { label: "Distribution", href: "/nutrition/distribution", icon: ShoppingBag },
        { label: "Éducation", href: "/nutrition/education", icon: FileText },
      ]
    },
    {
      id: "operating_room",
      name: "Bloc Operatoire",
      icon: Hospital,
      items: [
        { label: "Planning", href: "/operating-room/schedule", icon: Calendar },
        { label: "Interventions", href: "/operating-room/procedures", icon: Scissors },
        { label: "Ressources", href: "/operating-room/resources", icon: ShoppingBag },
        { label: "Bloc Opératoire", href: "/operating-room/theater", icon: Thermometer },
      ]
    },
    {
      id: "management",
      name: "Gestion",
      icon: Building,
      items: [
        { label: "Transactions", href: "/management/transactions", icon: DollarSign },
        // { label: "Rapports", href: "/management/reports", icon: FileText },
        // { label: "Statistiques", href: "/management/statistics", icon: BarChart3 },
        // { label: "Inventaire", href: "/management/inventory", icon: ClipboardList },
      ]
    }
  ];

  // Get departments that have been built
  const builtDepartments = ['admin', 'maternity', 'medecine', 'vaccination', 'management'];

  // Filter departments based on user role and departments
  const getUserDepartments = (): Department[] => {
    if (loading) return [];
    
    // Admin can see all built departments
    if (userRole === 'admin') {
      return allDepartments.filter(dept => builtDepartments.includes(dept.id));
    }
    
    // Regular users: show only departments they belong to (that are built)
    return allDepartments.filter(dept => 
      userDepartments.includes(dept.id) && builtDepartments.includes(dept.id)
    );
  };

  const userDepartmentsList = getUserDepartments();

  // Universal items accessible to everyone
  const universalItems = [
    {
      label: "Tableau de Bord",
      href: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      label: "Reçus",
      href: "/receipts",
      icon: Receipt,
    },
    {
      label: "Paramètres",
      href: "/settings",
      icon: SettingsIcon,
    },
  ];

  // Check if a link is active
  const isLinkActive = (href: string) => {
    return pathname === href || pathname.startsWith(href + '/');
  };

  // Check if a department is active
  const isDepartmentActive = (department: Department) => {
    return department.items.some(item => isLinkActive(item.href));
  };

  if (loading) {
    return (
      <Sidebar {...props} className="border-r bg-gray-50">
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
        </div>
      </Sidebar>
    );
  }

  return (
    <Sidebar
      collapsible="icon"
      {...props}
      className="border-r border-gray-200 bg-white shadow-sm"
    >
      {/* HEADER */}
      <SidebarHeader className="px-4 py-4 border-b border-gray-100">
        <div className="flex items-center gap-2 min-h-[40px]">
          {!isCollapsed && (
            <Image 
              src="/shibaruwa.png" 
              alt="Logo Hôpital" 
              width={160} 
              height={40}
              className="max-w-full object-contain"
              priority
            />
          )}
          {isCollapsed && (
            <div className="flex items-center justify-center w-8 h-8">
              <Hospital className="h-6 w-6 text-emerald-600" />
            </div>
          )}
        </div>
      </SidebarHeader>

      {/* MAIN NAVIGATION */}
      <SidebarContent className="flex-1 overflow-y-auto">
        {/* Universal Items */}
        <SidebarGroup className="px-2 py-3">
          <SidebarGroupLabel className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-2">
            {!isCollapsed && "Navigation"}
          </SidebarGroupLabel>
          <SidebarMenu>
            {universalItems.map((item) => {
              const Icon = item.icon;
              const isActive = isLinkActive(item.href);
              
              return (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={isActive}
                    tooltip={item.label}
                    className={cn(
                      "px-2 py-2 my-0.5 rounded-md",
                      isActive && "bg-emerald-50 text-emerald-700 border border-emerald-100"
                    )}
                  >
                    <Link href={item.href} prefetch={false}>
                      <Icon size={18} className={cn(isActive && "text-emerald-600")} />
                      {!isCollapsed && (
                        <span className="font-medium">{item.label}</span>
                      )}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>

        {/* User's Departments */}
        {userDepartmentsList.length > 0 && (
          <SidebarGroup className="px-2 py-3">
            <SidebarGroupLabel className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-2">
              {!isCollapsed && "Départements"}
            </SidebarGroupLabel>
            
            {userDepartmentsList.map((department) => {
              const Icon = department.icon;
              const isOpen = openDepartments[department.id] || false;
              const isActive = isDepartmentActive(department);
              
              // Collapsed view: show department icon only
              if (isCollapsed) {
                return (
                  <SidebarMenu key={department.id} className="my-0.5">
                    <SidebarMenuItem>
                      <SidebarMenuButton 
                        asChild
                        tooltip={department.name}
                        isActive={isActive}
                        className={cn(
                          "px-2 py-2",
                          isActive && "bg-emerald-50 text-emerald-700"
                        )}
                      >
                        <Link href={department.items[0]?.href || "#"} prefetch={false}>
                          <Icon size={18} className={cn(isActive && "text-emerald-600")} />
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </SidebarMenu>
                );
              }

              // Expanded view with collapsible
              return (
                <Collapsible
                  key={department.id}
                  open={isOpen}
                  onOpenChange={() => toggleDepartment(department.id)}
                  className="mb-1"
                >
                  <SidebarGroupLabel 
                    asChild
                    className={cn(
                      "cursor-pointer hover:bg-gray-50 rounded-md px-2 py-2 my-0.5 transition-colors",
                      isActive && "bg-emerald-50 text-emerald-700 border border-emerald-100"
                    )}
                  >
                    <CollapsibleTrigger className="w-full flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Icon size={18} className={cn(isActive && "text-emerald-600")} />
                        <span className="font-medium text-sm">{department.name}</span>
                      </div>
                      {isOpen ? (
                        <ChevronDown className="h-4 w-4 text-gray-400" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-gray-400" />
                      )}
                    </CollapsibleTrigger>
                  </SidebarGroupLabel>
                  
                  <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
                    <SidebarGroupContent>
                      <SidebarMenu>
                        {department.items.map((item) => {
                          const ItemIcon = item.icon;
                          const isActiveItem = isLinkActive(item.href);
                          
                          return (
                            <SidebarMenuItem key={item.href}>
                              <SidebarMenuButton 
                                asChild 
                                isActive={isActiveItem}
                                className={cn(
                                  "pl-6 pr-2 py-2 my-0.5 text-sm",
                                  isActiveItem && "bg-emerald-50 text-emerald-700"
                                )}
                              >
                                <Link href={item.href} prefetch={false}>
                                  <ItemIcon size={16} className={cn(isActiveItem && "text-emerald-600")} />
                                  <span>{item.label}</span>
                                </Link>
                              </SidebarMenuButton>
                            </SidebarMenuItem>
                          );
                        })}
                      </SidebarMenu>
                    </SidebarGroupContent>
                  </CollapsibleContent>
                </Collapsible>
              );
            })}
          </SidebarGroup>
        )}

        {/* Coming Soon Departments (only for admins when expanded) */}
        {!isCollapsed && userRole === 'admin' && (
          <SidebarGroup className="px-2 py-3 border-t border-gray-100 mt-4">
            <SidebarGroupLabel className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-2 mb-2">
              À venir
            </SidebarGroupLabel>
            <SidebarMenu>
              {allDepartments
                .filter(dept => !builtDepartments.includes(dept.id))
                .map((department) => {
                  const Icon = department.icon;
                  return (
                    <SidebarMenuItem key={department.id}>
                      <SidebarMenuButton 
                        disabled
                        className="opacity-50 cursor-not-allowed px-2 py-2"
                      >
                        <Icon size={18} />
                        <span className="font-medium text-sm">{department.name}</span>
                        <Sparkles size={12} className="ml-auto text-amber-500" />
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
            </SidebarMenu>
          </SidebarGroup>
        )}
      </SidebarContent>

      {/* FOOTER */}
      <SidebarFooter className="p-4 border-t border-gray-100 bg-gray-50">
        <div className={cn("space-y-3", isCollapsed && "flex flex-col items-center")}>
          {!isCollapsed && (
            <div className="text-xs text-gray-600 space-y-1">
              <p className="font-medium text-gray-700">Hôpital des Comores</p>
              <p className="text-gray-500">
                {userRole === 'admin' 
                  ? "Administrateur Système" 
                  : userDepartmentsList.length > 0 
                    ? `${userDepartmentsList.length} département(s)` 
                    : "Utilisateur"
                }
              </p>
            </div>
          )}
          
          <Button
            onClick={handleLogout}
            variant="outline"
            size={isCollapsed ? "icon" : "sm"}
            className={cn(
              "w-full border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700",
              isCollapsed && "h-8 w-8"
            )}
          >
            {isCollapsed ? (
              <LogOut size={16} />
            ) : (
              <>
                <LogOut size={16} className="mr-2" />
                Déconnexion
              </>
            )}
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}