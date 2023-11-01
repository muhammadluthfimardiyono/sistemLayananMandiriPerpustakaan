import { Button } from "flowbite-react";
import React from "react";
import { useNavigate } from "react-router-dom";

function DetailButton({ book }) {
  const navigate = useNavigate();

  return (
    <div className="flex justify-center items-center">
      <Button
        size={"xs"}
        onClick={() => {
          navigate(`/detail-buku/${book.kode_barcode}`);
        }}
      >
        Detail
      </Button>
    </div>
  );
}

export default DetailButton;
