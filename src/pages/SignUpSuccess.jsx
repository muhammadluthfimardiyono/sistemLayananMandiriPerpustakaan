import React from "react";
import { useLocation } from "react-router-dom";
import Heading from "../components/Heading";
import { MdOutlineCheckCircleOutline } from "react-icons/md";
import { Button } from "flowbite-react";

function SignUpSuccess() {
  const location = useLocation();
  const username = location.state.username;

  return (
    <div className="flex justify-center flex-col items-center gap-10 my-5">
      <Heading title={"Pendaftaran Anggota Perpustakaan"}></Heading>
      <p className="text-xl">Pendaftaran Anggota Perpustakaan Telah Berhasil</p>
      <MdOutlineCheckCircleOutline
        size="15em"
        color="rgb(52,211,153)"
        className="text-center"
      ></MdOutlineCheckCircleOutline>
      <p className="text-xl font-bold">Selamat Datang, {username} !</p>
      <p className="text-xl">
        Silakan Login menggunakan akun yang sudah anda daftarkan
      </p>
      <Button href="/">Login</Button>
    </div>
  );
}

export default SignUpSuccess;
