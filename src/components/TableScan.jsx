import { Table, Button } from "flowbite-react";
import React from "react";

function TableScan({ scannedCodes }) {
  console.log(scannedCodes);
  return (
    <Table hoverable={true} className="w-full">
      <Table.Head>
        <Table.HeadCell>No.</Table.HeadCell>
        <Table.HeadCell>Pengarang</Table.HeadCell>
        <Table.HeadCell>Judul</Table.HeadCell>
        <Table.HeadCell>Penerbit</Table.HeadCell>
        <Table.HeadCell>Tahun Terbit</Table.HeadCell>
        <Table.HeadCell>Kode Buku</Table.HeadCell>
        <Table.HeadCell>Action</Table.HeadCell>
      </Table.Head>
      <Table.Body className="divide-y">
        {scannedCodes.map((code, index) => (
          <Table.Row
            className="bg-white dark:border-gray-700 dark:bg-gray-800"
            key={index}
          >
            {console.log(code)}
            <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
              {index + 1}
            </Table.Cell>
            <Table.Cell>{code.pengarang}</Table.Cell>
            <Table.Cell>{code.judul}</Table.Cell>
            <Table.Cell>{code.penerbit}</Table.Cell>
            <Table.Cell>{code.tahun_terbit}</Table.Cell>
            <Table.Cell>{code.code}</Table.Cell>
            <Table.Cell>
              <Button>Remove</Button>
            </Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table>
  );
}

export default TableScan;
