import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  createVehicleSchema,
  vehicleCategories,
  type CreateVehicleInput,
} from "@/lib/schemas"
import type { Vehicle } from "@/lib/api"

interface VehicleFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  vehicle?: Vehicle | null
  onSubmit: (data: CreateVehicleInput) => void
  isPending?: boolean
}

export function VehicleFormDialog({
  open,
  onOpenChange,
  vehicle,
  onSubmit,
  isPending,
}: VehicleFormDialogProps) {
  const isEditing = !!vehicle

  const form = useForm<CreateVehicleInput>({
    resolver: zodResolver(createVehicleSchema) as any,
    defaultValues: {
      maker: "",
      model: "",
      category: "Sedan",
      price: 0,
      quantity: 0,
      description: "",
      imageUrl: "",
    },
  })

  useEffect(() => {
    if (open) {
      if (vehicle) {
        form.reset({
          maker: vehicle.maker,
          model: vehicle.model,
          category: vehicle.category as CreateVehicleInput["category"],
          price: vehicle.price,
          quantity: vehicle.quantity,
          description: vehicle.description ?? "",
          imageUrl: vehicle.imageUrl ?? "",
        })
      } else {
        form.reset({
          maker: "",
          model: "",
          category: "Sedan",
          price: 0,
          quantity: 0,
          description: "",
          imageUrl: "",
        })
      }
    }
  }, [open, vehicle, form])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Vehicle" : "Add Vehicle"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update the vehicle details below."
              : "Fill in the details to add a new vehicle."}
          </DialogDescription>
        </DialogHeader>
        <form
          id="vehicle-form"
          onSubmit={form.handleSubmit(onSubmit as any)}
          className="grid gap-4"
        >
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="maker">Make *</Label>
              <Input
                id="maker"
                placeholder="e.g. Toyota"
                {...form.register("maker")}
              />
              {form.formState.errors.maker && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.maker.message}
                </p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="model">Model *</Label>
              <Input
                id="model"
                placeholder="e.g. Camry"
                {...form.register("model")}
              />
              {form.formState.errors.model && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.model.message}
                </p>
              )}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="category">Category *</Label>
              <Select
                value={form.watch("category")}
                onValueChange={(val) =>
                  form.setValue("category", val as CreateVehicleInput["category"], {
                    shouldValidate: true,
                  })
                }
              >
                <SelectTrigger id="category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {vehicleCategories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              {form.formState.errors.category && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.category.message}
                </p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="price">Price *</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                placeholder="0.00"
                {...form.register("price")}
              />
              {form.formState.errors.price && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.price.message}
                </p>
              )}
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="quantity">Quantity</Label>
            <Input
              id="quantity"
              type="number"
              placeholder="0"
              {...form.register("quantity")}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="imageUrl">Image URL</Label>
            <Input
              id="imageUrl"
              placeholder="https://..."
              {...form.register("imageUrl")}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              placeholder="Optional description"
              {...form.register("description")}
            />
          </div>
        </form>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button type="submit" form="vehicle-form" disabled={isPending}>
            {isPending ? "Saving..." : isEditing ? "Save Changes" : "Add Vehicle"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
