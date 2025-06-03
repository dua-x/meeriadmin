import { ColumnDef } from "@tanstack/react-table"

export const columns: ColumnDef<UserType, unknown>[] = [
  {
    accessorKey: "username",
    header: "Username",
    cell: ({ row }) => (
      <div className="font-medium">
        {row.getValue("username")}
      </div>
    ),
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => row.getValue("email") || 'N/A',
  },
  {
    accessorKey: "wishlist",
    header: "Wishlist Items",
    cell: ({ row }) => {
      const wishlist = row.getValue("wishlist") as string[] | undefined
      return wishlist ? wishlist.length : 0
    },
  },
  {
    accessorKey: "createdAt",
    header: "Join Date",
    cell: ({ row }) => {
      const dateStr = row.getValue("createdAt") as string
      const date = new Date(dateStr)
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    },
  },
]