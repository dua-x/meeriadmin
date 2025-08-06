import React from "react";
import { Plus, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Size = { 
  size: string | number; 
  stock: number 
};

type ProductDetailType = {
  color: string;
  sizes: Size[];
};

type Props = {
  value: ProductDetailType[];
  onChange: (newValue: ProductDetailType[]) => void;
};

export const ProductDetailsMiniTable: React.FC<Props> = ({ value, onChange }) => {
  const handleColorChange = (index: number, newColor: string) => {
    const updated = [...value];
    updated[index].color = newColor;
    onChange(updated);
  };

  const handleSizeChange = (
    colorIndex: number, 
    sizeIndex: number, 
    field: keyof Size, 
    newVal: string | number
  ) => {
    const updated = [...value];
    updated[colorIndex].sizes[sizeIndex][field] = newVal as never;
    onChange(updated);
  };

  const addSize = (colorIndex: number) => {
    const updated = [...value];
    updated[colorIndex].sizes.push({ size: "", stock: 0 });
    onChange(updated);
  };

  const removeSize = (colorIndex: number, sizeIndex: number) => {
    const updated = [...value];
    updated[colorIndex].sizes.splice(sizeIndex, 1);
    onChange(updated);
  };

  const addColorVariant = () => {
    onChange([...value, { color: "", sizes: [{ size: "", stock: 0 }] }]);
  };

  const removeColorVariant = (colorIndex: number) => {
    const updated = [...value];
    updated.splice(colorIndex, 1);
    onChange(updated);
  };

  return (
    <div className="space-y-4">
      {value.map((detail, colorIndex) => (
        <div key={colorIndex} className="border p-4 rounded-lg bg-gray-50 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Input
                value={detail.color}
                onChange={(e) => handleColorChange(colorIndex, e.target.value)}
                placeholder="Color name"
                className="w-48"
              />
              {detail.color && (
                <div 
                  className="w-6 h-6 rounded-full border"
                  style={{ backgroundColor: detail.color }}
                />
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => removeColorVariant(colorIndex)}
              className="text-red-500 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-2">
            <div className="grid grid-cols-12 gap-2 text-sm font-medium text-gray-500">
              <div className="col-span-5">Size</div>
              <div className="col-span-5">Stock</div>
              <div className="col-span-2">Actions</div>
            </div>
            
            {detail.sizes.map((size, sizeIndex) => (
              <div key={sizeIndex} className="grid grid-cols-12 gap-2 items-center">
                <div className="col-span-5">
                  <Input
                    value={size.size}
                    onChange={(e) => handleSizeChange(colorIndex, sizeIndex, "size", e.target.value)}
                    placeholder="e.g., S, M, 36"
                  />
                </div>
                <div className="col-span-5">
                  <Input
                    type="number"
                    min="0"
                    value={size.stock}
                    onChange={(e) => handleSizeChange(
                      colorIndex, 
                      sizeIndex, 
                      "stock", 
                      parseInt(e.target.value) || 0
                    )}
                    placeholder="Quantity"
                  />
                </div>
                <div className="col-span-2 flex justify-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeSize(colorIndex, sizeIndex)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}

            <Button
              variant="outline"
              size="sm"
              onClick={() => addSize(colorIndex)}
              className="mt-2 w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Size
            </Button>
          </div>
        </div>
      ))}

      <Button
        variant="outline"
        onClick={addColorVariant}
        className="w-full mt-4"
      >
        <Plus className="h-4 w-4 mr-2" />
        Add Color Variant
      </Button>
    </div>
  );
};