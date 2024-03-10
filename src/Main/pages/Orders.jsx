import React, { useState, useEffect, useMemo } from "react";
import { Card } from "antd";
import "ag-grid-enterprise";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import MenuItem from "@mui/material/MenuItem";
import axios from "axios";
import { debounce } from "lodash";
import Button from "@mui/material/Button";
import RefreshIcon from "@mui/icons-material/Refresh";

const Orders = () => {
  const colDefs = [
    {
      field: "primaryImageUrl",
      headerName: "Image",
      headerTooltip: "Image",
      width: 100,
      cellRenderer: ({ value }) => {
        return <img alt="" style={{ width: 30, height: 30 }} src={value} />;
      },
    },
    {
      field: "sku",
      headerName: "SKU",
      headerTooltip: "SKU",
    },
    { field: "title", headerName: "Title", headerTooltip: "Title", width: 350 },
    {
      field: "code",
      headerName: "Article No",
      headerTooltip: "Article No",
      flex: 1,
    },
    { field: "size", headerName: "Size", headerTooltip: "Size", flex: 1 },
    { field: "color", headerName: "Color", headerTooltip: "Color", flex: 1 },
    {
      field: "available",
      headerName: "Stock Quantity",
      headerTooltip: "Stock Quantity",
      flex: 1,
      cellRenderer: (params) => {
        const { available = 0 } = params?.data || {};
        return available || 0;
      },
    },
    {
      headerName: "Action",
      width: 100,

      //   cellRenderer: (params) => {
      //     const { _id = "" } = params?.data || {};
      //     return (
      //       <div className="flex items-center gap-2">
      //         <button onClick={() => editMode(_id)}>
      //           <EditIcon sx={{ color: "#2e7d32" }} className="cursor-pointer" />
      //         </button>
      //         <button
      //           onClick={() => {
      //             deleteMode(_id);
      //           }}
      //         >
      //           <DeleteIcon sx={{ color: "red" }} className="cursor-pointer" />
      //         </button>
      //       </div>
      //     );
      //   },
    },
  ];
  const [defaultColDef] = useState({
    editable: false,
    sortable: true,
    filter: false,
    selectable: false,
  });
  return (
    <Card className="w-full h-[90%] relative">
      <div
        className="absolute"
        style={{ top: 0, bottom: 0, left: 0, right: 0 }}
      >
        <div className="ag-theme-quartz h-full p-4">
          <AgGridReact
            // ref={gridApi}
            rowData={[]}
            rowSelection="single"
            defaultColDef={defaultColDef}
            columnDefs={colDefs}
            // onGridReady={onGridReady}
            // getRowId={getRowId}
            // pagination={true}
            // paginationPageSize={100}
            // paginationPageSizeSelector={false}
          />
        </div>
      </div>
    </Card>
  );
};

export default Orders;
