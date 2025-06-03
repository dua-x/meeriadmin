"use client";
import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, X } from "lucide-react";
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
import { Input } from "../ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface DataWithId {
    _id: string;
    [key: string]: unknown;
}

interface DataTableProps<TData extends DataWithId, TValue> {
    columns: ColumnDef<TData, TValue>[];
    data: TData[];
    searchKey: string;
    editLinkBase?: string;
    onDeleteAction?: (id: string) => void;
    onUpdateAction?: (updatedData: TData) => void;
    showActions?: boolean;
    onRowClick?: (data: TData) => void;
    detailsTitle?: string; // Title for the details dialog
    renderDetails?: (data: TData) => React.ReactNode; // Custom render function for details
}

export function DataTable<TData extends DataWithId, TValue>({
    columns,
    data,
    searchKey,
    editLinkBase,
    onDeleteAction, 
    onUpdateAction,
    showActions = true,
    onRowClick,
    detailsTitle = "Details",
    renderDetails, // Custom details renderer
}: DataTableProps<TData, TValue>) {

    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [selectedRow, setSelectedRow] = useState<TData | null>(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [deletePassword, setDeletePassword] = useState("");
    const [selectedProduct, setSelectedProduct] = useState<TData | null>(null);
    const [editableData, setEditableData] = useState<TData | null>(null);
    const [imageDialogOpen, setImageDialogOpen] = useState(false);
    const [currentImage, setCurrentImage] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<"details" | "edit">("details"); // Track view mode

    const handleInputChange = (key: string, value: unknown) => {
        if (editableData) {
            setEditableData({ ...editableData, [key]: value });
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
        if (deletePassword === "younes@") {
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

    const handleRowClick = (rowData: TData) => {
        if (onRowClick) {
            onRowClick(rowData);
        } else {
            setSelectedRow(rowData);
            setEditableData(rowData);
            setViewMode("details"); // Default to details view
        }
    };

    const renderDefaultDetails = (data: TData) => {
        return (
            <div className="space-y-4">
                {Object.entries(data).map(([key, value]) => {
                    if (key === "_id") return null;
                    
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
            {showActions && onDeleteAction && (
                <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Confirm Deletion</DialogTitle>
                        </DialogHeader>
                        <div className="p-4">
                            <h1 className="text-lg font-semibold">
                                Do you really want to delete ?
                            </h1>
                            <Input
                                type="password"
                                placeholder="Enter your password"
                                value={deletePassword}
                                onChange={(e) => setDeletePassword(e.target.value)}
                                className="mt-4"
                            />
                            <div className="flex justify-end gap-2 mt-4">
                                <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                                    Cancel
                                </Button>
                                <Button className="bg-red-600 text-white" onClick={confirmDelete}>
                                    Delete
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            )}

            <div className="flex items-center py-4">
                <Input
                    placeholder="Search..."
                    value={(table.getColumn(searchKey)?.getFilterValue() as string) ?? ""}
                    onChange={(event) => table.getColumn(searchKey)?.setFilterValue(event.target.value)}
                    className="w-full max-w-xs md:max-w-sm"
                />
            </div>

            <div className="overflow-x-auto">
                <Table className="w-full min-w-[600px]">
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <TableHead key={header.id}>
                                        {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                                    </TableHead>
                                ))}
                                {showActions && <TableHead>Actions</TableHead>}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    className={`hover:bg-gray-100 ${(onRowClick || showActions) ? 'cursor-pointer' : ''}`}
                                    onClick={() => handleRowClick(row.original)}
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id} className="break-words max-w-[150px]">
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                    {showActions && (
                                        <TableCell className="flex space-x-2">
                                            {editLinkBase && (
                                                <Link href={`${editLinkBase}/${row.original._id}`} onClick={(e) => e.stopPropagation()}>
                                                    <Pencil className="w-5 h-5" />
                                                </Link>
                                            )}
                                            {onDeleteAction && (
                                                <Button
                                                    variant="ghost"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDeleteClick(row.original);
                                                    }}
                                                >
                                                    <Trash2 className="w-5 h-5" />
                                                </Button>
                                            )}
                                        </TableCell>
                                    )}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length + (showActions ? 1 : 0)} className="h-24 text-center">
                                    No results.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
                <Dialog open={imageDialogOpen} onOpenChange={setImageDialogOpen}>
                    <DialogContent>
                        <div className="relative">
                            <img src={currentImage ?? ""} alt="Enlarged" className="sm:m-6 sm:max-w-sm md:max-w-2xl rounded-lg" />
                            <Button variant="destructive" onClick={handleImageDelete}>
                                Delete Image
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="flex flex-wrap justify-center md:justify-end space-x-2 py-4">
                <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
                    Previous
                </Button>
                <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
                    Next
                </Button>
            </div>

            {selectedRow && (
                <Dialog open={!!selectedRow} onOpenChange={() => setSelectedRow(null)}>
                    <DialogContent className="sm:m-6 sm:max-w-sm md:max-w-2xl rounded-lg max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle className="flex justify-between items-center">
                                <span>{detailsTitle}</span>
                                {onUpdateAction && (
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
                        
                        {viewMode === "details" ? (
                            renderDetails ? renderDetails(selectedRow) : renderDefaultDetails(selectedRow)
                        ) : (
                            editableData && (
                                <>
                                    <div className="max-h-[70vh] overflow-y-auto">
                                        {Object.entries(editableData).map(([key, value]) =>
                                            key !== "_id" && (
                                                <div key={key} className="flex flex-col py-2">
                                                    <label className="text-sm font-semibold capitalize break-words">
                                                        {key.replace(/_/g, " ")}
                                                    </label>
                                    
                                                    {key === "images" && Array.isArray(value) ? (
                                                        <div className="flex flex-wrap gap-2">
                                                            {value.map((imgSrc, index) => (
                                                                <div key={index} className="relative">
                                                                    <img
                                                                        src={imgSrc as string}
                                                                        alt={`Image ${index + 1}`}
                                                                        className="w-20 h-20 object-cover rounded-lg border"
                                                                        onClick={() => handleImageClick(imgSrc as string)}
                                                                    />
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        className="absolute top-1 right-1 p-1 bg-white rounded-full"
                                                                        onClick={() => handleSpecificImageDelete(index)}
                                                                    >
                                                                        <X className="w-4 h-4 text-red-500" />
                                                                    </Button>
                                                                </div>
                                                            ))}
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => document.getElementById("image-input")?.click()}
                                                                className="h-20 w-20 flex items-center justify-center border border-dashed"
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
                                                        </div>
                                                    ) : key === "icon" && typeof value === "string" ? (
                                                        <div className="flex flex-col gap-2">
                                                            {value ? (
                                                                <div className="flex items-center gap-2">
                                                                    <img
                                                                        src={value}
                                                                        alt="Icon"
                                                                        className="w-20 h-20 object-cover rounded-lg border cursor-pointer"
                                                                        onClick={() => handleImageClick(value)}
                                                                    />
                                                                    <Button
                                                                        variant="destructive"
                                                                        size="sm"
                                                                        onClick={handleIconDelete}
                                                                    >
                                                                        Delete Icon
                                                                    </Button>
                                                                </div>
                                                            ) : (
                                                                <div>
                                                                    <Button
                                                                        variant="outline"
                                                                        size="sm"
                                                                        onClick={() => document.getElementById("icon-input")?.click()}
                                                                    >
                                                                        Add Icon
                                                                    </Button>
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
                                                    ) : key === "category" && typeof value === "object" && value !== null ? (
                                                        <div className="text-sm text-gray-800 break-words">
                                                            {"name" in value && typeof value.name === "string" ? value.name : "N/A"}
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
                                            )
                                        )}
                                    </div>
                                    <div className="flex justify-end gap-2 p-4">
                                        <Button variant="outline" onClick={() => setSelectedRow(null)}>
                                            Cancel
                                        </Button>
                                        {onDeleteAction && (
                                            <Button variant="destructive" onClick={() => onDeleteAction(selectedRow?._id as string)}>
                                                Delete
                                            </Button>
                                        )}
                                        <Button onClick={handleSave}>
                                            Save
                                        </Button>
                                    </div>
                                </>
                            )
                        )}
                    </DialogContent>
                </Dialog>
            )}
        </div>
    );
}