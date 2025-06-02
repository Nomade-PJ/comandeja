import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useRestaurant } from '@/contexts/RestaurantContext';
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
import { Plus, Edit, Trash2 } from 'lucide-react';

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
    deleteCategory
  } = useRestaurant();
  
  console.log("ProductsPage: Restaurant:", currentRestaurant);
  console.log("ProductsPage: Products:", products);
  console.log("ProductsPage: Categories:", categories);
  
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
  
  // Add effect for debugging
  useEffect(() => {
    console.log("ProductsPage: Initial render");
    console.log("ProductsPage: Products length:", products.length);
    console.log("ProductsPage: Categories length:", categories.length);
    
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
  }, [products, categories, addProduct, updateProduct, deleteProduct, addCategory, deleteCategory]);
  
  // Function to add a new product
  const handleAddProduct = () => {
    if (!newProduct.name || !newProduct.price) {
      toast({
        title: "Dados incompletos",
        description: "Nome e preço são obrigatórios",
        variant: "destructive"
      });
      return;
    }
    
    const now = new Date();
    const productToAdd = {
      restaurant_id: currentRestaurant?.id || '',
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

    addProduct(productToAdd);
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

  // Function to add a new category
  const handleAddCategory = () => {
    if (!newCategory.name) {
      toast({
        title: "Nome obrigatório",
        description: "O nome da categoria é obrigatório",
        variant: "destructive"
      });
      return;
    }
    
    const now = new Date();
    const categoryToAdd = {
      restaurant_id: currentRestaurant?.id || '',
      name: newCategory.name,
      description: newCategory.description,
      is_active: true,
      sort_order: categories.length + 1,
      created_at: now,
      updated_at: now
    };

    addCategory(categoryToAdd);
    setNewCategory({
      name: '',
      description: ''
    });
    setIsAddingCategory(false);
  };
  
  // Function to delete a category
  const handleDeleteCategory = () => {
    if (selectedCategory) {
      deleteCategory(selectedCategory.id);
      setIsDeletingCategory(false);
    }
  };

  return (
    <DashboardLayout title="Produtos">
      {/* Error checking and loading fallback */}
      {(() => {
        try {
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

          // Return the normal component
          return (
            <>
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle>Gerenciar Produtos</CardTitle>
                  <CardDescription>
                    Adicione, edite ou remova produtos do seu menu.
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="flex justify-end">
                  <Button onClick={() => setIsAddingProduct(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Adicionar Produto
                  </Button>
                </CardContent>
              </Card>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.length > 0 ? (
                  products.map(product => (
                    <Card key={product.id}>
                      <CardHeader>
                        <CardTitle>{product.name}</CardTitle>
                        <CardDescription>
                          R$ {product.price.toFixed(2)}
                        </CardDescription>
                      </CardHeader>
                      
                      <CardContent>
                        <p className="text-sm text-gray-500">
                          {product.description}
                        </p>
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
                  ))
                ) : (
                  <div className="col-span-full"></div>
                )}
              </div>
              
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
                      <Select onValueChange={(value) => setEditProduct({ ...editProduct, categoryId: value })}>
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
              
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle>Gerenciar Categorias</CardTitle>
                  <CardDescription>
                    Adicione, edite ou remova categorias do seu menu.
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="flex justify-between items-center">
                  <Button onClick={() => setIsAddingCategory(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Adicionar Categoria
                  </Button>
                  
                  {categories.length > 0 && (
                    <Button 
                      variant="destructive"
                      onClick={() => {
                        setSelectedCategory(categories[0]);
                        setIsDeletingCategory(true);
                      }}
                      disabled={categories.length === 0}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Remover Categoria
                    </Button>
                  )}
                </CardContent>
              </Card>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categories.length > 0 ? (
                  categories.map(category => (
                    <Card key={category.id}>
                      <CardHeader>
                        <CardTitle>{category.name}</CardTitle>
                      </CardHeader>
                      
                      <CardContent>
                        <p className="text-sm text-gray-500">
                          {category.description}
                        </p>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="col-span-full"></div>
                )}
              </div>
              
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
              
              {/* Modal para deletar categoria */}
              <Dialog open={isDeletingCategory} onOpenChange={setIsDeletingCategory}>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Remover Categoria</DialogTitle>
                    <CardDescription>
                      Tem certeza que deseja remover a categoria "{selectedCategory?.name}"?
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
            </>
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
