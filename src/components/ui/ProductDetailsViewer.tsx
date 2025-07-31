// components/ui/ProductDetailsViewer.tsx
import React from "react";


export const ProductDetailsViewer = ({ value }: { value: ProductDetailType[] }) => {
  if (!value?.length) return <p className="text-sm text-muted">No product details available.</p>;

  return (
    <div className="space-y-4">
      {value.map((detail, index) => (
        <div key={index} className="border rounded p-4">
          <p className="font-semibold mb-2">Color: {detail.color}</p>
          <table className="w-full text-sm border">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-2 py-1 text-left">Size</th>
                <th className="px-2 py-1 text-left">Stock</th>
              </tr>
            </thead>
            <tbody>
              {detail.sizes.map((sizeObj, idx) => (
                <tr key={idx} className="border-t">
                  <td className="px-2 py-1">{sizeObj.size}</td>
                  <td className="px-2 py-1">{sizeObj.stock}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
};
