import { useState, useEffect } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/dashboard/AppSidebar";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Plus, Search, Filter, FolderPlus, Edit, Trash2,
  ArrowUp, ArrowDown, GripVertical, Store, Package
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

  const { products, loading: productsLoading } = useProducts();
  const { categories, loading: categoriesLoading, moveCategory, reorderCategories } = useCategories();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Searching for:", searchQuery);
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

  if (productsLoading || categoriesLoading) {
    return (
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-gray-50">
          <AppSidebar />
          <main className="flex-1 flex flex-col">
            <DashboardHeader />
            <div className="flex-1 p-6">
              <div className="flex items-center justify-center h-64">
                <p className="text-gray-500">Carregando...</p>
              </div>
            </div>
          </main>
        </div>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gray-50">
        <AppSidebar />
        <main className="flex-1 flex flex-col">
          <DashboardHeader />
          <div className="flex-1 p-6">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold tracking-tight">Cardápio</h2>
                  <p className="text-muted-foreground">
                    Gerencie os produtos e categorias do seu restaurante
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {activeTab === "produtos" ? (
                    <Button 
                      className="bg-gradient-brand hover:from-brand-700 hover:to-brand-600 text-white"
                      onClick={() => setShowNewProductModal(true)}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Novo Produto
                    </Button>
                  ) : (
                    <Button 
                      className="bg-gradient-brand hover:from-brand-700 hover:to-brand-600 text-white"
                      onClick={() => setShowNewCategoryModal(true)}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Nova Categoria
                    </Button>
                  )}
                </div>
              </div>

              <Tabs 
                defaultValue="produtos" 
                value={activeTab}
                onValueChange={setActiveTab}
                className="space-y-6"
              >
                <TabsList className="grid grid-cols-2 w-[400px]">
                  <TabsTrigger value="produtos" className="flex items-center gap-2">
                    <Package className="w-4 h-4" />
                    Produtos
                  </TabsTrigger>
                  <TabsTrigger value="categorias" className="flex items-center gap-2">
                    <FolderPlus className="w-4 h-4" />
                    Categorias
                  </TabsTrigger>
                </TabsList>

                {/* Tab de Produtos */}
                <TabsContent value="produtos" className="space-y-6">
                  <form onSubmit={handleSearch} className="flex items-center gap-4">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Buscar produtos..."
                        className="pl-10"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={() => setShowFiltersModal(true)}
                    >
                      <Filter className="w-4 h-4 mr-2" />
                      Filtros
                    </Button>
                  </form>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Total de Produtos</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl font-bold">{products.length}</div>
                        <p className="text-xs text-muted-foreground">produtos cadastrados</p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Produtos Ativos</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl font-bold">
                          {products.filter(p => p.is_active).length}
                        </div>
                        <p className="text-xs text-muted-foreground">produtos disponíveis</p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Categorias</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl font-bold">{categories.length}</div>
                        <p className="text-xs text-muted-foreground">categorias criadas</p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Em Destaque</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl font-bold">
                          {products.filter(p => p.is_featured).length}
                        </div>
                        <p className="text-xs text-muted-foreground">produtos em destaque</p>
                      </CardContent>
                    </Card>
                  </div>

                  <Card>
                    <CardHeader>
                      <CardTitle>Lista de Produtos</CardTitle>
                      <CardDescription>
                        Gerencie todos os produtos do seu cardápio
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {filteredProducts.length === 0 ? (
                        <div className="text-center py-12">
                          <p className="text-gray-500 text-lg">
                            {products.length === 0 ? "Nenhum produto cadastrado" : "Nenhum produto encontrado"}
                          </p>
                          <p className="text-gray-400 text-sm mt-2">
                            {products.length === 0 ? "Comece criando categorias e produtos" : "Tente ajustar sua busca"}
                          </p>
                          {products.length === 0 && (
                            <div className="flex items-center justify-center gap-4 mt-4">
                              <Button 
                                variant="outline"
                                onClick={() => {
                                  setActiveTab("categorias");
                                  setShowNewCategoryModal(true);
                                }}
                              >
                                <FolderPlus className="w-4 h-4 mr-2" />
                                Criar Categoria
                              </Button>
                              <Button 
                                className="bg-gradient-brand hover:from-brand-700 hover:to-brand-600 text-white"
                                onClick={() => setShowNewProductModal(true)}
                              >
                                <Plus className="w-4 h-4 mr-2" />
                                Criar Primeiro Produto
                              </Button>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {filteredProducts.map((product) => {
                            const category = categories.find(c => c.id === product.category_id);
                            return (
                                                              <Card key={product.id} className="relative group">
                                <CardContent className="p-4">
                                  {product.image_url ? (
                                    <div className="w-full h-32 rounded-md mb-3 overflow-hidden">
                                      <img
                                        src={product.image_url}
                                        alt={product.name}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                          (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x300?text=Imagem+Inválida';
                                        }}
                                      />
                                    </div>
                                  ) : (
                                    <div className="w-full h-32 bg-gray-100 rounded-md mb-3 flex items-center justify-center">
                                      <Package className="w-10 h-10 text-gray-300" />
                                    </div>
                                  )}
                                  <div className="space-y-2">
                                    <div className="flex items-start justify-between">
                                      <h3 className="font-semibold text-lg">{product.name}</h3>
                                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button 
                                          size="sm" 
                                          variant="outline" 
                                          onClick={() => handleEditProduct(product)}
                                        >
                                          <Edit className="w-3 h-3" />
                                        </Button>
                                        <Button 
                                          size="sm" 
                                          variant="outline"
                                          onClick={() => handleDeleteProduct(product)}
                                        >
                                          <Trash2 className="w-3 h-3" />
                                        </Button>
                                      </div>
                                    </div>
                                    <p className="text-2xl font-bold text-brand-600">
                                      {formatPrice(product.price)}
                                    </p>
                                    {product.description && (
                                      <p className="text-sm text-gray-600 line-clamp-2">
                                        {product.description}
                                      </p>
                                    )}
                                    <div className="flex flex-wrap gap-1">
                                      {category && (
                                        <Badge variant="secondary">{category.name}</Badge>
                                      )}
                                      {product.is_featured && (
                                        <Badge className="bg-yellow-100 text-yellow-800">Destaque</Badge>
                                      )}
                                      <Badge variant={product.is_active ? "default" : "destructive"}>
                                        {product.is_active ? "Ativo" : "Inativo"}
                                      </Badge>
                                    </div>
                                    <p className="text-xs text-gray-500">
                                      Preparo: {product.preparation_time} min
                                    </p>
                                  </div>
                                </CardContent>
                              </Card>
                            );
                          })}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Tab de Categorias */}
                <TabsContent value="categorias" className="space-y-6">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Total de Categorias</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl font-bold">{categories.length}</div>
                        <p className="text-xs text-muted-foreground">categorias criadas</p>
                      </CardContent>
                    </Card>
                  </div>

                  <Card>
                    <CardHeader>
                      <CardTitle>Organizar Categorias</CardTitle>
                      <CardDescription>
                        Reordene suas categorias para mudar como elas aparecem no cardápio para o cliente
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {categories.length === 0 ? (
                        <div className="text-center py-12">
                          <p className="text-gray-500 text-lg">Nenhuma categoria cadastrada</p>
                          <p className="text-gray-400 text-sm mt-2">Comece criando categorias para o seu cardápio</p>
                          <div className="flex items-center justify-center mt-4">
                            <Button 
                              className="bg-gradient-brand hover:from-brand-700 hover:to-brand-600 text-white"
                              onClick={() => setShowNewCategoryModal(true)}
                            >
                              <FolderPlus className="w-4 h-4 mr-2" />
                              Criar Primeira Categoria
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="text-sm text-muted-foreground mb-4">
                            Arraste as categorias ou use os botões para reorganizar a ordem. A ordem aqui será a mesma exibida no cardápio do cliente.
                          </div>
                          <DragDropContext onDragEnd={handleDragEnd}>
                            <Droppable droppableId="categoriesList">
                              {(provided) => (
                                <div 
                                  className="grid gap-2"
                                  {...provided.droppableProps}
                                  ref={provided.innerRef}
                                >
                                  {categories
                                    .sort((a, b) => a.display_order - b.display_order)
                                    .map((category, index) => (
                                    <Draggable 
                                      key={category.id} 
                                      draggableId={category.id} 
                                      index={index}
                                    >
                                      {(provided, snapshot) => (
                                        <div 
                                          ref={provided.innerRef}
                                          {...provided.draggableProps}
                                          className={`p-4 border rounded-md shadow-sm bg-white flex items-center justify-between ${snapshot.isDragging ? 'bg-gray-50' : ''}`}
                                        >
                                          <div className="flex items-center gap-3 flex-grow">
                                            <div 
                                              {...provided.dragHandleProps} 
                                              className="text-gray-400 cursor-grab"
                                            >
                                              <GripVertical className="w-5 h-5" />
                                            </div>
                                            {category.image_url ? (
                                              <div className="w-12 h-12 relative rounded-md overflow-hidden border">
                                                <img
                                                  src={category.image_url}
                                                  alt={category.name}
                                                  className="w-full h-full object-cover"
                                                  onError={(e) => {
                                                    (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x300?text=Imagem+Inválida';
                                                  }}
                                                />
                                              </div>
                                            ) : (
                                              <div className="w-12 h-12 bg-gray-100 rounded-md flex items-center justify-center">
                                                <FolderPlus className="w-6 h-6 text-gray-400" />
                                              </div>
                                            )}
                                            <div className="flex-grow">
                                              <h3 className="font-medium">{category.name}</h3>
                                              {category.description && (
                                                <p className="text-sm text-gray-500 line-clamp-1">{category.description}</p>
                                              )}
                                              <div className="flex items-center gap-2 mt-1">
                                                <Badge variant={category.is_active ? "default" : "destructive"}>
                                                  {category.is_active ? "Ativa" : "Inativa"}
                                                </Badge>
                                                <span className="text-xs text-muted-foreground">
                                                  Criada em {format(new Date(category.created_at), "dd MMM yyyy", { locale: ptBR })}
                                                </span>
                                              </div>
                                            </div>
                                          </div>
                                          <div className="flex items-center gap-2">
                                            <div className="flex flex-col gap-1">
                                              <Button 
                                                variant="ghost" 
                                                size="sm"
                                                disabled={index === 0}
                                                onClick={() => handleMoveCategory(category.id, 'up')}
                                                className="px-1 h-8"
                                              >
                                                <ArrowUp className="w-5 h-5" />
                                              </Button>
                                              <Button 
                                                variant="ghost" 
                                                size="sm"
                                                disabled={index === categories.length - 1} 
                                                onClick={() => handleMoveCategory(category.id, 'down')}
                                                className="px-1 h-8"
                                              >
                                                <ArrowDown className="w-5 h-5" />
                                              </Button>
                                            </div>
                                            <div className="flex items-center gap-1 ml-2">
                                              <Button 
                                                variant="outline" 
                                                size="sm"
                                                className="h-9 px-2"
                                                onClick={() => handleEditCategory(category)}
                                              >
                                                <Edit className="w-4 h-4" />
                                              </Button>
                                              <Button 
                                                variant="destructive" 
                                                size="sm"
                                                className="h-9 px-2"
                                                onClick={() => handleDeleteCategory(category)}
                                              >
                                                <Trash2 className="w-4 h-4" />
                                              </Button>
                                            </div>
                                          </div>
                                        </div>
                                      )}
                                    </Draggable>
                                  ))}
                                  {provided.placeholder}
                                </div>
                              )}
                            </Droppable>
                          </DragDropContext>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </main>
      </div>

      {/* Modais de Produtos */}
      <NewProductModal 
        open={showNewProductModal} 
        onOpenChange={setShowNewProductModal} 
      />
      <EditProductModal 
        open={showEditProductModal} 
        onOpenChange={setShowEditProductModal} 
        product={editingProduct}
      />
      <DeleteProductModal 
        open={showDeleteProductModal} 
        onOpenChange={setShowDeleteProductModal} 
        product={deletingProduct}
      />

      {/* Modais de Categorias */}
      <NewCategoryModal 
        open={showNewCategoryModal} 
        onOpenChange={setShowNewCategoryModal} 
      />
      <EditCategoryModal 
        open={showEditCategoryModal}
        onOpenChange={setShowEditCategoryModal}
        category={editingCategory}
      />
      <DeleteCategoryModal 
        open={showDeleteCategoryModal}
        onOpenChange={setShowDeleteCategoryModal}
        category={deletingCategory}
      />
      
      {/* Outros Modais */}
      <FiltersModal 
        open={showFiltersModal} 
        onOpenChange={setShowFiltersModal}
        type="products"
      />
    </SidebarProvider>
  );
};

export default DashboardProducts;
