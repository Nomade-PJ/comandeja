import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, FolderPlus, ArrowUp, ArrowDown, Edit, Trash2, GripVertical } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useCategories } from "@/hooks/useCategories";
import NewCategoryModal from "@/components/dashboard/modals/NewCategoryModal";
import EditCategoryModal from "@/components/dashboard/modals/EditCategoryModal";
import DeleteCategoryModal from "@/components/dashboard/modals/DeleteCategoryModal";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

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

const DashboardCategories = () => {
  const [showNewCategoryModal, setShowNewCategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [showEditCategoryModal, setShowEditCategoryModal] = useState(false);
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null);
  const [showDeleteCategoryModal, setShowDeleteCategoryModal] = useState(false);
  const { categories, loading, moveCategory } = useCategories();

  const handleMoveCategory = async (id: string, direction: 'up' | 'down') => {
    await moveCategory(id, direction);
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setShowEditCategoryModal(true);
  };

  const handleDeleteCategory = (category: Category) => {
    setDeletingCategory(category);
    setShowDeleteCategoryModal(true);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500">Carregando categorias...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Categorias</h2>
            <p className="text-muted-foreground">
              Organize as categorias do seu cardápio
            </p>
          </div>
          <Button 
            className="bg-gradient-brand hover:from-brand-700 hover:to-brand-600 text-white"
            onClick={() => setShowNewCategoryModal(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Nova Categoria
          </Button>
        </div>

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
                  Use os botões para reorganizar as categorias. A ordem aqui será a mesma exibida no cardápio do cliente.
                </div>
                <div className="grid gap-2">
                  {categories.map((category, index) => (
                    <div 
                      key={category.id} 
                      className="p-4 border rounded-md shadow-sm bg-white flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3 flex-grow">
                        <div className="text-gray-400 cursor-grab">
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
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

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
    </DashboardLayout>
  );
};

export default DashboardCategories; 