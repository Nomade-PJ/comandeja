import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { useState } from "react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Calendar, TrendingUp, Users, Package, Loader2 } from "lucide-react";
import ExportReportModal from "@/components/dashboard/modals/ExportReportModal";
import { useReports, ReportPeriod } from "@/hooks/useReports";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SalesReportDetail from "@/components/dashboard/reports/SalesReportDetail";
import ProductsReportDetail from "@/components/dashboard/reports/ProductsReportDetail";
import CustomersReportDetail from "@/components/dashboard/reports/CustomersReportDetail";
import { Skeleton } from "@/components/ui/skeleton";

const DashboardReports = () => {
  const [showExportModal, setShowExportModal] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("sales");
  const [reportPeriod, setReportPeriod] = useState<ReportPeriod>("month");
  const { reportData, loading } = useReports(reportPeriod);

  const handleViewDetails = (reportType: string) => {
    setActiveTab(reportType);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Relatórios</h2>
            <p className="text-muted-foreground">
              Análises detalhadas do seu restaurante
            </p>
          </div>
          <Button 
            className="bg-gradient-brand hover:from-brand-700 hover:to-brand-600 text-white"
            onClick={() => setShowExportModal(true)}
          >
            <Download className="w-4 h-4 mr-2" />
            Exportar Relatório
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            // Skeleton cards para carregamento
            <>
              {[...Array(3)].map((_, index) => (
                <Card key={index}>
                  <CardHeader>
                    <Skeleton className="h-6 w-40 mb-2" />
                    <Skeleton className="h-4 w-60" />
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <Skeleton className="h-8 w-20" />
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-10 w-full" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </>
          ) : (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <TrendingUp className="w-5 h-5 mr-2" />
                    Vendas
                  </CardTitle>
                  <CardDescription>Relatório de vendas por período</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="text-2xl font-bold">{reportData.salesReport.formattedTotalSales}</div>
                    <p className="text-xs text-muted-foreground">Total de vendas • {reportData.salesReport.period}</p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={() => handleViewDetails("sales")}
                    >
                      Ver Detalhes
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <Package className="w-5 h-5 mr-2" />
                    Produtos
                  </CardTitle>
                  <CardDescription>Produtos mais vendidos</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="text-2xl font-bold">{reportData.productsReport.totalProductsSold}</div>
                    <p className="text-xs text-muted-foreground">Produtos vendidos • {reportData.salesReport.period}</p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={() => handleViewDetails("products")}
                    >
                      Ver Detalhes
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <Users className="w-5 h-5 mr-2" />
                    Clientes
                  </CardTitle>
                  <CardDescription>Análise de clientes</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="text-2xl font-bold">{reportData.customersReport.totalCustomers}</div>
                    <p className="text-xs text-muted-foreground">Clientes ativos • {reportData.customersReport.newCustomers} novos</p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={() => handleViewDetails("customers")}
                    >
                      Ver Detalhes
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Relatórios Detalhados</CardTitle>
                <CardDescription>
                  Informações detalhadas para análise do negócio
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline"
                  size="sm"
                  className={reportPeriod === "month" ? "bg-brand-50 border-brand-200 text-brand-700" : ""}
                  onClick={() => setReportPeriod("month")}
                >
                  Mês Atual
                </Button>
                <Button 
                  variant="outline"
                  size="sm"
                  className={reportPeriod === "week" ? "bg-brand-50 border-brand-200 text-brand-700" : ""}
                  onClick={() => setReportPeriod("week")}
                >
                  Última Semana
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center p-12">
                <Loader2 className="w-16 h-16 text-gray-300 animate-spin" />
                <p className="ml-4 text-lg text-gray-500">Carregando relatórios...</p>
              </div>
            ) : reportData.salesReport.totalOrders > 0 ? (
              <Tabs defaultValue="sales" value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="mb-4">
                  <TabsTrigger value="sales">Vendas</TabsTrigger>
                  <TabsTrigger value="products">Produtos</TabsTrigger>
                  <TabsTrigger value="customers">Clientes</TabsTrigger>
                </TabsList>
                <TabsContent value="sales">
                  <SalesReportDetail data={reportData.salesReport} />
                </TabsContent>
                <TabsContent value="products">
                  <ProductsReportDetail data={reportData.productsReport} />
                </TabsContent>
                <TabsContent value="customers">
                  <CustomersReportDetail data={reportData.customersReport} />
                </TabsContent>
              </Tabs>
            ) : (
              <div className="text-center py-12">
                <TrendingUp className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">Nenhum dado para relatório</p>
                <p className="text-gray-400 text-sm mt-2">Os relatórios aparecerão quando houver vendas</p>
                <Button 
                  className="mt-4 bg-gradient-brand hover:from-brand-700 hover:to-brand-600 text-white"
                  onClick={() => setShowExportModal(true)}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Gerar Primeiro Relatório
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <ExportReportModal 
        open={showExportModal} 
        onOpenChange={setShowExportModal} 
      />
    </DashboardLayout>
  );
};

export default DashboardReports;
