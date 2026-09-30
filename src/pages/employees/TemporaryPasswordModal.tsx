import Modal from "../../components/Modal";

type TemporaryPasswordModalProps = {
  employeeName: string;
  password: string | null;
  onClose: () => void;
};

export default function TemporaryPasswordModal({
  employeeName,
  password,
  onClose,
}: TemporaryPasswordModalProps) {
  return (
    <Modal open={password !== null} onClose={onClose} title="Senha redefinida">
      <div className="space-y-4">
        <p className="text-sm text-muted">
          Passe esta senha provisória para <b>{employeeName}</b>. No próximo login vai ser pedido
          pra criar uma senha nova.
        </p>
        <div className="rounded-lg border bg-surface-muted p-3 text-center font-mono text-lg tracking-wider select-all">
          {password}
        </div>
        <p className="text-xs text-subtle">
          Anote agora: ela não aparece de novo depois de fechar.
        </p>
        <button onClick={onClose} className="btn btn-primary w-full">
          Fechar
        </button>
      </div>
    </Modal>
  );
}
