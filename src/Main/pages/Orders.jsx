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

const nodeAPIUrl = `http://localhost:5000/api/v1`;

const Orders = () => {
  const [rowData, setRowData] = useState([]);
  const colDefs = [
    {
      field: "orderNumber",
      width: 200,
      cellRenderer: "agGroupCellRenderer",
    },
    {
      field: "paymentStatus",
      width: 200,
    },
    {
      field: "localStatus",
      width: 200,
    },
    { field: "onlineStatus", width: 200 },
    {
      field: "orderedOn",
      width: 200,
    },
    { field: "shipByDate", width: 200 },
    {
      field: "orderTotal",
      //   headerName: "Action",
      width: 200,
    },
    {
      field: "Notes",
      //   headerName: "Action",
      width: 200,
    },
  ];
  const [defaultColDef] = useState({
    editable: false,
    sortable: true,
    filter: false,
    selectable: false,
  });

  const detailCellRendererParams = () => {
    // console.log(params, "hhhhhh");
    return {
      detailGridOptions: {
        // autoGroupColumnDef: {
        //   headerName: "Warehouse",
        // },
        columnDefs: [
          //   {
          //     field: "primaryImageUrl",
          //     headerName: "Image",
          //     headerTooltip: "Image",
          //     width: 100,
          //     cellStyle: (params) => {
          //       //mark police cells as red
          //       return {
          //         display: "flex",
          //         justifyContent: "center",
          //         alignItems: "center",
          //       };
          //     },
          //     cellRenderer: ({ value }) => {
          //       return (
          //         <img alt="" style={{ width: 30, height: 30 }} src={value} />
          //       );
          //     },
          //   },
          { field: "sku", flex: 1 },
          { field: "qty", flex: 1 },
          //   { field: "orderedQty", flex: 1 },
        ],
        // autoSizeStrategy: {
        //   type: "fitCellContents",
        // },
        // defaultColDef: {
        //   flex: 1,
        // },
      },
      getDetailRowData: (params) => {
        // console.log({ params });
        params.successCallback(params?.data?.products);
      },
    };
  };

  const getOrders = async () => {
    await axios
      .get(`${nodeAPIUrl}/orders/get-all`)
      .then((response) => response.data)
      .then((result) => {
        if (result?.data && result?.data?.length) {
          setRowData(result?.data);
        } else {
          setRowData([]);
        }
      })
      .catch((error) => {
        setRowData([]);
        console.error("Error fetching data:", error);
      });
  };

  useEffect(() => {
    getOrders();
  }, []);

  return (
    <Card className="w-full h-[90%] relative">
      <div
        className="absolute"
        style={{ top: 0, bottom: 0, left: 0, right: 0 }}
      >
        <div className="ag-theme-quartz h-full p-4">
          <AgGridReact
            // ref={gridApi}
            rowData={rowData}
            rowSelection="single"
            defaultColDef={defaultColDef}
            columnDefs={colDefs}
            masterDetail={true}
            detailCellRendererParams={detailCellRendererParams}
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
