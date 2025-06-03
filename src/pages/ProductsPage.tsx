import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useRestaurant } from '@/contexts/RestaurantContext';
import { useAuth } from '@/contexts/AuthContext';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { Category, Product } from '@/lib/models';
import { Plus, Edit, Trash2, Eye, EyeOff, RefreshCw } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const ProductsPage: React.FC = () => {
  console.log("ProductsPage: Component rendered");

  const {
    restaurant: currentRestaurant,
    products,
    categories,
    addProduct,
    updateProduct,
    deleteProduct,
    addCategory,
    updateCategory,
    deleteCategory,
    loadCategories
  } = useRestaurant();
  
  const { user, refreshSession } = useAuth();
  
  console.log("ProductsPage: Restaurant:", currentRestaurant);
  console.log("ProductsPage: Products:", products);
  console.log("ProductsPage: Categories:", categories);
  console.log("ProductsPage: User:", user);
  
  const { toast } = useToast();
  
  // State for adding a new product
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    price: 0,
    categoryId: '',
    imageUrl: '',
    available: true
  });
  
  // State for editing a product
  const [isEditingProduct, setIsEditingProduct] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [editProduct, setEditProduct] = useState({
    name: '',
    description: '',
    price: 0,
    categoryId: '',
    imageUrl: '',
    available: true
  });
  
  // State for adding a new category
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategory, setNewCategory] = useState({
    name: '',
    description: ''
  });
  
  // State for managing categories
  const [isDeletingCategory, setIsDeletingCategory] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  
  // State for editing a category
  const [isEditingCategory, setIsEditingCategory] = useState(false);
  const [editCategory, setEditCategory] = useState({
    name: '',
    description: '',
    is_active: true,
    sort_order: 0
  });
  
  // Selected category for filtering products
  const [selectedFilterCategory, setSelectedFilterCategory] = useState<string | 'all'>('all');
  
  // Estado para verificar se a página está inicializando
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    // Verificar se há um usuário logado e se temos ID do restaurante
    const checkAuth = async () => {
      console.log("ProductsPage: Verificando autenticação");
      if (!user) {
        console.log("ProductsPage: Usuário não autenticado, tentando refreshSession");
        await refreshSession();
      }
      
      if (user && !currentRestaurant?.id) {
        console.log("ProductsPage: Usuário autenticado mas sem restaurante, tentando loadCategories");
        if (loadCategories) {
          await loadCategories();
        }
      }
      
      setIsInitializing(false);
    };
    
    checkAuth();
  }, [user, currentRestaurant, refreshSession, loadCategories]);

  // Add effect for debugging
  useEffect(() => {
    console.log("ProductsPage: Initial render");
    console.log("ProductsPage: Products length:", products.length);
    console.log("ProductsPage: Categories length:", categories.length);
    console.log("ProductsPage: Restaurant ID:", currentRestaurant?.id);
    
    // Check for errors in functions
    try {
      console.log("ProductsPage: Testing addProduct function:", typeof addProduct);
      console.log("ProductsPage: Testing updateProduct function:", typeof updateProduct);
      console.log("ProductsPage: Testing deleteProduct function:", typeof deleteProduct);
      console.log("ProductsPage: Testing addCategory function:", typeof addCategory);
      console.log("ProductsPage: Testing deleteCategory function:", typeof deleteCategory);
    } catch (error) {
      console.error("ProductsPage: Error testing functions:", error);
    }
  }, [products, categories, addProduct, updateProduct, deleteProduct, addCategory, deleteCategory, currentRestaurant]);
  
  // Function to force reload of categories and products
  const handleForceRefresh = async () => {
    console.log("ProductsPage: Forçando recarregamento de dados");
    if (loadCategories) {
      await loadCategories();
      toast({
        title: "Dados recarregados",
        description: "Categorias e produtos foram atualizados.",
      });
    }
  };
  
  // Function to add a new product
  const handleAddProduct = () => {
    console.log("handleAddProduct: Adicionando produto", newProduct);
    
    if (!newProduct.name || !newProduct.price) {
      toast({
        title: "Dados incompletos",
        description: "Nome e preço são obrigatórios",
        variant: "destructive"
      });
      return;
    }

    console.log("handleAddProduct: currentRestaurant", currentRestaurant);
    
    // Obter o ID do restaurante, seja do contexto ou do usuário
    const restaurantId = currentRestaurant?.id || user?.restaurantId;
    
    if (!restaurantId) {
      console.error("handleAddProduct: ID do restaurante não encontrado!");
      toast({
        title: "Erro",
        description: "ID do restaurante não encontrado. Faça login novamente.",
        variant: "destructive"
      });
      return;
    }
    
    const now = new Date();
    const productToAdd = {
      restaurant_id: restaurantId,
      name: newProduct.name,
      description: newProduct.description,
      price: parseFloat(newProduct.price.toString()),
      category_id: newProduct.categoryId || null,
      image_url: newProduct.imageUrl,
      is_active: true,
      is_featured: false,
      has_variations: false,
      preparation_time: null,
      created_at: now,
      updated_at: now,
      // Campos de compatibilidade
      available: true,
      categoryId: newProduct.categoryId,
      imageUrl: newProduct.imageUrl
    };

    console.log("handleAddProduct: Chamando addProduct com", productToAdd);
    addProduct(productToAdd).then(result => {
      console.log("handleAddProduct: Resultado", result);
      if (result) {
        toast({
          title: "Produto adicionado",
          description: "O produto foi adicionado com sucesso!"
        });
      }
    });
    
    setNewProduct({
      name: '',
      description: '',
      price: 0,
      categoryId: '',
      imageUrl: '',
      available: true
    });
    setIsAddingProduct(false);
  };

  // Function to update a product
  const handleUpdateProduct = () => {
    if (selectedProduct) {
      const updatedProduct = {
        ...selectedProduct,
        name: editProduct.name || selectedProduct.name,
        description: editProduct.description || selectedProduct.description,
        price: editProduct.price !== undefined ? parseFloat(editProduct.price.toString()) : selectedProduct.price,
        category_id: editProduct.categoryId || selectedProduct.category_id || null,
        image_url: editProduct.imageUrl || selectedProduct.image_url,
        is_active: editProduct.available !== undefined ? editProduct.available : selectedProduct.is_active,
        updated_at: new Date()
      };
      
      updateProduct(updatedProduct);
      setIsEditingProduct(false);
    }
  };

  // Function to toggle product visibility
  const handleToggleProductVisibility = (product: Product) => {
    const updatedProduct = {
      ...product,
      is_active: !product.is_active,
      available: !product.is_active,
      updated_at: new Date()
    };
    
    updateProduct(updatedProduct);
  };

  // Function to add a new category
  const handleAddCategory = () => {
    console.log("handleAddCategory: Adicionando categoria", newCategory);
    
    if (!newCategory.name) {
      toast({
        title: "Nome obrigatório",
        description: "O nome da categoria é obrigatório",
        variant: "destructive"
      });
      return;
    }

    console.log("handleAddCategory: currentRestaurant", currentRestaurant);
    
    // Obter o ID do restaurante, seja do contexto ou do usuário
    const restaurantId = currentRestaurant?.id || user?.restaurantId;
    
    if (!restaurantId) {
      console.error("handleAddCategory: ID do restaurante não encontrado!");
      toast({
        title: "Erro",
        description: "ID do restaurante não encontrado. Faça login novamente.",
        variant: "destructive"
      });
      return;
    }
    
    const now = new Date();
    const categoryToAdd = {
      restaurant_id: restaurantId,
      name: newCategory.name,
      description: newCategory.description,
      is_active: true,
      sort_order: categories.length + 1,
      created_at: now,
      updated_at: now
    };

    console.log("handleAddCategory: Chamando addCategory com", categoryToAdd);
    addCategory(categoryToAdd).then(result => {
      console.log("handleAddCategory: Resultado", result);
      if (result) {
        // Recarregar categorias e sincronizar ambas as páginas
        console.log("handleAddCategory: Recarregando categorias");
        if (loadCategories) loadCategories();
        
        toast({
          title: "Categoria adicionada",
          description: "A categoria foi adicionada com sucesso!"
        });
      }
    });
    
    setNewCategory({
      name: '',
      description: ''
    });
    setIsAddingCategory(false);
  };

  // Function to update a category
  const handleUpdateCategory = () => {
    if (selectedCategory) {
      const updatedCategory = {
        ...selectedCategory,
        name: editCategory.name || selectedCategory.name,
        description: editCategory.description || selectedCategory.description,
        is_active: editCategory.is_active,
        sort_order: editCategory.sort_order || selectedCategory.sort_order,
        updated_at: new Date()
      };
      
      updateCategory(updatedCategory).then(success => {
        if (success && loadCategories) {
          loadCategories();
        }
      });
      
      setIsEditingCategory(false);
    }
  };
  
  // Function to toggle category visibility
  const handleToggleCategoryVisibility = (category: Category) => {
    const updatedCategory = {
      ...category,
      is_active: !category.is_active,
      updated_at: new Date()
    };
    
    updateCategory(updatedCategory).then(success => {
      if (success && loadCategories) {
        loadCategories();
      }
    });
  };
  
  // Function to delete a category
  const handleDeleteCategory = () => {
    if (selectedCategory) {
      deleteCategory(selectedCategory.id).then(success => {
        if (success) {
          // Recarregar categorias e sincronizar ambas as páginas
          if (loadCategories) loadCategories();
        }
      });
      setIsDeletingCategory(false);
    }
  };
  
  // Filter products by selected category
  const filteredProducts = selectedFilterCategory === 'all' 
    ? products 
    : products.filter(product => product.category_id === selectedFilterCategory);

  return (
    <DashboardLayout title="Produtos">
      {/* Error checking and loading fallback */}
      {(() => {
        try {
          // Check if we're still initializing or have errors
          if (isInitializing) {
            return (
              <div className="w-full p-8 text-center">
                <h3 className="text-xl font-medium text-gray-700 mb-4">Carregando...</h3>
                <p className="text-gray-500 mb-6">
                  Aguarde enquanto carregamos seus produtos e categorias.
                </p>
              </div>
            );
          }

          // Check if required context values are available
          if (!addProduct || !updateProduct || !deleteProduct || !addCategory || !deleteCategory) {
            console.error("ProductsPage: Missing required functions from context");
            return (
              <div className="w-full p-8 text-center">
                <h3 className="text-xl font-medium text-gray-700 mb-4">Erro de carregamento</h3>
                <p className="text-gray-500 mb-6">
                  Não foi possível carregar as funções necessárias para gerenciar produtos. 
                  Tente recarregar a página ou faça login novamente.
                </p>
                <Button onClick={() => window.location.reload()}>Recarregar página</Button>
              </div>
            );
          }

          // Check if restaurant ID is missing, but only if user is authenticated
          if (!currentRestaurant?.id && !user?.restaurantId && !isInitializing) {
            console.error("ProductsPage: Missing restaurant ID");
            return (
              <div className="w-full p-8 text-center">
                <h3 className="text-xl font-medium text-gray-700 mb-4">Erro de autenticação</h3>
                <p className="text-gray-500 mb-6">
                  Não foi possível identificar seu restaurante. 
                  Tente fazer login novamente.
                </p>
                <Button onClick={() => window.location.reload()}>Recarregar página</Button>
              </div>
            );
          }
          
          // Se o restaurante tem o ID "mock-restaurant-id", exibir uma mensagem informando o usuário
          if (currentRestaurant?.id === 'mock-restaurant-id') {
            return (
              <Tabs defaultValue="categories" className="w-full">
                <div className="flex justify-between items-center mb-6">
                  <TabsList>
                    <TabsTrigger value="categories">Categorias</TabsTrigger>
                    <TabsTrigger value="products">Produtos</TabsTrigger>
                  </TabsList>
                  
                  <Button 
                    variant="outline" 
                    onClick={handleForceRefresh} 
                    className="ml-auto"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Atualizar dados
                  </Button>
                </div>
                
                {/* Removendo o banner de modo de demonstração
                <div className="mb-6 p-4 border border-yellow-300 bg-yellow-50 rounded-md">
                  <h3 className="text-lg font-medium text-yellow-800 mb-2">Modo de demonstração</h3>
                  <p className="text-yellow-700">
                    Você está vendo um restaurante de demonstração porque não foi possível identificar 
                    seu restaurante real. Isso pode acontecer se você estiver testando o sistema ou se 
                    houver algum problema com o cadastro do seu restaurante.
                  </p>
                  <p className="text-yellow-700 mt-2">
                    As alterações feitas neste modo serão salvas temporariamente, mas não serão persistidas no banco de dados.
                  </p>
                </div>
                */}
                
                {/* Resto do conteúdo normal */}
                <TabsContent value="categories">
                  <Card className="mb-8">
                    <CardHeader>
                      <CardTitle>Gerenciar Categorias</CardTitle>
                      <CardDescription>
                        Adicione, edite ou remova categorias do seu menu.
                      </CardDescription>
                    </CardHeader>
                    
                    <CardContent className="flex justify-end">
                      <Button onClick={() => setIsAddingCategory(true)}>
                        <Plus className="mr-2 h-4 w-4" />
                        Adicionar Categoria
                      </Button>
                    </CardContent>
                  </Card>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {categories.length > 0 ? (
                      categories.map(category => (
                        <Card key={category.id} className={!category.is_active ? "opacity-60 border-dashed" : ""}>
                          <CardHeader>
                            <div className="flex justify-between items-center">
                              <CardTitle>{category.name}</CardTitle>
                              <div className="flex items-center space-x-2">
                                <span className="text-xs text-gray-500">
                                  {category.is_active ? "Visível" : "Oculta"}
                                </span>
                                <Switch 
                                  checked={category.is_active}
                                  onCheckedChange={() => handleToggleCategoryVisibility(category)}
                                  aria-label={category.is_active ? "Ocultar categoria" : "Mostrar categoria"}
                                />
                              </div>
                            </div>
                          </CardHeader>
                          
                          <CardContent>
                            <p className="text-sm text-gray-500">
                              {category.description || "Sem descrição"}
                            </p>
                          </CardContent>
                          
                          <CardFooter className="flex justify-end gap-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => {
                                setSelectedCategory(category);
                                setEditCategory({
                                  name: category.name,
                                  description: category.description || '',
                                  is_active: category.is_active,
                                  sort_order: category.sort_order
                                });
                                setIsEditingCategory(true);
                              }}
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              Editar
                            </Button>
                            
                            <Button 
                              variant="destructive" 
                              size="sm"
                              onClick={() => {
                                setSelectedCategory(category);
                                setIsDeletingCategory(true);
                              }}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Excluir
                            </Button>
                          </CardFooter>
                        </Card>
                      ))
                    ) : (
                      <div className="col-span-full text-center py-10">
                        <p className="text-gray-500">Nenhuma categoria cadastrada.</p>
                        <p className="text-gray-500 mt-2">Clique em "Adicionar Categoria" para criar sua primeira categoria.</p>
                      </div>
                    )}
                  </div>
                </TabsContent>
                
                <TabsContent value="products">
                  <Card className="mb-8">
                    <CardHeader>
                      <CardTitle>Gerenciar Produtos</CardTitle>
                      <CardDescription>
                        Adicione, edite ou remova produtos do seu menu.
                      </CardDescription>
                    </CardHeader>
                    
                    <CardContent>
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2">
                          <Label htmlFor="categoryFilter">Filtrar por categoria:</Label>
                          <Select 
                            value={selectedFilterCategory} 
                            onValueChange={(value) => setSelectedFilterCategory(value)}
                          >
                            <SelectTrigger className="w-[180px]">
                              <SelectValue placeholder="Todas as categorias" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">Todas as categorias</SelectItem>
                              {categories.map(category => (
                                <SelectItem key={category.id} value={category.id}>
                                  {category.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <Button onClick={() => setIsAddingProduct(true)}>
                          <Plus className="mr-2 h-4 w-4" />
                          Adicionar Produto
                        </Button>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredProducts.length > 0 ? (
                          filteredProducts.map(product => {
                            const category = categories.find(c => c.id === product.category_id);
                            return (
                              <Card key={product.id} className={!(product.is_active !== false) ? "opacity-60 border-dashed" : ""}>
                                <CardHeader>
                                  <div className="flex justify-between items-center">
                                    <div>
                                      <CardTitle>{product.name}</CardTitle>
                                      <CardDescription>
                                        R$ {product.price.toFixed(2)}
                                      </CardDescription>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <span className="text-xs text-gray-500">
                                        {(product.is_active !== false) ? "Disponível" : "Indisponível"}
                                      </span>
                                      <Button 
                                        variant="ghost" 
                                        size="sm" 
                                        className="p-0 h-auto" 
                                        onClick={() => handleToggleProductVisibility(product)}
                                      >
                                        {(product.is_active !== false) ? (
                                          <Eye className="h-4 w-4" />
                                        ) : (
                                          <EyeOff className="h-4 w-4" />
                                        )}
                                      </Button>
                                    </div>
                                  </div>
                                </CardHeader>
                                
                                <CardContent>
                                  <p className="text-sm text-gray-500 mb-2">
                                    {product.description || "Sem descrição"}
                                  </p>
                                  {category && (
                                    <div className="inline-block bg-gray-100 rounded-full px-3 py-1 text-xs">
                                      {category.name}
                                    </div>
                                  )}
                                </CardContent>
                                
                                <CardFooter className="flex justify-end gap-2">
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => {
                                      setSelectedProduct(product);
                                      setEditProduct({
                                        name: product.name,
                                        description: product.description || '',
                                        price: product.price,
                                        categoryId: product.category_id || '',
                                        imageUrl: product.image_url || '',
                                        available: product.is_active !== false
                                      });
                                      setIsEditingProduct(true);
                                    }}
                                  >
                                    <Edit className="mr-2 h-4 w-4" />
                                    Editar
                                  </Button>
                                  
                                  <Button 
                                    variant="destructive" 
                                    size="sm"
                                    onClick={() => deleteProduct(product.id)}
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Remover
                                  </Button>
                                </CardFooter>
                              </Card>
                            );
                          })
                        ) : (
                          <div className="col-span-full text-center py-10">
                            <p className="text-gray-500">Nenhum produto encontrado.</p>
                            {selectedFilterCategory !== 'all' ? (
                              <p className="text-gray-500 mt-2">Tente selecionar outra categoria ou adicionar produtos a esta categoria.</p>
                            ) : categories.length === 0 ? (
                              <p className="text-gray-500 mt-2">Crie pelo menos uma categoria antes de adicionar produtos.</p>
                            ) : (
                              <p className="text-gray-500 mt-2">Clique em "Adicionar Produto" para criar seu primeiro produto.</p>
                            )}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                {/* Modal para adicionar produto */}
                <Dialog open={isAddingProduct} onOpenChange={setIsAddingProduct}>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Adicionar Produto</DialogTitle>
                      <CardDescription>
                        Adicione um novo produto ao seu menu.
                      </CardDescription>
                    </DialogHeader>
                    
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">
                          Nome
                        </Label>
                        <Input
                          id="name"
                          value={newProduct.name}
                          onChange={e => setNewProduct({ ...newProduct, name: e.target.value })}
                          className="col-span-3"
                        />
                      </div>
                      
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="description" className="text-right">
                          Descrição
                        </Label>
                        <Textarea
                          id="description"
                          value={newProduct.description}
                          onChange={e => setNewProduct({ ...newProduct, description: e.target.value })}
                          className="col-span-3"
                        />
                      </div>
                      
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="price" className="text-right">
                          Preço
                        </Label>
                        <Input
                          id="price"
                          type="number"
                          value={newProduct.price}
                          onChange={e => setNewProduct({ ...newProduct, price: parseFloat(e.target.value) })}
                          className="col-span-3"
                        />
                      </div>
                      
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="categoryId" className="text-right">
                          Categoria
                        </Label>
                        <Select onValueChange={(value) => setNewProduct({ ...newProduct, categoryId: value })}>
                          <SelectTrigger className="col-span-3">
                            <SelectValue placeholder="Selecione uma categoria" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map(category => (
                              <SelectItem key={category.id} value={category.id}>
                                {category.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="imageUrl" className="text-right">
                          URL da Imagem
                        </Label>
                        <Input
                          id="imageUrl"
                          type="text"
                          value={newProduct.imageUrl}
                          onChange={e => setNewProduct({ ...newProduct, imageUrl: e.target.value })}
                          className="col-span-3"
                        />
                      </div>
                    </div>
                    
                    <DialogFooter>
                      <Button type="submit" onClick={handleAddProduct}>
                        Adicionar Produto
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
                
                {/* Modal para editar produto */}
                <Dialog open={isEditingProduct} onOpenChange={setIsEditingProduct}>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Editar Produto</DialogTitle>
                      <CardDescription>
                        Edite os detalhes do produto selecionado.
                      </CardDescription>
                    </DialogHeader>
                    
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">
                          Nome
                        </Label>
                        <Input
                          id="name"
                          defaultValue={editProduct.name}
                          onChange={e => setEditProduct({ ...editProduct, name: e.target.value })}
                          className="col-span-3"
                        />
                      </div>
                      
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="description" className="text-right">
                          Descrição
                        </Label>
                        <Textarea
                          id="description"
                          defaultValue={editProduct.description}
                          onChange={e => setEditProduct({ ...editProduct, description: e.target.value })}
                          className="col-span-3"
                        />
                      </div>
                      
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="price" className="text-right">
                          Preço
                        </Label>
                        <Input
                          id="price"
                          type="number"
                          defaultValue={editProduct.price}
                          onChange={e => setEditProduct({ ...editProduct, price: parseFloat(e.target.value) })}
                          className="col-span-3"
                        />
                      </div>
                      
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="categoryId" className="text-right">
                          Categoria
                        </Label>
                        <Select 
                          defaultValue={editProduct.categoryId} 
                          onValueChange={(value) => setEditProduct({ ...editProduct, categoryId: value })}
                        >
                          <SelectTrigger className="col-span-3">
                            <SelectValue placeholder="Selecione uma categoria" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map(category => (
                              <SelectItem key={category.id} value={category.id}>
                                {category.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="imageUrl" className="text-right">
                          URL da Imagem
                        </Label>
                        <Input
                          id="imageUrl"
                          type="text"
                          defaultValue={editProduct.imageUrl}
                          onChange={e => setEditProduct({ ...editProduct, imageUrl: e.target.value })}
                          className="col-span-3"
                        />
                      </div>
                      
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="available" className="text-right">
                          Disponível
                        </Label>
                        <Switch 
                          id="available"
                          defaultChecked={editProduct.available}
                          onCheckedChange={(checked) => setEditProduct({ ...editProduct, available: checked })}
                        />
                      </div>
                    </div>
                    
                    <DialogFooter>
                      <Button type="submit" onClick={handleUpdateProduct}>
                        Salvar Alterações
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
                
                {/* Modal para adicionar categoria */}
                <Dialog open={isAddingCategory} onOpenChange={setIsAddingCategory}>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Adicionar Categoria</DialogTitle>
                      <CardDescription>
                        Adicione uma nova categoria ao seu menu.
                      </CardDescription>
                    </DialogHeader>
                    
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">
                          Nome
                        </Label>
                        <Input
                          id="name"
                          value={newCategory.name}
                          onChange={e => setNewCategory({ ...newCategory, name: e.target.value })}
                          className="col-span-3"
                        />
                      </div>
                      
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="description" className="text-right">
                          Descrição
                        </Label>
                        <Textarea
                          id="description"
                          value={newCategory.description}
                          onChange={e => setNewCategory({ ...newCategory, description: e.target.value })}
                          className="col-span-3"
                        />
                      </div>
                    </div>
                    
                    <DialogFooter>
                      <Button type="submit" onClick={handleAddCategory}>
                        Adicionar Categoria
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
                
                {/* Modal para editar categoria */}
                <Dialog open={isEditingCategory} onOpenChange={setIsEditingCategory}>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Editar Categoria</DialogTitle>
                      <CardDescription>
                        Edite os detalhes da categoria selecionada.
                      </CardDescription>
                    </DialogHeader>
                    
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="editCategoryName" className="text-right">
                          Nome
                        </Label>
                        <Input
                          id="editCategoryName"
                          defaultValue={editCategory.name}
                          onChange={e => setEditCategory({ ...editCategory, name: e.target.value })}
                          className="col-span-3"
                        />
                      </div>
                      
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="editCategoryDescription" className="text-right">
                          Descrição
                        </Label>
                        <Textarea
                          id="editCategoryDescription"
                          defaultValue={editCategory.description}
                          onChange={e => setEditCategory({ ...editCategory, description: e.target.value })}
                          className="col-span-3"
                        />
                      </div>
                      
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="editCategoryActive" className="text-right">
                          Visível
                        </Label>
                        <Switch 
                          id="editCategoryActive"
                          defaultChecked={editCategory.is_active}
                          onCheckedChange={(checked) => setEditCategory({ ...editCategory, is_active: checked })}
                        />
                      </div>
                    </div>
                    
                    <DialogFooter>
                      <Button type="submit" onClick={handleUpdateCategory}>
                        Salvar Alterações
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
                
                {/* Modal para deletar categoria */}
                <Dialog open={isDeletingCategory} onOpenChange={setIsDeletingCategory}>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Remover Categoria</DialogTitle>
                      <CardDescription>
                        Tem certeza que deseja excluir a categoria "{selectedCategory?.name}"?
                        {products.some(p => p.category_id === selectedCategory?.id) && (
                          <div className="text-red-500 mt-2">
                            Atenção: Esta categoria contém produtos. Remover esta categoria não excluirá os produtos associados,
                            mas eles ficarão sem categoria.
                          </div>
                        )}
                      </CardDescription>
                    </DialogHeader>
                    
                    <DialogFooter>
                      <Button variant="secondary" onClick={() => setIsDeletingCategory(false)}>
                        Cancelar
                      </Button>
                      <Button variant="destructive" onClick={handleDeleteCategory}>
                        Remover Categoria
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </Tabs>
            );
          }

          // Return the normal component
          return (
            <Tabs defaultValue="categories" className="w-full">
              <div className="flex justify-between items-center mb-6">
                <TabsList>
                  <TabsTrigger value="categories">Categorias</TabsTrigger>
                  <TabsTrigger value="products">Produtos</TabsTrigger>
                </TabsList>
                
                <Button 
                  variant="outline" 
                  onClick={handleForceRefresh} 
                  className="ml-auto"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Atualizar dados
                </Button>
              </div>
              
              <TabsContent value="categories">
                <Card className="mb-8">
                  <CardHeader>
                    <CardTitle>Gerenciar Categorias</CardTitle>
                    <CardDescription>
                      Adicione, edite ou remova categorias do seu menu.
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="flex justify-end">
                    <Button onClick={() => setIsAddingCategory(true)}>
                      <Plus className="mr-2 h-4 w-4" />
                      Adicionar Categoria
                    </Button>
                  </CardContent>
                </Card>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {categories.length > 0 ? (
                    categories.map(category => (
                      <Card key={category.id} className={!category.is_active ? "opacity-60 border-dashed" : ""}>
                        <CardHeader>
                          <div className="flex justify-between items-center">
                            <CardTitle>{category.name}</CardTitle>
                            <div className="flex items-center space-x-2">
                              <span className="text-xs text-gray-500">
                                {category.is_active ? "Visível" : "Oculta"}
                              </span>
                              <Switch 
                                checked={category.is_active}
                                onCheckedChange={() => handleToggleCategoryVisibility(category)}
                                aria-label={category.is_active ? "Ocultar categoria" : "Mostrar categoria"}
                              />
                            </div>
                          </div>
                        </CardHeader>
                        
                        <CardContent>
                          <p className="text-sm text-gray-500">
                            {category.description || "Sem descrição"}
                          </p>
                        </CardContent>
                        
                        <CardFooter className="flex justify-end gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              setSelectedCategory(category);
                              setEditCategory({
                                name: category.name,
                                description: category.description || '',
                                is_active: category.is_active,
                                sort_order: category.sort_order
                              });
                              setIsEditingCategory(true);
                            }}
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Editar
                          </Button>
                          
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={() => {
                              setSelectedCategory(category);
                              setIsDeletingCategory(true);
                            }}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Excluir
                          </Button>
                        </CardFooter>
                      </Card>
                    ))
                  ) : (
                    <div className="col-span-full text-center py-10">
                      <p className="text-gray-500">Nenhuma categoria cadastrada.</p>
                      <p className="text-gray-500 mt-2">Clique em "Adicionar Categoria" para criar sua primeira categoria.</p>
                    </div>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="products">
                <Card className="mb-8">
                  <CardHeader>
                    <CardTitle>Gerenciar Produtos</CardTitle>
                    <CardDescription>
                      Adicione, edite ou remova produtos do seu menu.
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-2">
                        <Label htmlFor="categoryFilter">Filtrar por categoria:</Label>
                        <Select 
                          value={selectedFilterCategory} 
                          onValueChange={(value) => setSelectedFilterCategory(value)}
                        >
                          <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Todas as categorias" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Todas as categorias</SelectItem>
                            {categories.map(category => (
                              <SelectItem key={category.id} value={category.id}>
                                {category.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <Button onClick={() => setIsAddingProduct(true)}>
                        <Plus className="mr-2 h-4 w-4" />
                        Adicionar Produto
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {filteredProducts.length > 0 ? (
                        filteredProducts.map(product => {
                          const category = categories.find(c => c.id === product.category_id);
                          return (
                            <Card key={product.id} className={!(product.is_active !== false) ? "opacity-60 border-dashed" : ""}>
                              <CardHeader>
                                <div className="flex justify-between items-center">
                                  <div>
                                    <CardTitle>{product.name}</CardTitle>
                                    <CardDescription>
                                      R$ {product.price.toFixed(2)}
                                    </CardDescription>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <span className="text-xs text-gray-500">
                                      {(product.is_active !== false) ? "Disponível" : "Indisponível"}
                                    </span>
                                    <Button 
                                      variant="ghost" 
                                      size="sm" 
                                      className="p-0 h-auto" 
                                      onClick={() => handleToggleProductVisibility(product)}
                                    >
                                      {(product.is_active !== false) ? (
                                        <Eye className="h-4 w-4" />
                                      ) : (
                                        <EyeOff className="h-4 w-4" />
                                      )}
                                    </Button>
                                  </div>
                                </div>
                              </CardHeader>
                              
                              <CardContent>
                                <p className="text-sm text-gray-500 mb-2">
                                  {product.description || "Sem descrição"}
                                </p>
                                {category && (
                                  <div className="inline-block bg-gray-100 rounded-full px-3 py-1 text-xs">
                                    {category.name}
                                  </div>
                                )}
                              </CardContent>
                              
                              <CardFooter className="flex justify-end gap-2">
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => {
                                    setSelectedProduct(product);
                                    setEditProduct({
                                      name: product.name,
                                      description: product.description || '',
                                      price: product.price,
                                      categoryId: product.category_id || '',
                                      imageUrl: product.image_url || '',
                                      available: product.is_active !== false
                                    });
                                    setIsEditingProduct(true);
                                  }}
                                >
                                  <Edit className="mr-2 h-4 w-4" />
                                  Editar
                                </Button>
                                
                                <Button 
                                  variant="destructive" 
                                  size="sm"
                                  onClick={() => deleteProduct(product.id)}
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Remover
                                </Button>
                              </CardFooter>
                            </Card>
                          );
                        })
                      ) : (
                        <div className="col-span-full text-center py-10">
                          <p className="text-gray-500">Nenhum produto encontrado.</p>
                          {selectedFilterCategory !== 'all' ? (
                            <p className="text-gray-500 mt-2">Tente selecionar outra categoria ou adicionar produtos a esta categoria.</p>
                          ) : categories.length === 0 ? (
                            <p className="text-gray-500 mt-2">Crie pelo menos uma categoria antes de adicionar produtos.</p>
                          ) : (
                            <p className="text-gray-500 mt-2">Clique em "Adicionar Produto" para criar seu primeiro produto.</p>
                          )}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* Modal para adicionar produto */}
              <Dialog open={isAddingProduct} onOpenChange={setIsAddingProduct}>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Adicionar Produto</DialogTitle>
                    <CardDescription>
                      Adicione um novo produto ao seu menu.
                    </CardDescription>
                  </DialogHeader>
                  
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="name" className="text-right">
                        Nome
                      </Label>
                      <Input
                        id="name"
                        value={newProduct.name}
                        onChange={e => setNewProduct({ ...newProduct, name: e.target.value })}
                        className="col-span-3"
                      />
                    </div>
                    
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="description" className="text-right">
                        Descrição
                      </Label>
                      <Textarea
                        id="description"
                        value={newProduct.description}
                        onChange={e => setNewProduct({ ...newProduct, description: e.target.value })}
                        className="col-span-3"
                      />
                    </div>
                    
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="price" className="text-right">
                        Preço
                      </Label>
                      <Input
                        id="price"
                        type="number"
                        value={newProduct.price}
                        onChange={e => setNewProduct({ ...newProduct, price: parseFloat(e.target.value) })}
                        className="col-span-3"
                      />
                    </div>
                    
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="categoryId" className="text-right">
                        Categoria
                      </Label>
                      <Select onValueChange={(value) => setNewProduct({ ...newProduct, categoryId: value })}>
                        <SelectTrigger className="col-span-3">
                          <SelectValue placeholder="Selecione uma categoria" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map(category => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="imageUrl" className="text-right">
                        URL da Imagem
                      </Label>
                      <Input
                        id="imageUrl"
                        type="text"
                        value={newProduct.imageUrl}
                        onChange={e => setNewProduct({ ...newProduct, imageUrl: e.target.value })}
                        className="col-span-3"
                      />
                    </div>
                  </div>
                  
                  <DialogFooter>
                    <Button type="submit" onClick={handleAddProduct}>
                      Adicionar Produto
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              
              {/* Modal para editar produto */}
              <Dialog open={isEditingProduct} onOpenChange={setIsEditingProduct}>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Editar Produto</DialogTitle>
                    <CardDescription>
                      Edite os detalhes do produto selecionado.
                    </CardDescription>
                  </DialogHeader>
                  
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="name" className="text-right">
                        Nome
                      </Label>
                      <Input
                        id="name"
                        defaultValue={editProduct.name}
                        onChange={e => setEditProduct({ ...editProduct, name: e.target.value })}
                        className="col-span-3"
                      />
                    </div>
                    
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="description" className="text-right">
                        Descrição
                      </Label>
                      <Textarea
                        id="description"
                        defaultValue={editProduct.description}
                        onChange={e => setEditProduct({ ...editProduct, description: e.target.value })}
                        className="col-span-3"
                      />
                    </div>
                    
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="price" className="text-right">
                        Preço
                      </Label>
                      <Input
                        id="price"
                        type="number"
                        defaultValue={editProduct.price}
                        onChange={e => setEditProduct({ ...editProduct, price: parseFloat(e.target.value) })}
                        className="col-span-3"
                      />
                    </div>
                    
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="categoryId" className="text-right">
                        Categoria
                      </Label>
                      <Select 
                        defaultValue={editProduct.categoryId} 
                        onValueChange={(value) => setEditProduct({ ...editProduct, categoryId: value })}
                      >
                        <SelectTrigger className="col-span-3">
                          <SelectValue placeholder="Selecione uma categoria" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map(category => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="imageUrl" className="text-right">
                        URL da Imagem
                      </Label>
                      <Input
                        id="imageUrl"
                        type="text"
                        defaultValue={editProduct.imageUrl}
                        onChange={e => setEditProduct({ ...editProduct, imageUrl: e.target.value })}
                        className="col-span-3"
                      />
                    </div>
                    
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="available" className="text-right">
                        Disponível
                      </Label>
                      <Switch 
                        id="available"
                        defaultChecked={editProduct.available}
                        onCheckedChange={(checked) => setEditProduct({ ...editProduct, available: checked })}
                      />
                    </div>
                  </div>
                  
                  <DialogFooter>
                    <Button type="submit" onClick={handleUpdateProduct}>
                      Salvar Alterações
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              
              {/* Modal para adicionar categoria */}
              <Dialog open={isAddingCategory} onOpenChange={setIsAddingCategory}>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Adicionar Categoria</DialogTitle>
                    <CardDescription>
                      Adicione uma nova categoria ao seu menu.
                    </CardDescription>
                  </DialogHeader>
                  
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="name" className="text-right">
                        Nome
                      </Label>
                      <Input
                        id="name"
                        value={newCategory.name}
                        onChange={e => setNewCategory({ ...newCategory, name: e.target.value })}
                        className="col-span-3"
                      />
                    </div>
                    
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="description" className="text-right">
                        Descrição
                      </Label>
                      <Textarea
                        id="description"
                        value={newCategory.description}
                        onChange={e => setNewCategory({ ...newCategory, description: e.target.value })}
                        className="col-span-3"
                      />
                    </div>
                  </div>
                  
                  <DialogFooter>
                    <Button type="submit" onClick={handleAddCategory}>
                      Adicionar Categoria
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              
              {/* Modal para editar categoria */}
              <Dialog open={isEditingCategory} onOpenChange={setIsEditingCategory}>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Editar Categoria</DialogTitle>
                    <CardDescription>
                      Edite os detalhes da categoria selecionada.
                    </CardDescription>
                  </DialogHeader>
                  
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="editCategoryName" className="text-right">
                        Nome
                      </Label>
                      <Input
                        id="editCategoryName"
                        defaultValue={editCategory.name}
                        onChange={e => setEditCategory({ ...editCategory, name: e.target.value })}
                        className="col-span-3"
                      />
                    </div>
                    
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="editCategoryDescription" className="text-right">
                        Descrição
                      </Label>
                      <Textarea
                        id="editCategoryDescription"
                        defaultValue={editCategory.description}
                        onChange={e => setEditCategory({ ...editCategory, description: e.target.value })}
                        className="col-span-3"
                      />
                    </div>
                    
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="editCategoryActive" className="text-right">
                        Visível
                      </Label>
                      <Switch 
                        id="editCategoryActive"
                        defaultChecked={editCategory.is_active}
                        onCheckedChange={(checked) => setEditCategory({ ...editCategory, is_active: checked })}
                      />
                    </div>
                  </div>
                  
                  <DialogFooter>
                    <Button type="submit" onClick={handleUpdateCategory}>
                      Salvar Alterações
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              
              {/* Modal para deletar categoria */}
              <Dialog open={isDeletingCategory} onOpenChange={setIsDeletingCategory}>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Remover Categoria</DialogTitle>
                    <CardDescription>
                      Tem certeza que deseja excluir a categoria "{selectedCategory?.name}"?
                      {products.some(p => p.category_id === selectedCategory?.id) && (
                        <div className="text-red-500 mt-2">
                          Atenção: Esta categoria contém produtos. Remover esta categoria não excluirá os produtos associados,
                          mas eles ficarão sem categoria.
                        </div>
                      )}
                    </CardDescription>
                  </DialogHeader>
                  
                  <DialogFooter>
                    <Button variant="secondary" onClick={() => setIsDeletingCategory(false)}>
                      Cancelar
                    </Button>
                    <Button variant="destructive" onClick={handleDeleteCategory}>
                      Remover Categoria
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </Tabs>
          );
        } catch (error) {
          console.error("ProductsPage: Error rendering component:", error);
          return (
            <div className="w-full p-8 text-center">
              <h3 className="text-xl font-medium text-red-600 mb-4">Erro inesperado</h3>
              <p className="text-gray-500 mb-6">
                Ocorreu um erro ao renderizar a página de produtos. 
                {error instanceof Error ? ` Detalhes: ${error.message}` : ''}
              </p>
              <pre className="mt-4 p-4 bg-gray-100 rounded text-left text-xs overflow-auto max-h-60">
                {error instanceof Error ? error.stack : String(error)}
              </pre>
              <Button onClick={() => window.location.reload()} className="mt-4">Recarregar página</Button>
            </div>
          );
        }
      })()}
    </DashboardLayout>
  );
};

export default ProductsPage;
