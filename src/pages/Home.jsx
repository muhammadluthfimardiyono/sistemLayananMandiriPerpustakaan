import { Card } from "flowbite-react";
import React, { useEffect } from "react";
import Heading from "../components/Heading";
import { IoPersonCircle } from "react-icons/io5";
import { ImUpload2, ImDownload2 } from "react-icons/im";
import LogOutButton from "../components/LogOutButton";

function Home() {
  const storedData = localStorage.getItem("userData");
  const userData = JSON.parse(storedData);

  useEffect(() => {
    localStorage.removeItem("idTransaksi");
    localStorage.removeItem("scannedBooks");
    localStorage.removeItem("unscannedBooks");
    localStorage.removeItem("dataTransaksi");
    localStorage.removeItem("scannedCodes");
    localStorage.removeItem("bukuPinjamData");
    if (!localStorage.getItem("firstRender")) {
      localStorage.setItem("firstRender", "true");
      window.location.reload();
    }
  }, []);

  return (
    <div className="mx-auto mt-0 mb-20">
      <div className="flex justify-end px-12 bg-blue-800 py-4">
        <LogOutButton />
      </div>
      <Heading title={"Layanan Mandiri Perpustakaan"}></Heading>
      <div className="grid grid-cols-2 gap-10 w-3/4 mx-auto">
        <div className="col-span-2 w-1/2 justify-self-center p-6 bg-white rounded-lg dark:bg-gray-800 dark:border-gray-700">
          <div className="text-center flex justify-center flex-col items-center">
            <IoPersonCircle size="8rem" color="rgb(30,64,175)"></IoPersonCircle>
          </div>
          <h5 className="text-2xl text-center font-bold tracking-tight text-gray-900 dark:text-white">
            Selamat Datang, {userData.nama} !
          </h5>
        </div>
        <Card href="/scan-pinjam">
          <div className="text-center flex justify-center flex-col items-center">
            <ImUpload2 size="8rem" color="rgb(30,64,175)"></ImUpload2>
          </div>
          <h5 className="text-2xl text-center font-bold tracking-tight text-gray-900 dark:text-white">
            Layanan Peminjaman Buku Mandiri
          </h5>
        </Card>
        <Card href="/pengembalian-id">
          <div className="text-center flex justify-center flex-col items-center">
            <ImDownload2 size="8rem" color="rgb(30,64,175)"></ImDownload2>
          </div>
          <h5 className="text-2xl text-center font-bold tracking-tight text-gray-900 dark:text-white">
            Layanan Pengembalian Buku Mandiri
          </h5>
        </Card>
      </div>
    </div>
  );
}

export default Home;
