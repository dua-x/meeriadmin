'use client';
import { useState } from "react";
import Image from "next/image";
import { ProductDetailsMiniTable } from "@/components/ui/ProductDetailsEditor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pencil, Trash2, X } from "lucide-react";
import { Switch } from "@/components/ui/Switch";
import {
  ColumnDef,
  ColumnFiltersState,
  getFilteredRowModel,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { motion } from "framer-motion";
import { ComboBox } from "@/components/ui/select"; // adjust the path to match your project structure
export interface ComboBoxProps {
  value: string;
  onChange: (val: string) => void;
  options: { label: string; value: string }[];
  placeholder?: string;
}

interface DataWithId {
  _id: string;
  [key: string]: unknown;
}

interface DataTableProps<TData extends DataWithId, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  searchKey: string;
  onDeleteAction?: (id: string) => void;
  onUpdateAction?: (updatedData: TData) => void;
  showActions?: boolean;
  onRowClick?: (data: TData) => void;
  detailsTitle?: string;
  renderDetails?: (data: TData) => React.ReactNode;
  allowEdit?: boolean; // Add this new prop
  categories?: CollectionType[];
  isLoadingCategories?: boolean;
}

export function DataTable<TData extends DataWithId, TValue>({
  columns,
  data,
  searchKey,
  onDeleteAction, 
  onUpdateAction,
  showActions = true,
  onRowClick,
  detailsTitle = "Details",
  renderDetails,
  allowEdit = true, 
  categories,
  isLoadingCategories = false,

}: DataTableProps<TData, TValue>) {
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [selectedRow, setSelectedRow] = useState<TData | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<TData | null>(null);
const [editableData, setEditableData] = useState<TData | null>(allowEdit ? null : null);  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [currentImage, setCurrentImage] = useState<string | null>(null);
const [viewMode, setViewMode] = useState<"details" | "edit">(allowEdit ? "details" : "details");

const displayCategories = categories || [];
 console.log("Categories received in DataTable:", categories);
const handleInputChange = (key: string, value: unknown) => {
  if (editableData) {
    // Special handling for category to ensure proper typing
    if (key === 'category') {
      setEditableData({
        ...editableData,
        [key]: value as { _id: string, name?: string } | string | null
      });
    } else {
      setEditableData({ ...editableData, [key]: value });
    }
  }
};

  const handleSave = () => {
    if (editableData && onUpdateAction) {
      onUpdateAction(editableData);
      setSelectedRow(null);
      setEditableData(null);
    }
  };

  const handleDeleteClick = (product: TData) => {
    if (!onDeleteAction) return;
    setSelectedProduct(product);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (!onDeleteAction) return;
    if (deletePassword === (selectedProduct?._id as string)) {
      onDeleteAction(selectedProduct?._id as string);
      setSelectedProduct(null);
      setIsDeleteDialogOpen(false);
      setDeletePassword("");
    } else {
      alert("Incorrect password. Please try again.");
    }
  };

  const handleImageClick = (image: string) => {
    setCurrentImage(image);
    setImageDialogOpen(true);
  };

  const handleSpecificImageDelete = (index: number) => {
    if (editableData) {
      const updatedImages = (editableData.images as string[]).filter((_, i) => i !== index);
      setEditableData({ ...editableData, images: updatedImages });
    }
  };

  const handleAddImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (editableData && e.target.files) {
      const newImages = Array.from(e.target.files).map((file) => URL.createObjectURL(file));
      setEditableData({ ...editableData, images: [...(editableData.images as string[]), ...newImages] });
    }
  };

  const handleImageDelete = () => {
    if (editableData && currentImage) {
      const updatedImages = (editableData.images as string[]).filter((img) => img !== currentImage);
      setEditableData({ ...editableData, images: updatedImages });
      setImageDialogOpen(false);
    }
  };

  const handleIconDelete = () => {
    if (editableData) {
      setEditableData({ ...editableData, icon: "" });
      setImageDialogOpen(false);
    }
  };

  const handleAddIcon = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (editableData && e.target.files && e.target.files[0]) {
      const newIconUrl = URL.createObjectURL(e.target.files[0]);
      setEditableData({ ...editableData, icon: newIconUrl });
    }
  };

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: { columnFilters },
  });

  const handleRowClick = (rowData: TData, e: React.MouseEvent) => {
  if ((e.target as HTMLElement).closest('button, a, select, input, .no-row-click')) {
    return;
  }
  
  if (onRowClick) {
    onRowClick(rowData);
  } else {
    setSelectedRow(rowData);
    if (allowEdit) {
      setEditableData(rowData);
    }
  }
};

  const renderDefaultDetails = (data: TData) => {
    return (
      <div className="space-y-4">
        {Object.entries(data).map(([key, value]) => {
          if (key === "_id") return null;
          
          if (key === "images" && Array.isArray(value)) {
            return (
              <div key={key} className="grid grid-cols-3 gap-4">
                <div className="col-span-1 font-medium text-gray-500 capitalize">
                  {key.replace(/_/g, " ")}
                </div>
                <div className="col-span-2 flex flex-wrap gap-2">
                  {value.map((imgSrc, index) => (
                    <motion.div 
                      key={index}
                      whileHover={{ scale: 1.05 }}
                      className="relative w-20 h-20"
                    >
                      <Image
                        src={imgSrc as string}
                        alt={`Image ${index + 1}`}
                        fill
                        className="object-cover rounded-lg border cursor-pointer"
                        onClick={() => handleImageClick(imgSrc as string)}
                        unoptimized={imgSrc.startsWith('blob:')}
                      />
                    </motion.div>
                  ))}
                </div>
              </div>
            );
          }
          
          if (key === "icon" && typeof value === "string") {
            return (
              <div key={key} className="grid grid-cols-3 gap-4">
                <div className="col-span-1 font-medium text-gray-500 capitalize">
                  {key.replace(/_/g, " ")}
                </div>
                <div className="col-span-2">
                  <motion.div 
                    whileHover={{ scale: 1.05 }}
                    className="relative w-20 aspect-[3/4]"
                  >
                    <Image
                      src={value}
                      alt="Icon"
                      fill
                      className="object-cover rounded-lg border cursor-pointer"
                      onClick={() => handleImageClick(value)}
                      unoptimized={value.startsWith('blob:')}
                    />
                  </motion.div>
                </div>
              </div>
            );
          }
          
          return (
            <div key={key} className="grid grid-cols-3 gap-4">
              <div className="col-span-1 font-medium text-gray-500 capitalize">
                {key.replace(/_/g, " ")}
              </div>
              <div className="col-span-2 break-words">
                {Array.isArray(value) ? (
                  <ul className="list-disc pl-5">
                    {value.map((item, index) => (
                      <li key={index}>{String(item)}</li>
                    ))}
                  </ul>
                ) : typeof value === "object" && value !== null ? (
                  JSON.stringify(value, null, 2)
                ) : (
                  String(value)
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="py-5 px-4 md:px-6">
      {/* Delete Confirmation Dialog */}
      {showActions && onDeleteAction && (
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Deletion</DialogTitle>
              <DialogDescription>
                This action cannot be undone. This will permanently delete the item.
              </DialogDescription>
            </DialogHeader>
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <span className="text-sm font-medium text-gray-500">Product ID:</span>
                <span className="col-span-3 text-sm font-mono p-2 bg-gray-100 rounded">
                  {selectedProduct?._id as string}
                </span>
              </div>
              <Input
                type="password"
                placeholder="Enter your password"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                className="mt-4"
              />
              <div className="flex justify-end gap-2 mt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setIsDeleteDialogOpen(false)}
                >
                  Cancel
                </Button>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button 
                    className="bg-red-600 text-white hover:bg-red-700" 
                    onClick={confirmDelete}
                  >
                    Delete
                  </Button>
                </motion.div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Image Preview Dialog */}
      <Dialog open={imageDialogOpen} onOpenChange={setImageDialogOpen}>
        <DialogContent className="max-w-[90vw] md:max-w-2xl">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="relative"
          >
            {currentImage && (
              <div className="relative aspect-square w-full max-h-[80vh]">
                <Image
                  src={currentImage}
                  alt="Enlarged preview"
                  fill
                  className="object-contain rounded-lg"
                  unoptimized={currentImage.startsWith('blob:')}
                />
              </div>
            )}
            <div className="mt-4 flex justify-end gap-2">
              <Button 
                variant="outline" 
                onClick={() => setImageDialogOpen(false)}
              >
                Close
              </Button>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button 
                  variant="destructive"
                  onClick={handleImageDelete}
                >
                  Delete Image
                </Button>
              </motion.div>
            </div>
          </motion.div>
        </DialogContent>
      </Dialog>

      {/* Search Input */}
      <div className="flex items-center py-4">
        <Input
          placeholder="Search..."
          value={(table.getColumn(searchKey)?.getFilterValue() as string) ?? ""}
          onChange={(event) => table.getColumn(searchKey)?.setFilterValue(event.target.value)}
          className="w-full max-w-xs md:max-w-sm"
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border shadow-sm">
        <Table className="w-full min-w-[600px]">
          <TableHeader className="bg-gray-50">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="font-semibold text-gray-700">
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
                {showActions && <TableHead className="font-semibold text-gray-700">Actions</TableHead>}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <motion.tr
                  key={row.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={`hover:bg-gray-50 ${(onRowClick || showActions) ? 'cursor-pointer' : ''}`}
                  onClick={(e) => handleRowClick(row.original, e)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="break-words max-w-[150px] py-3">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                  {showActions && (
                    <TableCell className="flex space-x-2 py-3">
                      {allowEdit && (
                        <motion.button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedRow(row.original);
                            setEditableData(row.original);
                            setViewMode("edit");
                          }}
                          className="no-row-click"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <Pencil className="w-5 h-5 text-blue-600 hover:text-blue-800" />
                        </motion.button>
                      )}
                      {onDeleteAction && (
                        <motion.button
                          className="no-row-click hover:bg-red-50 p-1 rounded"
                          onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            handleDeleteClick(row.original);
                          }}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <Trash2 className="w-5 h-5 text-red-600 hover:text-red-800" />
                        </motion.button>
                      )}
                    </TableCell>
                  )}
                </motion.tr>
              ))
            ) : (
              <TableRow>
                <TableCell 
                  colSpan={columns.length + (showActions ? 1 : 0)} 
                  className="h-24 text-center text-gray-500"
                >
                  No results found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex flex-wrap justify-center md:justify-end gap-2 py-4">
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()} 
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
        </motion.div>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()} 
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </motion.div>
      </div>

      {/* Details/Edit Dialog */}
      {selectedRow && (
        <Dialog open={!!selectedRow} onOpenChange={() => setSelectedRow(null)}>
          <DialogContent className="sm:m-6 sm:max-w-sm md:max-w-2xl lg:max-w-4xl rounded-lg max-h-[90vh] overflow-y-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <DialogHeader>
                  <DialogTitle className="flex justify-between items-center">
                    <span>{detailsTitle}</span>
                    {allowEdit && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setViewMode(viewMode === "details" ? "edit" : "details")}
                      >
                        {viewMode === "details" ? "Edit" : "View Details"}
                      </Button>
                    )}
                  </DialogTitle>
                </DialogHeader>
              
              {!allowEdit || viewMode === "details" ? (
                <>
                  {renderDetails ? renderDetails(selectedRow) : renderDefaultDetails(selectedRow)}
                </>
              ) : (
                editableData && (
                  <>
                    <div className="max-h-[70vh] overflow-y-auto">
                      {Object.entries(editableData).map(([key, value]) => {
                        // Skip these fields only in edit mode
                        if (key === "_id" || key === "createdAt" || key === "updatedAt") return null;
                        
                        return (
                          <div key={key} className="flex flex-col py-2">
                            <label className="text-sm font-semibold capitalize break-words">
                              {key.replace(/_/g, " ")}
                            </label>
                
                            {key === "richDescription" ? (
                            <textarea
                              className="border border-gray-300 rounded-md px-3 py-2 text-sm w-full"
                              value={String(value)}
                              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                                handleInputChange(key, e.target.value)
                              }
                              rows={4}
                            />
                          ) : key === "IsFeatured" ? (
                            <div className="flex items-center gap-2">
                              <Switch
                                checked={Boolean(value)}
                                onCheckedChange={(checked: boolean) => handleInputChange(key, checked)}
                              />
                              <span className="text-sm">{value ? "On" : "Off"}</span>
                            </div>
                          ) : key === "category" ? (
                                <div className="mt-1">
                                  {isLoadingCategories ? (
                                    <select disabled className="border rounded px-3 py-2 w-full text-sm">
                                      <option>Loading categories...</option>
                                    </select>
                                  ) : displayCategories.length > 0 ? (
                                    <ComboBox
                                      value={
                                        editableData?.category && typeof editableData.category === 'object'
                                          ? (editableData.category as { _id: string })?._id
                                          : (editableData?.category as string) || ""
                                      }
                                      onChange={(val) => {
                                        const selectedCat = displayCategories.find(c => c._id === val);
                                        handleInputChange('category', selectedCat || null);
                                      }}
                                      options={displayCategories.map(cat => ({
                                        label: cat.name,
                                        value: cat._id,
                                      }))}
                                      placeholder="Select category"
                                    />
                                  ) : (
                                    <select disabled className="border rounded px-3 py-2 w-full text-sm">
                                      <option>No categories available</option>
                                    </select>
                                  )}
                                </div>
                          ) : key === "productdetail" ? (
                            <ProductDetailsMiniTable
                              value={value as ProductDetailType[]}
                              onChange={(updated: ProductDetailType[]) => handleInputChange(key, updated)}
                            />
                            
                          ) : key === "images" && Array.isArray(value) ? (
                              <div className="flex flex-wrap gap-2">
                                {value.map((imgSrc, index) => (
                                  <motion.div 
                                    key={index} 
                                    className="relative"
                                    whileHover={{ scale: 1.05 }}
                                  >
                                    <div className="relative w-20 aspect-[3/4]">
                                      <Image
                                        src={imgSrc as string}
                                        alt={`Image ${index + 1}`}
                                        fill
                                        className=" object-cover rounded-lg border"
                                        onClick={() => handleImageClick(imgSrc as string)}
                                        unoptimized={imgSrc.startsWith('blob:')}
                                      />
                                    </div>
                                    <motion.button
                                      whileHover={{ scale: 1.1 }}
                                      whileTap={{ scale: 0.9 }}
                                      className="absolute top-1 right-1 p-1 bg-white rounded-full no-row-click"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleSpecificImageDelete(index);
                                      }}
                                    >
                                      <X className="w-4 h-4 text-red-500" />
                                    </motion.button>
                                  </motion.div>
                                ))}
                                <motion.div
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                >
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      document.getElementById("image-input")?.click();
                                    }}
                                    className="h-20 w-20 flex items-center justify-center border border-dashed no-row-click"
                                  >
                                    Add Image
                                  </Button>
                                  <Input
                                    type="file"
                                    id="image-input"
                                    accept="image/*"
                                    multiple
                                    className="hidden"
                                    onChange={handleAddImage}
                                  />
                                </motion.div>
                              </div>
                            ) : key === "icon" && typeof value === "string" ? (
                              <div className="flex flex-col gap-2">
                                {value ? (
                                  <div className="flex items-center gap-2">
                                    <motion.div
                                      whileHover={{ scale: 1.05 }}
                                      className="relative w-20 aspect-[3/4]"
                                    >
                                      <Image
                                        src={value}
                                        alt="Icon"
                                        fill
                                        className="object-cover rounded-lg border cursor-pointer"
                                        onClick={() => handleImageClick(value)}
                                        unoptimized={value.startsWith('blob:')}
                                      />
                                    </motion.div>
                                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                      <Button
                                        variant="destructive"
                                        size="sm"
                                        className="no-row-click"
                                        onClick={handleIconDelete}
                                      >
                                        Delete Icon
                                      </Button>
                                    </motion.div>
                                  </div>
                                ) : (
                                  <div>
                                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        className="no-row-click"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          document.getElementById("icon-input")?.click();
                                        }}
                                      >
                                        Add Icon
                                      </Button>
                                    </motion.div>
                                    <Input
                                      type="file"
                                      id="icon-input"
                                      accept="image/*"
                                      className="hidden"
                                      onChange={handleAddIcon}
                                    />
                                  </div>
                                )}
                              </div>
                            ) : typeof value === "object" && value !== null ? (
                              <div className="text-sm text-gray-800 break-words">
                                {Array.isArray(value) ? value.join(", ") : JSON.stringify(value)}
                              </div>
                            ) : (
                              <Input
                                value={String(value)}
                                onChange={(e) => handleInputChange(key, e.target.value)}
                                placeholder={key}
                              />
                            )}
                          </div>
                        );
                      })}
                    </div>
                    <div className="flex justify-end gap-2 p-4">
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button variant="outline" onClick={() => setSelectedRow(null)}>
                          Cancel
                        </Button>
                      </motion.div>
                      {onDeleteAction && (
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                          <Button 
                            variant="destructive" 
                            onClick={() => {
                              setSelectedRow(null);
                              handleDeleteClick(selectedRow);
                            }}
                          >
                            Delete
                          </Button>
                        </motion.div>
                      )}
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button onClick={handleSave}>
                          Save
                        </Button>
                      </motion.div>
                    </div>
                  </>
                )
              )}
            </motion.div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}