import { Modal } from "../../../shared/components/Modal";
import { Spinner } from "../../../shared/components/Spinner";

interface DeleteProductModalProps {
  open: boolean;
  productName: string | null;
  isDeleting: boolean;
  error?: Error | null;
  onCancel: () => void;
  onConfirm: () => void;
}

export function DeleteProductModal({
  open,
  productName,
  isDeleting,
  error,
  onCancel,
  onConfirm,
}: DeleteProductModalProps) {
  return (
    <Modal open={open} title="Eliminar producto" maxWidth="sm">
      <div className="flex flex-col gap-5">
        <div className="border border-primary bg-primary/5 px-4 py-3 text-sm text-foreground">
          <p className="font-bold">
            ¿Eliminar &quot;{productName ?? "este producto"}&quot;?
          </p>
          <p className="mt-1 text-muted-foreground">
            Esta acción no se puede deshacer. El producto y su imagen asociada
            se eliminarán permanentemente.
          </p>
        </div>

        {error && (
          <div
            role="alert"
            aria-live="assertive"
            className="border border-primary bg-primary/5 px-4 py-3 text-sm font-medium text-primary"
          >
            {error instanceof Error
              ? error.message
              : "No se pudo eliminar el producto."}
          </div>
        )}

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            disabled={isDeleting}
            className="flex h-12 items-center justify-center border border-foreground bg-background px-6 text-sm font-bold uppercase tracking-wider text-foreground transition hover:bg-muted active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex h-12 items-center justify-center gap-2 bg-primary px-6 text-sm font-bold uppercase tracking-wider text-primary-foreground transition hover:bg-primary-hover active:scale-95 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isDeleting ? (
              <>
                <Spinner size="sm" className="text-primary-foreground" />
                <span>Eliminando…</span>
              </>
            ) : (
              <span>Eliminar</span>
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
}