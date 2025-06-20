import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useProducts } from "@/hooks/useProducts";
import { AlertTriangle } from "lucide-react";

interface Product {
  id: string;
  name: string;
}

interface DeleteProductModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product | null;
}

const DeleteProductModal = ({ open, onOpenChange, product }: DeleteProductModalProps) => {
  const [loading, setLoading] = useState(false);
  const { deleteProduct } = useProducts();
  
  const handleDelete = async () => {
    if (!product) return;
    
    setLoading(true);
    const success = await deleteProduct(product.id);
    
    if (success) {
      onOpenChange(false);
    }
    
    setLoading(false);
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            <DialogTitle>Confirmar Exclusão</DialogTitle>
          </div>
          <DialogDescription className="pt-2">
            Tem certeza que deseja excluir o produto <strong>{product?.name}</strong>?
            Essa ação não pode ser desfeita.
          </DialogDescription>
        </DialogHeader>
        
        <DialogFooter className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={loading}
          >
            {loading ? "Excluindo..." : "Excluir Produto"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteProductModal; 