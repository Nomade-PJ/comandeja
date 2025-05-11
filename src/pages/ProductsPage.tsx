
import React, { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useRestaurant, Product, Category } from '@/contexts/RestaurantContext';
import ProductCard from '@/components/ProductCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/components/ui/use-toast';

const ProductsPage = () => {
  const { products, categories, addProduct, updateProduct, deleteProduct, addCategory } = useRestaurant();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | 'all'>('all');
  
  // Product form dialog
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
  const [isNewProduct, setIsNewProduct] = useState(true);
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
  
  // Category dialog
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [categoryName, setCategoryName] = useState('');
  const [categoryDescription, setCategoryDescription] = useState('');
  
  // Product form state
  const [productName, setProductName] = useState('');
  const [productDescription, setProductDescription] = useState('');
  const [productPrice, setProductPrice] = useState('');
  const [productCategory, setProductCategory] = useState('');
  const [productImage, setProductImage] = useState('');
  const [productAvailable, setProductAvailable] = useState(true);
  
  // Filter products by category and search term
  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === 'all' || product.categoryId === selectedCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          product.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });
  
  // Open product form for editing
  const handleEditProduct = (product: Product) => {
    setCurrentProduct(product);
    setProductName(product.name);
    setProductDescription(product.description);
    setProductPrice(product.price.toString());
    setProductCategory(product.categoryId);
    setProductImage(product.imageUrl);
    setProductAvailable(product.available);
    setIsNewProduct(false);
    setIsProductDialogOpen(true);
  };
  
  // Open product form for creating
  const handleAddProductClick = () => {
    setCurrentProduct(null);
    setProductName('');
    setProductDescription('');
    setProductPrice('');
    setProductCategory(categories.length > 0 ? categories[0].id : '');
    setProductImage('');
    setProductAvailable(true);
    setIsNewProduct(true);
    setIsProductDialogOpen(true);
  };
  
  // Handle product form submission
  const handleProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const priceValue = parseFloat(productPrice);
    
    if (!productName || !productDescription || !productPrice || !productCategory) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }
    
    if (isNaN(priceValue) || priceValue <= 0) {
      toast({
        title: "Error",
        description: "Please enter a valid price.",
        variant: "destructive",
      });
      return;
    }
    
    const productData = {
      name: productName,
      description: productDescription,
      price: priceValue,
      categoryId: productCategory,
      imageUrl: productImage,
      available: productAvailable,
    };
    
    if (isNewProduct) {
      addProduct(productData);
      toast({
        title: "Success",
        description: "Product added successfully.",
      });
    } else if (currentProduct) {
      updateProduct({
        ...productData,
        id: currentProduct.id,
      });
      toast({
        title: "Success",
        description: "Product updated successfully.",
      });
    }
    
    setIsProductDialogOpen(false);
  };
  
  // Handle category form submission
  const handleCategorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!categoryName) {
      toast({
        title: "Error",
        description: "Please enter a category name.",
        variant: "destructive",
      });
      return;
    }
    
    addCategory({
      name: categoryName,
      description: categoryDescription,
    });
    
    toast({
      title: "Success",
      description: "Category added successfully.",
    });
    
    setCategoryName('');
    setCategoryDescription('');
    setIsCategoryDialogOpen(false);
  };
  
  // Delete product
  const handleDeleteProduct = () => {
    if (currentProduct) {
      deleteProduct(currentProduct.id);
      toast({
        title: "Success",
        description: "Product deleted successfully.",
      });
      setIsProductDialogOpen(false);
    }
  };
  
  return (
    <DashboardLayout title="Products">
      <div className="bg-white rounded-lg shadow-sm mb-8">
        <div className="p-4 border-b">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <div className="w-full md:w-1/2">
              <Input
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setIsCategoryDialogOpen(true)}>
                Add Category
              </Button>
              <Button onClick={handleAddProductClick}>
                Add Product
              </Button>
            </div>
          </div>
        </div>
        
        <Tabs 
          value={selectedCategory} 
          onValueChange={setSelectedCategory}
          className="w-full"
        >
          <div className="px-4 border-b overflow-x-auto">
            <TabsList className="h-12">
              <TabsTrigger value="all">All Products</TabsTrigger>
              {categories.map(category => (
                <TabsTrigger key={category.id} value={category.id}>
                  {category.name}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
          
          <TabsContent value="all" className="p-6">
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {filteredProducts.map(product => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    isAdmin={true}
                    onEdit={handleEditProduct}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500">No products found.</p>
                <Button variant="outline" className="mt-4" onClick={handleAddProductClick}>
                  Add your first product
                </Button>
              </div>
            )}
          </TabsContent>
          
          {categories.map(category => (
            <TabsContent key={category.id} value={category.id} className="p-6">
              {filteredProducts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {filteredProducts.map(product => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      isAdmin={true}
                      onEdit={handleEditProduct}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-500">No products in this category.</p>
                  <Button variant="outline" className="mt-4" onClick={handleAddProductClick}>
                    Add a product to {category.name}
                  </Button>
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>
      
      {/* Product Dialog */}
      <Dialog open={isProductDialogOpen} onOpenChange={setIsProductDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{isNewProduct ? 'Add New Product' : 'Edit Product'}</DialogTitle>
            <DialogDescription>
              {isNewProduct 
                ? 'Add a new product to your menu.' 
                : 'Make changes to your product here.'}
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleProductSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Name *
                </Label>
                <Input
                  id="name"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  className="col-span-3"
                  required
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">
                  Description *
                </Label>
                <Textarea
                  id="description"
                  value={productDescription}
                  onChange={(e) => setProductDescription(e.target.value)}
                  className="col-span-3"
                  required
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="price" className="text-right">
                  Price (R$) *
                </Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={productPrice}
                  onChange={(e) => setProductPrice(e.target.value)}
                  className="col-span-3"
                  required
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="category" className="text-right">
                  Category *
                </Label>
                <Select 
                  value={productCategory} 
                  onValueChange={setProductCategory}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select a category" />
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
                  Image URL
                </Label>
                <Input
                  id="imageUrl"
                  value={productImage}
                  onChange={(e) => setProductImage(e.target.value)}
                  className="col-span-3"
                  placeholder="https://example.com/image.jpg"
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="available" className="text-right">
                  Available
                </Label>
                <div className="flex items-center space-x-2 col-span-3">
                  <Switch
                    id="available"
                    checked={productAvailable}
                    onCheckedChange={setProductAvailable}
                  />
                  <Label htmlFor="available">
                    {productAvailable ? 'Yes' : 'No'}
                  </Label>
                </div>
              </div>
            </div>
            
            <DialogFooter className="gap-2 sm:gap-0">
              {!isNewProduct && (
                <Button 
                  type="button" 
                  variant="destructive" 
                  onClick={handleDeleteProduct}
                  className="mr-auto"
                >
                  Delete
                </Button>
              )}
              <Button type="button" variant="outline" onClick={() => setIsProductDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Save</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Category Dialog */}
      <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add New Category</DialogTitle>
            <DialogDescription>
              Create a new category for your menu.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleCategorySubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="categoryName" className="text-right">
                  Name *
                </Label>
                <Input
                  id="categoryName"
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  className="col-span-3"
                  required
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="categoryDescription" className="text-right">
                  Description
                </Label>
                <Textarea
                  id="categoryDescription"
                  value={categoryDescription}
                  onChange={(e) => setCategoryDescription(e.target.value)}
                  className="col-span-3"
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsCategoryDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Save</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default ProductsPage;
