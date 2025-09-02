import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Gamification } from "@/components/gamification/Gamification";
import { NotificationCenter } from "@/components/notifications/NotificationCenter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, Bell, TrendingUp } from "lucide-react";

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Panel de Control
            <span className="block bg-love-gradient bg-clip-text text-transparent">
              Tu Progreso y Actividad
            </span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Revisa tus logros, notificaciones y estadísticas de progreso
          </p>
        </div>

        <Tabs defaultValue="gamification" className="space-y-8">
          <TabsList className="grid w-full grid-cols-3 bg-muted/50 rounded-2xl p-2 max-w-2xl mx-auto">
            <TabsTrigger value="gamification" className="rounded-xl">
              <Trophy className="h-4 w-4 mr-2" />
              Logros
            </TabsTrigger>
            <TabsTrigger value="notifications" className="rounded-xl">
              <Bell className="h-4 w-4 mr-2" />
              Notificaciones
            </TabsTrigger>
            <TabsTrigger value="analytics" className="rounded-xl">
              <TrendingUp className="h-4 w-4 mr-2" />
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="gamification" className="space-y-6">
            <Gamification />
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <NotificationCenter />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="text-center py-12">
              <TrendingUp className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Analytics Detallados</h3>
              <p className="text-muted-foreground">
                Esta sección mostrará estadísticas avanzadas de tu perfil y actividad
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>
  );
};

export default Dashboard;