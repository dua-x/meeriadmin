import React from "react";

type Size = { size: number | string ; stock: number };

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

  const handleSizeChange = (colorIndex: number, sizeIndex: number, field: "size" | "stock", newVal: number) => {
    const updated = [...value];
    updated[colorIndex].sizes[sizeIndex][field] = newVal;
    onChange(updated);
  };

  return (
    <div className="space-y-4">
      {value.map((detail, i) => (
        <div key={i} className="border p-4 rounded-xl bg-white shadow-sm space-y-3">
          <div className="flex gap-2 items-center">
            <label className="text-sm">Color:</label>
            <input
              type="text"
              className="border rounded px-2 py-1 text-sm"
              value={detail.color}
              onChange={(e) => handleColorChange(i, e.target.value)}
            />
            <div className="w-5 h-5 rounded-full border" style={{ backgroundColor: detail.color }} />
          </div>

          <table className="w-full text-sm border">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-2 py-1">Size</th>
                <th className="px-2 py-1">Stock</th>
              </tr>
            </thead>
            <tbody>
              {detail.sizes.map((s, j) => (
                <tr key={j}>
                  <td className="px-2 py-1">
                    <input
                      type="number"
                      value={s.size}
                      className="border rounded px-2 py-1 w-full"
                      onChange={(e) => handleSizeChange(i, j, "size", parseInt(e.target.value))}
                    />
                  </td>
                  <td className="px-2 py-1">
                    <input
                      type="number"
                      value={s.stock}
                      className="border rounded px-2 py-1 w-full"
                      onChange={(e) => handleSizeChange(i, j, "stock", parseInt(e.target.value))}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
};
