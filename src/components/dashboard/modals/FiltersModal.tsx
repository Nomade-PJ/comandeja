import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface FiltersModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: "orders" | "products" | "customers";
  onApplyFilters?: (filters: any) => void;
  initialFilters?: {
    status?: string;
    category?: string;
    dateFrom?: Date;
    dateTo?: Date;
    minValue?: string;
    maxValue?: string;
  };
}

const FiltersModal = ({ open, onOpenChange, type, onApplyFilters, initialFilters }: FiltersModalProps) => {
  const [status, setStatus] = useState(initialFilters?.status || "");
  const [dateFrom, setDateFrom] = useState<Date | undefined>(initialFilters?.dateFrom);
  const [dateTo, setDateTo] = useState<Date | undefined>(initialFilters?.dateTo);
  const [category, setCategory] = useState(initialFilters?.category || "");
  const [minValue, setMinValue] = useState(initialFilters?.minValue || "");
  const [maxValue, setMaxValue] = useState(initialFilters?.maxValue || "");

  // Atualizar estados quando os valores iniciais mudarem
  useEffect(() => {
    if (initialFilters) {
      setStatus(initialFilters.status || "");
      setDateFrom(initialFilters.dateFrom);
      setDateTo(initialFilters.dateTo);
      setCategory(initialFilters.category || "");
      setMinValue(initialFilters.minValue || "");
      setMaxValue(initialFilters.maxValue || "");
    }
  }, [initialFilters]);

  const handleApplyFilters = () => {
    const filters: any = {};
    
    // Adicionar apenas os filtros com valores
    if (status) filters.status = status;
    if (dateFrom) filters.dateFrom = dateFrom;
    if (dateTo) filters.dateTo = dateTo;
    if (category) filters.category = category;
    if (minValue) filters.minValue = minValue;
    if (maxValue) filters.maxValue = maxValue;
    
    // Chamar o callback com os filtros aplicados
    if (onApplyFilters) {
      onApplyFilters(filters);
    }
    
    onOpenChange(false);
  };

  const handleClearFilters = () => {
    setStatus("");
    setDateFrom(undefined);
    setDateTo(undefined);
    setCategory("");
    setMinValue("");
    setMaxValue("");
    
    // Chamar o callback com os filtros limpos
    if (onApplyFilters) {
      onApplyFilters({});
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Filtros</DialogTitle>
          <DialogDescription>
            Configure os filtros para refinar sua busca
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {type === "orders" && (
            <div className="space-y-2">
              <Label htmlFor="status">Status do Pedido</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos os status</SelectItem>
                  <SelectItem value="pending">Pendente</SelectItem>
                  <SelectItem value="confirmed">Confirmado</SelectItem>
                  <SelectItem value="preparing">Preparando</SelectItem>
                  <SelectItem value="ready">Pronto</SelectItem>
                  <SelectItem value="out_for_delivery">Em rota</SelectItem>
                  <SelectItem value="delivered">Entregue</SelectItem>
                  <SelectItem value="cancelled">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
          
          {type === "products" && (
            <div className="space-y-2">
              <Label htmlFor="category">Categoria</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas as categorias" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todas as categorias</SelectItem>
                  <SelectItem value="pratos-principais">Pratos Principais</SelectItem>
                  <SelectItem value="entradas">Entradas</SelectItem>
                  <SelectItem value="sobremesas">Sobremesas</SelectItem>
                  <SelectItem value="bebidas">Bebidas</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Data Inicial</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateFrom ? format(dateFrom, "dd/MM/yyyy", { locale: ptBR }) : "Selecionar"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={dateFrom}
                    onSelect={setDateFrom}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label>Data Final</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateTo ? format(dateTo, "dd/MM/yyyy", { locale: ptBR }) : "Selecionar"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={dateTo}
                    onSelect={setDateTo}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {(type === "orders" || type === "products") && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="minValue">Valor Mínimo</Label>
                <Input
                  id="minValue"
                  type="number"
                  value={minValue}
                  onChange={(e) => setMinValue(e.target.value)}
                  placeholder="0,00"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxValue">Valor Máximo</Label>
                <Input
                  id="maxValue"
                  type="number"
                  value={maxValue}
                  onChange={(e) => setMaxValue(e.target.value)}
                  placeholder="0,00"
                />
              </div>
            </div>
          )}
        </div>
        <DialogFooter className="flex justify-between">
          <Button variant="outline" onClick={handleClearFilters}>
            Limpar Filtros
          </Button>
          <div className="space-x-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button onClick={handleApplyFilters} className="bg-gradient-brand hover:from-brand-700 hover:to-brand-600 text-white">
              Aplicar Filtros
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default FiltersModal;
