import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useState, useEffect } from "react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Plus, Search, Filter, FolderPlus, Edit, Trash2,
  ArrowUp, ArrowDown, GripVertical, Store, Package, ChevronDown, ChevronUp, Eye
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import NewProductModal from "@/components/dashboard/modals/NewProductModal";
import NewCategoryModal from "@/components/dashboard/modals/NewCategoryModal";
import FiltersModal from "@/components/dashboard/modals/FiltersModal";
import { useProducts } from "@/hooks/useProducts";
import { useCategories } from "@/hooks/useCategories";
import EditProductModal from "@/components/dashboard/modals/EditProductModal";
import DeleteProductModal from "@/components/dashboard/modals/DeleteProductModal";
import EditCategoryModal from "@/components/dashboard/modals/EditCategoryModal";
import DeleteCategoryModal from "@/components/dashboard/modals/DeleteCategoryModal";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

// Adicionar a interface Product
interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  image_url?: string;
  is_active: boolean;
  is_featured: boolean;
  preparation_time: number;
  category_id?: string;
  restaurant_id: string;
  created_at: string;
  updated_at: string;
  display_order: number;
}

// Adicionar a interface Category
interface Category {
  id: string;
  name: string;
  description?: string;
  image_url?: string;
  display_order: number;
  is_active: boolean;
  restaurant_id: string;
  created_at: string;
  updated_at: string;
}

const DashboardProducts = () => {
  const [activeTab, setActiveTab] = useState("produtos");
  const [showNewProductModal, setShowNewProductModal] = useState(false);
  const [showNewCategoryModal, setShowNewCategoryModal] = useState(false);
  const [showFiltersModal, setShowFiltersModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showEditProductModal, setShowEditProductModal] = useState(false);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const [showDeleteProductModal, setShowDeleteProductModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [showEditCategoryModal, setShowEditCategoryModal] = useState(false);
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null);
  const [showDeleteCategoryModal, setShowDeleteCategoryModal] = useState(false);
  const [expandedProducts, setExpandedProducts] = useState<{[key: string]: boolean}>({});
  const [expandedCategories, setExpandedCategories] = useState<{[key: string]: boolean}>({});

  const { products, loading: productsLoading } = useProducts();
  const { categories, loading: categoriesLoading, moveCategory, reorderCategories } = useCategories();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setShowEditProductModal(true);
  };

  const handleDeleteProduct = (product: Product) => {
    setDeletingProduct(product);
    setShowDeleteProductModal(true);
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setShowEditCategoryModal(true);
  };

  const handleDeleteCategory = (category: Category) => {
    setDeletingCategory(category);
    setShowDeleteCategoryModal(true);
  };

  const handleMoveCategory = async (id: string, direction: 'up' | 'down') => {
    await moveCategory(id, direction);
  };

  const handleDragEnd = (result: any) => {
    // Ignorar se o item foi solto fora da área ou na mesma posição
    if (!result.destination || result.destination.index === result.source.index) {
      return;
    }

    const draggedItemId = result.draggableId;
    const reorderedIds = Array.from(categories).sort((a, b) => a.display_order - b.display_order).map(cat => cat.id);
    
    // Remove o ID arrastado da sua posição original
    reorderedIds.splice(result.source.index, 1);
    
    // Insere o ID na nova posição
    reorderedIds.splice(result.destination.index, 0, draggedItemId);
    
    // Chama a função para atualizar a ordem no banco de dados
    reorderCategories(reorderedIds);
  };

  const toggleProductDetails = (productId: string) => {
    setExpandedProducts(prev => ({
      ...prev,
      [productId]: !prev[productId]
    }));
  };
  
  const toggleCategoryDetails = (categoryId: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

  if (productsLoading || categoriesLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500">Carregando...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Cardápio</h2>
            <p className="text-sm text-muted-foreground">
              Gerencie os produtos e categorias do seu restaurante
            </p>
          </div>
          <div className="flex items-center gap-2">
            {activeTab === "produtos" ? (
              <Button 
                className="bg-gradient-brand hover:from-brand-700 hover:to-brand-600 text-white text-sm sm:text-base w-full sm:w-auto"
                onClick={() => setShowNewProductModal(true)}
              >
                <Plus className="w-4 h-4 mr-1 sm:mr-2" />
                Novo Produto
              </Button>
            ) : (
              <Button 
                className="bg-gradient-brand hover:from-brand-700 hover:to-brand-600 text-white text-sm sm:text-base w-full sm:w-auto"
                onClick={() => setShowNewCategoryModal(true)}
              >
                <Plus className="w-4 h-4 mr-1 sm:mr-2" />
                Nova Categoria
              </Button>
            )}
          </div>
        </div>

        <Tabs 
          defaultValue="produtos" 
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-4 sm:space-y-6"
        >
          <TabsList className="grid grid-cols-2 w-full sm:w-[400px]">
            <TabsTrigger value="produtos" className="flex items-center gap-1 sm:gap-2 text-sm">
              <Package className="w-3 h-3 sm:w-4 sm:h-4" />
              Produtos
            </TabsTrigger>
            <TabsTrigger value="categorias" className="flex items-center gap-1 sm:gap-2 text-sm">
              <FolderPlus className="w-3 h-3 sm:w-4 sm:h-4" />
              Categorias
            </TabsTrigger>
          </TabsList>

          {/* Tab de Produtos */}
          <TabsContent value="produtos" className="space-y-4 sm:space-y-6">
            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar produtos..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                <Button type="submit" className="flex-1 sm:flex-auto">
                  Buscar
                </Button>
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => setShowFiltersModal(true)}
                  className="flex-1 sm:flex-auto"
                >
                  <Filter className="w-4 h-4 mr-2" />
                  Filtros
                </Button>
              </div>
            </form>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              <Card>
                <CardHeader className="p-3 sm:p-4">
                  <CardTitle className="text-base sm:text-lg">Total de Produtos</CardTitle>
                </CardHeader>
                <CardContent className="p-3 sm:p-4 pt-0">
                  <div className="text-2xl sm:text-3xl font-bold">{products.length}</div>
                  <p className="text-xs text-muted-foreground">produtos cadastrados</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="p-3 sm:p-4">
                  <CardTitle className="text-base sm:text-lg">Produtos Ativos</CardTitle>
                </CardHeader>
                <CardContent className="p-3 sm:p-4 pt-0">
                  <div className="text-2xl sm:text-3xl font-bold">
                    {products.filter(p => p.is_active).length}
                  </div>
                  <p className="text-xs text-muted-foreground">produtos disponíveis</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="p-3 sm:p-4">
                  <CardTitle className="text-base sm:text-lg">Produtos em Destaque</CardTitle>
                </CardHeader>
                <CardContent className="p-3 sm:p-4 pt-0">
                  <div className="text-2xl sm:text-3xl font-bold">
                    {products.filter(p => p.is_featured).length}
                  </div>
                  <p className="text-xs text-muted-foreground">produtos em destaque</p>
                </CardContent>
              </Card>
            </div>

            {filteredProducts.length === 0 ? (
              <div className="text-center py-12">
                <Store className="mx-auto h-12 w-12 text-gray-300" />
                <h3 className="mt-2 text-lg font-medium text-gray-900">Nenhum produto encontrado</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Comece adicionando um novo produto ao seu cardápio.
                </p>
                <div className="mt-6">
                  <Button 
                    onClick={() => setShowNewProductModal(true)}
                    className="bg-gradient-brand hover:from-brand-700 hover:to-brand-600 text-white"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar Produto
                  </Button>
                </div>
              </div>
            ) : (
              <>
                {/* Versão mobile (cards) */}
                <div className="sm:hidden space-y-3 px-1">
                  {filteredProducts.map((product) => {
                    const category = categories.find(c => c.id === product.category_id);
                    const isExpanded = expandedProducts[product.id] || false;
                    
                    return (
                      <Card key={product.id} className="overflow-hidden border shadow-sm">
                        <div className="p-3">
                          <div className="flex items-center gap-3">
                            {product.image_url ? (
                              <div className="h-14 w-14 flex-shrink-0 rounded bg-gray-100">
                                <img 
                                  src={product.image_url} 
                                  alt={product.name}
                                  className="h-14 w-14 object-cover rounded" 
                                />
                              </div>
                            ) : (
                              <div className="h-14 w-14 flex-shrink-0 rounded bg-gray-100 flex items-center justify-center text-gray-500">
                                <Package className="h-6 w-6" />
                              </div>
                            )}
                            
                            <div className="flex-1">
                              <h3 className="font-medium">{product.name}</h3>
                              <div className="text-lg font-bold">{formatPrice(product.price)}</div>
                            </div>
                          </div>
                          
                          <div className="mt-2 space-y-2">
                            <div className="flex flex-wrap gap-1">
                              <Badge variant={product.is_active ? "default" : "secondary"}>
                                {product.is_active ? "Ativo" : "Inativo"}
                              </Badge>
                              {product.is_featured && (
                                <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-700">
                                  Destaque
                                </Badge>
                              )}
                              {category && (
                                <Badge variant="outline" className="border-blue-200 bg-blue-50 text-blue-700">
                                  {category.name}
                                </Badge>
                              )}
                            </div>
                            
                            {isExpanded && (
                              <div className="mt-3 p-3 bg-gray-50 rounded-md text-sm text-gray-700 border border-gray-100 space-y-3">
                                {product.description && (
                                  <div>
                                    <h4 className="font-medium text-gray-900 mb-1">Descrição</h4>
                                    <p className="text-gray-700">{product.description}</p>
                                  </div>
                                )}
                                
                                <div className="grid grid-cols-2 gap-2">
                                  {product.preparation_time > 0 && (
                                    <div>
                                      <h4 className="font-medium text-gray-900 mb-1">Tempo de preparo</h4>
                                      <p className="flex items-center text-gray-700">
                                        {product.preparation_time} minutos
                                      </p>
                                    </div>
                                  )}
                                  
                                  {category && (
                                    <div>
                                      <h4 className="font-medium text-gray-900 mb-1">Categoria</h4>
                                      <p className="text-gray-700">{category.name}</p>
                                    </div>
                                  )}
                                </div>
                                
                                <div className="flex items-center justify-between">
                                  <div>
                                    <h4 className="font-medium text-gray-900 mb-1">Status</h4>
                                    <div className="flex items-center gap-2">
                                      <span className={`w-2 h-2 rounded-full ${product.is_active ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                                      <span>{product.is_active ? 'Ativo' : 'Inativo'}</span>
                                      {product.is_featured && (
                                        <span className="text-amber-600 ml-2 text-xs">• Em destaque</span>
                                      )}
                                    </div>
                                  </div>
                                  
                                  <div className="text-right">
                                    <h4 className="font-medium text-gray-900 mb-1">Preço</h4>
                                    <p className="font-bold text-gray-900">{formatPrice(product.price)}</p>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                          
                          <div className="mt-3 flex items-center gap-2 justify-between">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => toggleProductDetails(product.id)}
                              className="flex-1"
                            >
                              {isExpanded ? (
                                <>
                                  <ChevronUp className="h-3 w-3 mr-1" />
                                  Ocultar detalhes
                                </>
                              ) : (
                                <>
                                  <Eye className="h-3 w-3 mr-1" />
                                  Ver detalhes
                                </>
                              )}
                            </Button>
                            
                            <div className="flex gap-1">
                              <Button 
                                size="sm" 
                                variant="ghost"
                                onClick={() => handleEditProduct(product)}
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                className="text-red-500"
                                onClick={() => handleDeleteProduct(product)}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>

                {/* Versão desktop (tabela) */}
                <div className="hidden sm:block">
                  <div className="rounded-md border overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Produto
                          </th>
                          <th scope="col" className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Preço
                          </th>
                          <th scope="col" className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th scope="col" className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Categoria
                          </th>
                          <th scope="col" className="px-3 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Ações
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {filteredProducts.map((product) => {
                          const category = categories.find(c => c.id === product.category_id);
                          return (
                            <tr key={product.id}>
                              <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  {product.image_url ? (
                                    <div className="h-10 w-10 flex-shrink-0 rounded bg-gray-100">
                                      <img 
                                        src={product.image_url} 
                                        alt={product.name}
                                        className="h-10 w-10 object-cover rounded" 
                                      />
                                    </div>
                                  ) : (
                                    <div className="h-10 w-10 flex-shrink-0 rounded bg-gray-100 flex items-center justify-center text-gray-500">
                                      <Package className="h-5 w-5" />
                                    </div>
                                  )}
                                  <div className="ml-2 sm:ml-4">
                                    <div className="text-xs sm:text-sm font-medium text-gray-900">
                                      {product.name}
                                    </div>
                                    {product.description && (
                                      <div className="text-xs text-gray-500 truncate max-w-[200px]">
                                        {product.description}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </td>
                              <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900">
                                {formatPrice(product.price)}
                              </td>
                              <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap">
                                <Badge variant={product.is_active ? "default" : "secondary"}>
                                  {product.is_active ? "Ativo" : "Inativo"}
                                </Badge>
                                {product.is_featured && (
                                  <Badge variant="outline" className="ml-2 border-amber-200 bg-amber-50 text-amber-700">
                                    Destaque
                                  </Badge>
                                )}
                              </td>
                              <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500">
                                {category?.name || "-"}
                              </td>
                              <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-right text-xs sm:text-sm font-medium">
                                <div className="flex justify-end gap-1 sm:gap-2">
                                  <Button 
                                    size="icon" 
                                    variant="ghost"
                                    onClick={() => handleEditProduct(product)}
                                    className="h-7 w-7 sm:h-8 sm:w-8"
                                  >
                                    <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
                                  </Button>
                                  <Button 
                                    size="icon" 
                                    variant="ghost" 
                                    className="text-red-500 h-7 w-7 sm:h-8 sm:w-8"
                                    onClick={() => handleDeleteProduct(product)}
                                  >
                                    <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
          </TabsContent>

          {/* Tab de Categorias */}
          <TabsContent value="categorias" className="space-y-4 sm:space-y-6">
            {categories.length === 0 ? (
              <div className="text-center py-12">
                <FolderPlus className="mx-auto h-12 w-12 text-gray-300" />
                <h3 className="mt-2 text-lg font-medium text-gray-900">Nenhuma categoria encontrada</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Comece adicionando uma categoria para organizar seus produtos.
                </p>
                <div className="mt-6">
                  <Button 
                    onClick={() => setShowNewCategoryModal(true)}
                    className="bg-gradient-brand hover:from-brand-700 hover:to-brand-600 text-white"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar Categoria
                  </Button>
                </div>
              </div>
            ) : (
              <>
                {/* Versão mobile (cards) */}
                <div className="sm:hidden space-y-3 px-1">
                  {categories
                    .sort((a, b) => a.display_order - b.display_order)
                    .map((category) => {
                      const productCount = products.filter(p => p.category_id === category.id).length;
                      const isExpanded = expandedCategories[category.id] || false;
                      
                      return (
                        <Card key={category.id} className="overflow-hidden border shadow-sm">
                          <div className="p-3">
                            <div className="flex items-center gap-3">
                              {category.image_url ? (
                                <div className="h-12 w-12 flex-shrink-0 rounded bg-gray-100">
                                  <img 
                                    src={category.image_url} 
                                    alt={category.name}
                                    className="h-12 w-12 object-cover rounded" 
                                  />
                                </div>
                              ) : (
                                <div className="h-12 w-12 flex-shrink-0 rounded bg-gray-100 flex items-center justify-center text-gray-500">
                                  <FolderPlus className="h-5 w-5" />
                                </div>
                              )}
                              <div>
                                <h3 className="font-medium">{category.name}</h3>
                                <div className="text-sm text-gray-500">
                                  {productCount} produto{productCount !== 1 ? 's' : ''}
                                </div>
                              </div>
                            </div>

                            <div className="mt-2">
                              <Badge variant={category.is_active ? "default" : "secondary"}>
                                {category.is_active ? "Ativa" : "Inativa"}
                              </Badge>
                              
                              {isExpanded && category.description && (
                                <div className="mt-3 p-3 bg-gray-50 rounded-md text-sm text-gray-700 border border-gray-100 space-y-3">
                                  <div>
                                    <h4 className="font-medium text-gray-900 mb-1">Descrição</h4>
                                    <p className="text-gray-700">{category.description}</p>
                                  </div>
                                  
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <h4 className="font-medium text-gray-900 mb-1">Status</h4>
                                      <div className="flex items-center gap-2">
                                        <span className={`w-2 h-2 rounded-full ${category.is_active ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                                        <span>{category.is_active ? 'Ativa' : 'Inativa'}</span>
                                      </div>
                                    </div>
                                    
                                    <div className="text-right">
                                      <h4 className="font-medium text-gray-900 mb-1">Produtos</h4>
                                      <p className="font-bold text-gray-900">
                                        {productCount} {productCount === 1 ? 'produto' : 'produtos'}
                                      </p>
                                    </div>
                                  </div>
                                  
                                  {category.created_at && (
                                    <div>
                                      <h4 className="font-medium text-gray-900 mb-1">Criada em</h4>
                                      <p className="text-gray-700">
                                        {format(new Date(category.created_at), "dd/MM/yyyy", { locale: ptBR })}
                                      </p>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                            
                            <div className="mt-3 flex items-center gap-2 justify-between">
                              {category.description && (
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => toggleCategoryDetails(category.id)}
                                  className="flex-1"
                                >
                                  {isExpanded ? (
                                    <>
                                      <ChevronUp className="h-3 w-3 mr-1" />
                                      Ocultar detalhes
                                    </>
                                  ) : (
                                    <>
                                      <Eye className="h-3 w-3 mr-1" />
                                      Ver detalhes
                                    </>
                                  )}
                                </Button>
                              )}
                              
                              <div className={`flex gap-1 ${!category.description ? 'ml-auto' : ''}`}>
                                <Button 
                                  size="sm" 
                                  variant="ghost"
                                  onClick={() => handleEditCategory(category)}
                                >
                                  <Edit className="h-3 w-3" />
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="ghost" 
                                  className="text-red-500"
                                  onClick={() => handleDeleteCategory(category)}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </Card>
                      );
                    })}
                </div>

                {/* Versão desktop (tabela arrastável) */}
                <div className="hidden sm:block">
                  <DragDropContext onDragEnd={handleDragEnd}>
                    <Droppable droppableId="categorias">
                      {(provided) => (
                        <div 
                          className="rounded-md border overflow-hidden"
                          {...provided.droppableProps}
                          ref={provided.innerRef}
                        >
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                              <tr>
                                <th scope="col" className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-8">
                                  #
                                </th>
                                <th scope="col" className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Categoria
                                </th>
                                <th scope="col" className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Status
                                </th>
                                <th scope="col" className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Produtos
                                </th>
                                <th scope="col" className="px-3 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Ações
                                </th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {categories
                                .sort((a, b) => a.display_order - b.display_order)
                                .map((category, index) => {
                                  const productCount = products.filter(p => p.category_id === category.id).length;
                                  return (
                                    <Draggable 
                                      key={category.id} 
                                      draggableId={category.id} 
                                      index={index}
                                    >
                                      {(provided) => (
                                        <tr
                                          ref={provided.innerRef}
                                          {...provided.draggableProps}
                                        >
                                          <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap">
                                            <div 
                                              className="flex items-center justify-center cursor-grab"
                                              {...provided.dragHandleProps}
                                            >
                                              <GripVertical className="h-4 w-4 text-gray-400" />
                                            </div>
                                          </td>
                                          <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                              {category.image_url ? (
                                                <div className="h-8 w-8 flex-shrink-0 rounded bg-gray-100">
                                                  <img 
                                                    src={category.image_url} 
                                                    alt={category.name}
                                                    className="h-8 w-8 object-cover rounded" 
                                                  />
                                                </div>
                                              ) : (
                                                <div className="h-8 w-8 flex-shrink-0 rounded bg-gray-100 flex items-center justify-center text-gray-500">
                                                  <FolderPlus className="h-4 w-4" />
                                                </div>
                                              )}
                                              <div className="ml-2 sm:ml-4">
                                                <div className="text-xs sm:text-sm font-medium text-gray-900">
                                                  {category.name}
                                                </div>
                                                {category.description && (
                                                  <div className="text-xs text-gray-500 truncate max-w-[200px]">
                                                    {category.description}
                                                  </div>
                                                )}
                                              </div>
                                            </div>
                                          </td>
                                          <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap">
                                            <Badge variant={category.is_active ? "default" : "secondary"}>
                                              {category.is_active ? "Ativa" : "Inativa"}
                                            </Badge>
                                          </td>
                                          <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500">
                                            {productCount} produto{productCount !== 1 ? 's' : ''}
                                          </td>
                                          <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-right text-xs sm:text-sm font-medium">
                                            <div className="flex justify-end gap-1 sm:gap-2">
                                              <Button 
                                                size="icon" 
                                                variant="ghost"
                                                className="h-7 w-7 sm:h-8 sm:w-8"
                                                onClick={() => handleEditCategory(category)}
                                              >
                                                <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
                                              </Button>
                                              <Button 
                                                size="icon" 
                                                variant="ghost" 
                                                className="text-red-500 h-7 w-7 sm:h-8 sm:w-8"
                                                onClick={() => handleDeleteCategory(category)}
                                              >
                                                <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                                              </Button>
                                            </div>
                                          </td>
                                        </tr>
                                      )}
                                    </Draggable>
                                  );
                                })}
                              {provided.placeholder}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </Droppable>
                  </DragDropContext>
                </div>
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Modais */}
      {showNewProductModal && (
        <NewProductModal 
          open={showNewProductModal} 
          onOpenChange={setShowNewProductModal}
        />
      )}
      {showNewCategoryModal && (
        <NewCategoryModal 
          open={showNewCategoryModal} 
          onOpenChange={setShowNewCategoryModal} 
        />
      )}
      {showFiltersModal && (
        <FiltersModal 
          open={showFiltersModal} 
          onOpenChange={setShowFiltersModal}
          type="products"
        />
      )}
      {showEditProductModal && editingProduct && (
        <EditProductModal
          open={showEditProductModal}
          onOpenChange={setShowEditProductModal}
          product={editingProduct}
        />
      )}
      {showDeleteProductModal && deletingProduct && (
        <DeleteProductModal
          open={showDeleteProductModal}
          onOpenChange={setShowDeleteProductModal}
          product={deletingProduct}
        />
      )}
      {showEditCategoryModal && editingCategory && (
        <EditCategoryModal
          open={showEditCategoryModal}
          onOpenChange={setShowEditCategoryModal}
          category={editingCategory}
        />
      )}
      {showDeleteCategoryModal && deletingCategory && (
        <DeleteCategoryModal
          open={showDeleteCategoryModal}
          onOpenChange={setShowDeleteCategoryModal}
          category={deletingCategory}
        />
      )}
    </DashboardLayout>
  );
};

export default DashboardProducts;
