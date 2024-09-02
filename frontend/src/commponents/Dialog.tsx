import { useRef } from "react";

export const DialogSample = () => {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const handleShowModal = () => dialogRef.current?.showModal();
  const handleCloseModal = () => dialogRef.current?.close();
  return (
    <>
      <button type="button" onClick={handleShowModal}>
        Show Modal
      </button>
      <dialog ref={dialogRef}>
        <h1>HELLO MODAL !!</h1>
        <button type="button" onClick={handleCloseModal}>
          Close Modal
        </button>
      </dialog>
    </>
  );
};
