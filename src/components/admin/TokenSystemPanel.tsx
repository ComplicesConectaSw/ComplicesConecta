import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/shared/ui/Input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/shared/ui/Modal';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/useToast';
// import { supabase } from "@/integrations/supabase/client"; // No usado actualmente
import { 
  Coins, 
  TrendingUp, 
  Users, 
  Gift,
  ArrowUpRight,
  ArrowDownLeft,
  RefreshCw,
  Plus,
  Minus,
  History,
  Settings,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

interface TokenTransaction {
  id: string;
  user_id: string;
  user_name: string;
  token_type: 'CMPX' | 'GTK';
  amount: number;
  transaction_type: string;
  description: string;
  created_at: string;
  status: 'completed' | 'pending' | 'failed';
}

interface TokenStats {
  totalCMPX: number;
  totalGTK: number;
  circulatingCMPX: number;
  circulatingGTK: number;
  dailyTransactions: number;
  activeUsers: number;
  conversionRate: number;
}

interface UserTokenBalance {
  user_id: string;
  user_name: string;
  cmpx_balance: number;
  gtk_balance: number;
  total_earned: number;
  total_spent: number;
  last_transaction: string;
}

export function TokenSystemPanel() {
  const [transactions, setTransactions] = useState<TokenTransaction[]>([]);
  const [tokenStats, setTokenStats] = useState<TokenStats>({
    totalCMPX: 0,
    totalGTK: 0,
    circulatingCMPX: 0,
    circulatingGTK: 0,
    dailyTransactions: 0,
    activeUsers: 0,
    conversionRate: 0
  });
  const [userBalances, setUserBalances] = useState<UserTokenBalance[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState('');
  const [adjustmentAmount, setAdjustmentAmount] = useState('');
  const [adjustmentReason, setAdjustmentReason] = useState('');
  const [adjustmentType, setAdjustmentType] = useState<'add' | 'subtract'>('add');
  const [tokenType, setTokenType] = useState<'CMPX' | 'GTK'>('CMPX');
  const [showAdjustmentModal, setShowAdjustmentModal] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadTokenData();
    // Auto-refresh cada 30 segundos
    const interval = setInterval(loadTokenData, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadTokenData = async () => {
    setIsLoading(true);
    try {
      // Usar datos mock ya que token_analytics no existe en el esquema actual
      // const { data: tokenData, error } = await supabase
      //   .from('token_analytics')
      //   .select('*')
      //   .order('created_at', { ascending: false })
      //   .limit(100);
      
      // Simular error para usar datos mock
      const error = new Error('token_analytics table does not exist');

      if (error) {
        console.error('Error loading token data:', error);
        generateMockData();
      } else {
        // processRealTokenData(tokenData || []);
        generateMockData(); // Usar mock data siempre por ahora
      }
    } catch (error) {
      console.error('Error loading token data:', error);
      generateMockData();
    } finally {
      setIsLoading(false);
    }
  };

  const generateMockData = () => {
    // Generar datos mock de transacciones
    const mockTransactions: TokenTransaction[] = Array.from({ length: 50 }, (_, i) => ({
      id: `tx-${i + 1}`,
      user_id: `user-${Math.floor(Math.random() * 20) + 1}`,
      user_name: `Usuario ${Math.floor(Math.random() * 20) + 1}`,
      token_type: Math.random() > 0.5 ? 'CMPX' : 'GTK',
      amount: Math.floor(Math.random() * 500) + 10,
      transaction_type: ['earn_daily', 'earn_referral', 'spend_boost', 'spend_premium', 'admin_adjustment'][Math.floor(Math.random() * 5)],
      description: 'Transacción de prueba',
      created_at: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      status: ['completed', 'pending', 'failed'][Math.floor(Math.random() * 3)] as TokenTransaction['status']
    }));

    const mockStats: TokenStats = {
      totalCMPX: 125000,
      totalGTK: 85000,
      circulatingCMPX: 98500,
      circulatingGTK: 72300,
      dailyTransactions: 156,
      activeUsers: 89,
      conversionRate: 1.45
    };

    const mockBalances: UserTokenBalance[] = Array.from({ length: 20 }, (_, i) => ({
      user_id: `user-${i + 1}`,
      user_name: `Usuario ${i + 1}`,
      cmpx_balance: Math.floor(Math.random() * 1000) + 50,
      gtk_balance: Math.floor(Math.random() * 800) + 30,
      total_earned: Math.floor(Math.random() * 2000) + 100,
      total_spent: Math.floor(Math.random() * 1500) + 50,
      last_transaction: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString()
    }));

    setTransactions(mockTransactions);
    setTokenStats(mockStats);
    setUserBalances(mockBalances);
  };

  const _processRealTokenData = (_data: any[]) => {
    // Procesar datos reales cuando estén disponibles
    // Por ahora usar datos mock
    generateMockData();
  };

  const handleTokenAdjustment = async () => {
    if (!selectedUser || !adjustmentAmount || !adjustmentReason) {
      toast({
        title: "Error",
        description: "Todos los campos son requeridos",
        variant: "destructive"
      });
      return;
    }

    const amount = parseFloat(adjustmentAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Error",
        description: "El monto debe ser un número positivo",
        variant: "destructive"
      });
      return;
    }

    try {
      // En una implementación real, esto haría una llamada a la API
      const newTransaction: TokenTransaction = {
        id: `tx-${Date.now()}`,
        user_id: selectedUser,
        user_name: userBalances.find(u => u.user_id === selectedUser)?.user_name || 'Usuario',
        token_type: tokenType,
        amount: adjustmentType === 'subtract' ? -amount : amount,
        transaction_type: 'admin_adjustment',
        description: adjustmentReason,
        created_at: new Date().toISOString(),
        status: 'completed'
      };

      setTransactions(prev => [newTransaction, ...prev]);

      // Actualizar balance del usuario
      setUserBalances(prev => prev.map(user => {
        if (user.user_id === selectedUser) {
          const newBalance = adjustmentType === 'add' 
            ? (tokenType === 'CMPX' ? user.cmpx_balance + amount : user.gtk_balance + amount)
            : (tokenType === 'CMPX' ? user.cmpx_balance - amount : user.gtk_balance - amount);
          
          return {
            ...user,
            [tokenType === 'CMPX' ? 'cmpx_balance' : 'gtk_balance']: Math.max(0, newBalance),
            last_transaction: new Date().toISOString()
          };
        }
        return user;
      }));

      toast({
        title: "Ajuste realizado",
        description: `Se ${adjustmentType === 'add' ? 'agregaron' : 'restaron'} ${amount} ${tokenType} tokens`,
      });

      // Limpiar formulario
      setSelectedUser('');
      setAdjustmentAmount('');
      setAdjustmentReason('');
      setShowAdjustmentModal(false);

    } catch (error) {
      console.error('Error adjusting tokens:', error);
      toast({
        title: "Error",
        description: "No se pudo realizar el ajuste",
        variant: "destructive"
      });
    }
  };

  const getTransactionIcon = (type: string) => {
    if (type.startsWith('earn_')) return <ArrowUpRight className="w-4 h-4 text-green-600" />;
    if (type.startsWith('spend_')) return <ArrowDownLeft className="w-4 h-4 text-red-600" />;
    return <RefreshCw className="w-4 h-4 text-blue-600" />;
  };

  const getStatusBadge = (status: TokenTransaction['status']) => {
    const statusConfig = {
      completed: { label: 'Completada', className: 'bg-green-100 text-green-800' },
      pending: { label: 'Pendiente', className: 'bg-yellow-100 text-yellow-800' },
      failed: { label: 'Fallida', className: 'bg-red-100 text-red-800' }
    };

    const config = statusConfig[status];
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Coins className="w-6 h-6 text-yellow-600" />
            Sistema de Tokens
          </h2>
          <p className="text-gray-600">
            Gestión y análisis del sistema de tokens CMPX y GTK
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Dialog open={showAdjustmentModal} onOpenChange={setShowAdjustmentModal}>
            <DialogTrigger asChild>
              <Button className="bg-yellow-600 hover:bg-yellow-700">
                <Settings className="w-4 h-4 mr-2" />
                Ajustar Tokens
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Ajustar Tokens de Usuario</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Usuario</label>
                  <Select value={selectedUser} onValueChange={setSelectedUser}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar usuario" />
                    </SelectTrigger>
                    <SelectContent>
                      {userBalances.map(user => (
                        <SelectItem key={user.user_id} value={user.user_id}>
                          {user.user_name} (CMPX: {user.cmpx_balance}, GTK: {user.gtk_balance})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Tipo de Token</label>
                    <Select value={tokenType} onValueChange={(value: 'CMPX' | 'GTK') => setTokenType(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CMPX">CMPX</SelectItem>
                        <SelectItem value="GTK">GTK</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Acción</label>
                    <Select value={adjustmentType} onValueChange={(value: 'add' | 'subtract') => setAdjustmentType(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="add">
                          <div className="flex items-center gap-2">
                            <Plus className="w-4 h-4" />
                            Agregar
                          </div>
                        </SelectItem>
                        <SelectItem value="subtract">
                          <div className="flex items-center gap-2">
                            <Minus className="w-4 h-4" />
                            Restar
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Cantidad</label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={adjustmentAmount}
                    onChange={(e) => setAdjustmentAmount(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Razón del ajuste</label>
                  <Textarea
                    placeholder="Describe la razón del ajuste..."
                    value={adjustmentReason}
                    onChange={(e) => setAdjustmentReason(e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button className="border border-white/30 bg-white/10 backdrop-blur-md text-white hover:bg-white/20" onClick={() => setShowAdjustmentModal(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleTokenAdjustment} className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white">
                    Aplicar Ajuste
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Button onClick={loadTokenData} disabled={isLoading} className="border border-white/30 bg-white/10 backdrop-blur-md text-white hover:bg-white/20 disabled:opacity-50">
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
        </div>
      </div>

      {/* Estadísticas principales */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">CMPX Total</CardTitle>
            <Coins className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {tokenStats.totalCMPX.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {tokenStats.circulatingCMPX.toLocaleString()} en circulación
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">GTK Total</CardTitle>
            <Gift className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {tokenStats.totalGTK.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {tokenStats.circulatingGTK.toLocaleString()} en circulación
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Transacciones Hoy</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tokenStats.dailyTransactions}</div>
            <p className="text-xs text-muted-foreground">
              {tokenStats.activeUsers} usuarios activos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasa de Conversión</CardTitle>
            <RefreshCw className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tokenStats.conversionRate}</div>
            <p className="text-xs text-muted-foreground">
              CMPX por GTK
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="transactions" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="transactions">Transacciones</TabsTrigger>
          <TabsTrigger value="balances">Balances</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="transactions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="w-5 h-5" />
                Historial de Transacciones
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-600 mx-auto"></div>
                  <p className="mt-2 text-gray-600">Cargando transacciones...</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {transactions.slice(0, 20).map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {getTransactionIcon(transaction.transaction_type)}
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{transaction.user_name}</span>
                            <Badge className={`border ${
                              transaction.token_type === 'CMPX' ? 'text-yellow-600 border-yellow-200' : 'text-purple-600 border-purple-200'
                            }`}>
                              {transaction.token_type}
                            </Badge>
                          </div>
                          <div className="text-sm text-gray-600">
                            {transaction.description} • {new Date(transaction.created_at).toLocaleDateString()}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <div className={`font-semibold ${
                            transaction.amount > 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {transaction.amount > 0 ? '+' : ''}{transaction.amount}
                          </div>
                          <div className="text-xs text-gray-500 capitalize">
                            {transaction.transaction_type.replace('_', ' ')}
                          </div>
                        </div>
                        {getStatusBadge(transaction.status)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="balances" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Balances de Usuarios
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {userBalances.slice(0, 15).map((user) => (
                  <div key={user.user_id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">{user.user_name}</div>
                      <div className="text-sm text-gray-600">
                        Última transacción: {new Date(user.last_transaction).toLocaleDateString()}
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="flex items-center gap-2">
                          <Badge className="border text-yellow-600 border-yellow-200">
                            CMPX: {user.cmpx_balance}
                          </Badge>
                          <Badge className="border text-purple-600 border-purple-200">
                            GTK: {user.gtk_balance}
                          </Badge>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          Ganado: {user.total_earned} • Gastado: {user.total_spent}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Distribución de Tokens</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>CMPX en Circulación</span>
                      <span>{((tokenStats.circulatingCMPX / tokenStats.totalCMPX) * 100).toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className="bg-yellow-600 h-3 rounded-full" 
                        style={{ width: `${(tokenStats.circulatingCMPX / tokenStats.totalCMPX) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>GTK en Circulación</span>
                      <span>{((tokenStats.circulatingGTK / tokenStats.totalGTK) * 100).toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className="bg-purple-600 h-3 rounded-full" 
                        style={{ width: `${(tokenStats.circulatingGTK / tokenStats.totalGTK) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Actividad Reciente</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Transacciones completadas:</span>
                    <div className="flex items-center gap-1">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="font-semibold">
                        {transactions.filter(t => t.status === 'completed').length}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Transacciones pendientes:</span>
                    <div className="flex items-center gap-1">
                      <AlertCircle className="w-4 h-4 text-yellow-600" />
                      <span className="font-semibold">
                        {transactions.filter(t => t.status === 'pending').length}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Transacciones fallidas:</span>
                    <div className="flex items-center gap-1">
                      <AlertCircle className="w-4 h-4 text-red-600" />
                      <span className="font-semibold">
                        {transactions.filter(t => t.status === 'failed').length}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Estadísticas de Uso</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {transactions.filter(t => t.transaction_type.startsWith('earn_')).length}
                  </div>
                  <p className="text-sm text-gray-600">Tokens Ganados</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {transactions.filter(t => t.transaction_type.startsWith('spend_')).length}
                  </div>
                  <p className="text-sm text-gray-600">Tokens Gastados</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {transactions.filter(t => t.transaction_type === 'admin_adjustment').length}
                  </div>
                  <p className="text-sm text-gray-600">Ajustes Admin</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
